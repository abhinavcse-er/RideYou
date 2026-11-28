import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../config/supabase.js';

const router=Router();
router.post('/:reference/accept',async(req,res,next)=>{
  try{
    const parsed=z.object({phone:z.string().regex(/^[6-9][0-9]{9}$/)}).safeParse(req.body);
    if(!parsed.success) return res.status(400).json({error:'Registered mobile number required.'});
    const {data,error}=await supabase.from('bookings').update({status:'accepted',accepted_at:new Date().toISOString()})
      .eq('reference',req.params.reference).eq('customer_phone',parsed.data.phone).eq('status','quoted')
      .select('reference,status,quoted_fare').maybeSingle();
    if(error) throw error;
    if(!data) return res.status(404).json({error:'Quoted booking not found or fare already accepted.'});
    return res.json({ok:true,booking:data});
  }catch(error){return next(error);}
});
export default router;
