import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { supabase } from '../../config/supabase.js';

const router = Router();
const registrationLimiter=rateLimit({windowMs:60*60*1000,limit:5,standardHeaders:'draft-7',legacyHeaders:false});
const ownerRegistration=z.object({
  fullName:z.string().trim().min(2).max(100),
  businessName:z.string().trim().min(2).max(100),
  email:z.string().trim().email().max(254),
  phone:z.string().regex(/^[6-9][0-9]{9}$/),
});
const vehicleInput = z.object({
  vehicleName: z.string().trim().min(2).max(100),
  vehicleClass: z.enum(['hatchback','sedan','suv','muv','van','luxury']),
  registrationNumber: z.string().trim().min(5).max(20).regex(/^[A-Za-z0-9 -]+$/),
  seats: z.coerce.number().int().min(4).max(12),
  driverId: z.string().uuid().optional().nullable(),
  baseFare: z.coerce.number().min(0).max(1000000).optional().nullable(),
});
async function getOwner(profileId) {
 const {data,error}=await supabase.from('owners').select('id,business_name,verification_status').eq('profile_id',profileId).maybeSingle();
 if(error)throw error;
 return data;
}

// Owner registration is completed only after Supabase has verified the supplied email OTP.
// The mobile number is retained as the partner contact number; email is the verified identity.
router.post('/register',registrationLimiter,async(req,res,next)=>{
 try{
  if(!supabase)return res.status(503).json({error:'Authentication service is not configured.'});
  const parsed=ownerRegistration.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Name, business name, email aur 10-digit mobile number check karein.'});
  const header=String(req.headers.authorization||'');
  const token=header.startsWith('Bearer ')?header.slice(7):'';
  if(!token)return res.status(401).json({error:'Email OTP verify karna zaroori hai.'});
  const {data:userData,error:authError}=await supabase.auth.getUser(token);
  if(authError||!userData?.user)return res.status(401).json({error:'Verified email session invalid ya expire ho gaya.'});
  const verifiedEmail=String(userData.user.email||'').toLowerCase();
  if(verifiedEmail!==parsed.data.email.toLowerCase())return res.status(403).json({error:'Verified email aur registration email match nahi karte.'});
  const {data:profile,error:profileError}=await supabase.from('profiles').select('id,role').eq('id',userData.user.id).maybeSingle();
  if(profileError)throw profileError;
  if(profile&&profile.role!=='owner')return res.status(409).json({error:'Ye email kisi doosre RideYou account role se linked hai.'});
  if(!profile){
   const {error}=await supabase.from('profiles').insert({id:userData.user.id,full_name:parsed.data.fullName,phone:parsed.data.phone,role:'owner'});
   if(error&&error.code!=='23505')throw error;
  }
  let owner=await getOwner(userData.user.id);
  if(!owner){
   const {data:created,error}=await supabase.from('owners').insert({profile_id:userData.user.id,business_name:parsed.data.businessName,verification_status:'pending'})
    .select('id,business_name,verification_status').single();
   if(error&&error.code!=='23505')throw error;
   owner=created||await getOwner(userData.user.id);
  }
  if(!owner)return res.status(500).json({error:'Owner profile create nahi ho paya. Dobara try karein.'});
  return res.status(201).json({ok:true,owner,message:'Owner account register ho gaya hai. Verification ke baad gaadi add kar sakte hain.'});
 }catch(error){return next(error);}
});

router.get('/me',requireAuth,requireRole('owner'),async(req,res,next)=>{
 try{const owner=await getOwner(req.user.id);if(!owner)return res.status(403).json({error:'Owner profile is not configured.'});return res.json({ok:true,owner});}
 catch(error){return next(error);}
});
router.get('/vehicles',requireAuth,requireRole('owner'),async(req,res,next)=>{
 try{
  const owner=await getOwner(req.user.id);if(!owner)return res.status(403).json({error:'Owner profile is not configured.'});
  const {data,error}=await supabase.from('vehicles').select('id,vehicle_name,vehicle_class,registration_number,seats,photo_path,base_fare,status,created_at,driver_id').eq('owner_id',owner.id).order('created_at',{ascending:false});
  if(error)throw error;return res.json({ok:true,vehicles:data||[]});
 }catch(error){return next(error);}
});
router.post('/vehicles',requireAuth,requireRole('owner'),async(req,res,next)=>{
 try{
  const parsed=vehicleInput.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Sirf four-wheeler details submit karein.',details:parsed.error.flatten().fieldErrors});
  const owner=await getOwner(req.user.id);
  if(!owner)return res.status(403).json({error:'Owner profile is not configured.'});
  if(owner.verification_status!=='verified')return res.status(403).json({error:'Vehicle add karne se pehle owner verification complete hona zaroori hai.'});
  const input=parsed.data;
  if(input.driverId){
   const {data:driver,error:driverError}=await supabase.from('drivers').select('id').eq('id',input.driverId).eq('owner_id',owner.id).eq('active',true).maybeSingle();
   if(driverError)throw driverError;if(!driver)return res.status(400).json({error:'Selected driver aapke account se linked nahi hai.'});
  }
  const {data,error}=await supabase.from('vehicles').insert({
   owner_id:owner.id,driver_id:input.driverId||null,vehicle_name:input.vehicleName,vehicle_class:input.vehicleClass,
   registration_number:input.registrationNumber.replace(/\s+/g,'').toUpperCase(),seats:input.seats,base_fare:input.baseFare??null,status:'pending',
  }).select('id,vehicle_name,vehicle_class,registration_number,seats,base_fare,status,created_at').single();
  if(error){if(error.code==='23505')return res.status(409).json({error:'Ye registration number pehle se registered hai.'});throw error;}
  return res.status(201).json({ok:true,vehicle:data,message:'Four-wheeler verification ke liye submit ho gayi hai.'});
 }catch(error){return next(error);}
});
export default router;
