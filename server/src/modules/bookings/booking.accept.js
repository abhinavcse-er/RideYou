import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { supabase } from '../../config/supabase.js';
import { requireCustomer } from '../customers/customer.middleware.js';

const router=Router();
const acceptLimiter=rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many attempts. Please try again later.'}});
router.post('/:reference/accept',acceptLimiter,requireCustomer,async(req,res,next)=>{
  try{
    const {data,error}=await supabase.rpc('customer_accept_booking_quote',{
      p_reference:req.params.reference,p_phone:req.customer.phone,
    });
    if(error?.code==='P0001')return res.status(404).json({error:'Quoted booking not found or fare already accepted.'});
    if(error)throw error;
    return res.json({ok:true,booking:{reference:data.reference,status:data.status,quoted_fare:data.quoted_fare}});
  }catch(error){return next(error);}
});
export default router;
