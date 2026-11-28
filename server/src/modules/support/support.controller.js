import { z } from 'zod';
import { supabase } from '../../config/supabase.js';

const supportSchema=z.object({
 requestType:z.enum(['account_help','admin_access']).default('account_help'),
 fullName:z.string().trim().min(2).max(100),
 phone:z.string().regex(/^[6-9]\d{9}$/).optional().or(z.literal('')),
 email:z.string().trim().email().max(254),
 subject:z.string().trim().min(3).max(120),
 message:z.string().trim().min(10).max(1200),
});
export async function createSupportRequest(req,res,next){
 const parsed=supportSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:'Name, email, subject aur message check karein.'});
 if(!supabase)return res.status(503).json({error:'Support service abhi configured nahi hai.'});
 try{
  const value=parsed.data;
  const {data,error}=await supabase.from('support_requests').insert({
   request_type:value.requestType,full_name:value.fullName,phone:value.phone||null,
   email:value.email.toLowerCase(),subject:value.subject,message:value.message,
  }).select('id,request_type,status,created_at').single();
  if(error)throw error;
  return res.status(201).json({ok:true,request:data,message:'Request RideYou support team ko bhej di gayi hai.'});
 }catch(error){return next(error);}
}
