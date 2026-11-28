import { z } from 'zod';
import { registerCustomer,issueCustomerSession,loginCustomer,listCustomerBookings } from './customer.service.js';

const loginSchema=z.object({phone:z.string().regex(/^[6-9]\d{9}$/),password:z.string().min(8).max(128)});
const registerSchema=z.object({
 name:z.string().trim().min(2).max(80),
 phone:z.string().regex(/^[6-9]\d{9}$/),
 password:z.string().min(8).max(128),
});

export async function postCustomerRegister(req,res,next){
 const parsed=registerSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:'Name, 10-digit mobile number aur minimum 8-character password check karein.'});
 try{
  const customer=await registerCustomer(parsed.data);
  const session=await issueCustomerSession(customer.id);
  return res.status(201).json({ok:true,token:session.token,expiresAt:session.expiresAt,customer:{name:customer.full_name,phone:customer.phone}});
 }catch(error){return next(error);}
}

export async function postCustomerLogin(req,res,next){
 const parsed=loginSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:'Mobile number aur password check karein.'});
 try{const customer=await loginCustomer(parsed.data.phone,parsed.data.password);const session=await issueCustomerSession(customer.id);return res.json({ok:true,token:session.token,expiresAt:session.expiresAt,customer:{name:customer.full_name,phone:customer.phone}});}catch(error){return next(error);}
}
export async function getCustomerBookings(req,res,next){
 try{const bookings=await listCustomerBookings(req.customer.id);return res.json({ok:true,bookings});}catch(error){return next(error);}
}
