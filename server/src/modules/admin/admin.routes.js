import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { supabase } from '../../config/supabase.js';
import { isFourWheelerClass, canQuoteBooking, canAssignBooking, canTransitionTrip } from './admin.policy.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));
router.use(async (req,res,next)=>{ try { const {data,error}=await supabase.from('admins').select('id,display_name,active').eq('profile_id',req.user.id).maybeSingle(); if(error) throw error; if(!data?.active) return res.status(403).json({error:'Admin access is not active.'}); req.admin=data; return next(); } catch(error){ return next(error); } });

const uuid = z.string().uuid();
const quoteSchema = z.object({ fare: z.coerce.number().finite().min(0).max(1000000) });
const assignSchema = z.object({
  vehicleId: uuid,
  driverId: uuid,
  rideEndAt: z.string().datetime(),
});
const statusSchema = z.object({
  status: z.enum(['started','completed','cancelled']),
  note: z.string().trim().max(300).optional().default(''),
});

async function audit(booking, actorId, status, note='') {
  const { error } = await supabase.from('booking_events').insert({
    booking_id: booking.id, actor_profile_id: actorId,
    from_status: booking.status, to_status: status, note: note || null,
  });
  if (error) throw error;
}

router.get('/me', (req,res) => res.json({ok:true,admin:req.admin}));

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [bookings, owners, drivers, vehicles] = await Promise.all([
      supabase.from('bookings').select('id,reference,customer_name,customer_phone,pickup,destination,ride_at,ride_end_at,passengers,trip_type,status,quoted_fare,vehicle_id,driver_id,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('owners').select('id,business_name,verification_status,profile_id,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('drivers').select('id,full_name,phone,verification_status,active,owner_id').order('created_at',{ascending:false}).limit(100),
      supabase.from('vehicles').select('id,vehicle_name,registration_number,seats,vehicle_class,status,base_fare,owner_id,driver_id').order('created_at',{ascending:false}).limit(100),
    ]);
    for (const result of [bookings,owners,drivers,vehicles]) if (result.error) throw result.error;
    const rows=bookings.data||[];
    return res.json({ok:true,stats:{
      totalBookings:rows.length, newRequests:rows.filter(x=>x.status==='requested').length,
      awaitingAcceptance:rows.filter(x=>x.status==='quoted').length,
      activeTrips:rows.filter(x=>['assigned','started'].includes(x.status)).length,
      pendingOwners:(owners.data||[]).filter(x=>x.verification_status==='pending').length,
      pendingVehicles:(vehicles.data||[]).filter(x=>x.status==='pending').length,
    },bookings:rows,owners:owners.data||[],drivers:drivers.data||[],vehicles:vehicles.data||[]});
  } catch (error) { return next(error); }
});

router.patch('/bookings/:id/quote', async (req,res,next) => {
  try {
    if (!uuid.safeParse(req.params.id).success) return res.status(400).json({error:'Invalid booking id.'});
    const parsed=quoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({error:'Valid fare amount required.'});
    const {data:before,error:readError}=await supabase.from('bookings').select('id,status').eq('id',req.params.id).maybeSingle();
    if(readError) throw readError;
    if(!before) return res.status(404).json({error:'Booking not found.'});
    if(!canQuoteBooking(before.status)) return res.status(409).json({error:'Only new requests can receive a fare quote.'});
    const {data,error}=await supabase.from('bookings').update({quoted_fare:parsed.data.fare,status:'quoted',quoted_at:new Date().toISOString(),admin_id:req.admin.id}).eq('id',req.params.id).eq('status','requested').select('id,reference,status,quoted_fare').maybeSingle();
    if(error) throw error;
    if(!data) return res.status(409).json({error:'Booking changed. Refresh and try again.'});
    await audit({...before,status:'requested'},req.user.id,'quoted','Fare quoted: '+parsed.data.fare);
    return res.json({ok:true,booking:data});
  } catch(error){return next(error);}
});

