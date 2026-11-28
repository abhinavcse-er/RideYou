import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { supabase } from '../../config/supabase.js';

const router=Router();
const acceptLimiter=rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many attempts. Please try again later.'}});
router.post('/:reference/accept',acceptLimiter,async(req,res,next)=>{
  try{
    const parsed=z.object({phone:z.string().regex(/^[6-9][0-9]{9}$/)}).safeParse(req.body);
    if(!parsed.success) return res.status(400).json({error:'Registered mobile number required.'});
    const {data,error}=await supabase.from('bookings').update({status:'accepted',accepted_at:new Date().toISOString()})
      .eq('reference',req.params.reference).eq('customer_phone',parsed.data.phone).eq('status','quoted')
      .select('id,reference,status,quoted_fare').maybeSingle();
    if(error) throw error;
    if(!data) return res.status(404).json({error:'Quoted booking not found or fare already accepted.'});
    const {error:auditError}=await supabase.from('booking_events').insert({
      booking_id:data.id,from_status:'quoted',to_status:'accepted',note:'Customer accepted the quoted fare.'
    });
    if(auditError) throw auditError;
    return res.json({ok:true,booking:{reference:data.reference,status:data.status,quoted_fare:data.quoted_fare}});
  }catch(error){return next(error);}
});
export default router;
