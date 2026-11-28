import { z } from 'zod';
import { issueCustomerSession,loginCustomer,listCustomerBookings } from './customer.service.js';
const loginSchema=z.object({phone:z.string().regex(/^[6-9]\d{9}$/),password:z.string().min(8).max(128)});
export async function postCustomerLogin(req,res,next){
 const parsed=loginSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:'Mobile number aur password check karein.'});
 try{const customer=await loginCustomer(parsed.data.phone,parsed.data.password);const session=await issueCustomerSession(customer.id);return res.json({ok:true,token:session.token,expiresAt:session.expiresAt,customer:{name:customer.full_name,phone:customer.phone}});}catch(error){return next(error);}
}
export async function getCustomerBookings(req,res,next){
 try{const bookings=await listCustomerBookings(req.customer.id);return res.json({ok:true,bookings});}catch(error){return next(error);}
}