router.patch('/bookings/:id/assign', async(req,res,next)=>{
  try{
    if(!uuid.safeParse(req.params.id).success) return res.status(400).json({error:'Invalid booking id.'});
    const parsed=assignSchema.safeParse(req.body);
    if(!parsed.success) return res.status(400).json({error:'Vehicle, driver and expected trip end are required.'});
    const {data:before,error:readError}=await supabase.from('bookings').select('id,status,ride_at,passengers').eq('id',req.params.id).maybeSingle();
    if(readError) throw readError;
    if(!before) return res.status(404).json({error:'Booking not found.'});
    if(!canAssignBooking(before.status)) return res.status(409).json({error:'Customer must accept the fare before assignment.'});
    const end=new Date(parsed.data.rideEndAt), start=new Date(before.ride_at);
    if(end<=start) return res.status(400).json({error:'Trip end must be after pickup time.'});
    const [vehicle,driver]=await Promise.all([
      supabase.from('vehicles').select('id,seats,status,vehicle_class,owner_id').eq('id',parsed.data.vehicleId).eq('status','active').maybeSingle(),
      supabase.from('drivers').select('id,active,verification_status,owner_id').eq('id',parsed.data.driverId).eq('active',true).eq('verification_status','verified').maybeSingle(),
    ]);
    if(vehicle.error) throw vehicle.error; if(driver.error) throw driver.error;
    if(!vehicle.data || !isFourWheelerClass(vehicle.data.vehicle_class)) return res.status(400).json({error:'Only verified four-wheelers can be assigned.'});
    if(vehicle.data.seats<before.passengers) return res.status(400).json({error:'Vehicle passenger capacity is too small.'});
    if(!driver.data) return res.status(400).json({error:'Driver is not verified or active.'});
    const {data,error}=await supabase.from('bookings').update({
      vehicle_id:parsed.data.vehicleId,driver_id:parsed.data.driverId,ride_end_at:end.toISOString(),
      status:'assigned',admin_id:req.admin.id,
    }).eq('id',req.params.id).eq('status','accepted').select('id,reference,status,vehicle_id,driver_id,ride_end_at').maybeSingle();
    if(error?.code==='23P01') return res.status(409).json({error:'Vehicle or driver already has an overlapping trip.'});
    if(error) throw error;
    if(!data) return res.status(409).json({error:'Booking changed. Refresh and try again.'});
    await audit({...before,status:'accepted'},req.user.id,'assigned','Vehicle and driver assigned.');
    return res.json({ok:true,booking:data});
  }catch(error){return next(error);}
});

router.patch('/bookings/:id/status',async(req,res,next)=>{
  try{
    if(!uuid.safeParse(req.params.id).success) return res.status(400).json({error:'Invalid booking id.'});
    const parsed=statusSchema.safeParse(req.body);
    if(!parsed.success) return res.status(400).json({error:'Invalid trip status.'});
    const {data:before,error:readError}=await supabase.from('bookings').select('id,status').eq('id',req.params.id).maybeSingle();
    if(readError) throw readError;
    if(!before) return res.status(404).json({error:'Booking not found.'});
    if(!canTransitionTrip(before.status,parsed.data.status)) return res.status(409).json({error:'This status transition is not allowed.'});
    const {data,error}=await supabase.from('bookings').update({status:parsed.data.status,cancellation_reason:parsed.data.status==='cancelled'?parsed.data.note:null,admin_id:req.admin.id}).eq('id',req.params.id).eq('status',before.status).select('id,reference,status').maybeSingle();
    if(error) throw error;
    if(!data) return res.status(409).json({error:'Booking changed. Refresh and try again.'});
    await audit(before,req.user.id,parsed.data.status,parsed.data.note);
    return res.json({ok:true,booking:data});
  }catch(error){return next(error);}
});

router.patch('/owners/:id/verification',async(req,res,next)=>{
  try{
    if(!uuid.safeParse(req.params.id).success) return res.status(400).json({error:'Invalid owner id.'});
    const parsed=z.object({status:z.enum(['verified','rejected','suspended'])}).safeParse(req.body);
    if(!parsed.success) return res.status(400).json({error:'Invalid verification status.'});
    const {data,error}=await supabase.from('owners').update({verification_status:parsed.data.status}).eq('id',req.params.id).select('id,verification_status').maybeSingle();
    if(error) throw error; if(!data) return res.status(404).json({error:'Owner not found.'});
    return res.json({ok:true,owner:data});
  }catch(error){return next(error);}
});

router.patch('/vehicles/:id/approval',async(req,res,next)=>{
  try{
    if(!uuid.safeParse(req.params.id).success) return res.status(400).json({error:'Invalid vehicle id.'});
    const parsed=z.object({status:z.enum(['active','inactive','rejected','maintenance']),vehicleClass:z.enum(['hatchback','sedan','suv','muv','van','luxury'])}).safeParse(req.body);
    if(!parsed.success) return res.status(400).json({error:'Vehicle class and status are required.'});
    const {data,error}=await supabase.from('vehicles').update({status:parsed.data.status,vehicle_class:parsed.data.vehicleClass}).eq('id',req.params.id).select('id,status,vehicle_class').maybeSingle();
    if(error) throw error; if(!data) return res.status(404).json({error:'Vehicle not found.'});
    return res.json({ok:true,vehicle:data});
  }catch(error){return next(error);}
});

router.post('/drivers',async(req,res,next)=>{
  try{
    const parsed=z.object({ownerId:uuid,fullName:z.string().trim().min(2).max(100),phone:z.string().regex(/^[6-9][0-9]{9}$/)}).safeParse(req.body);
    if(!parsed.success) return res.status(400).json({error:'Owner, driver name and valid mobile number are required.'});
    const {data,error}=await supabase.from('drivers').insert({owner_id:parsed.data.ownerId,full_name:parsed.data.fullName,phone:parsed.data.phone,verification_status:'verified',active:true}).select('id,owner_id,full_name,phone,verification_status,active').single();
    if(error?.code==='23505') return res.status(409).json({error:'Driver already exists.'});
    if(error) throw error;
    return res.status(201).json({ok:true,driver:data});
  }catch(error){return next(error);}
});

export default router;
