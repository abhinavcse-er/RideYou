import { supabase } from '../../config/supabase.js';
import { hashPassword,verifyPassword,createSessionToken,hashSessionToken } from './customer.password.js';
function unavailable(){const e=new Error('Customer account service abhi available nahi hai.');e.status=503;return e;}
export async function getOrCreateCustomer({name,phone,password}){
 if(!supabase)throw unavailable();
 const {data:existing,error:lookupError}=await supabase.from('customer_accounts').select('id,full_name,phone,password_hash').eq('phone',phone).maybeSingle();
 if(lookupError)throw lookupError;
 if(existing){if(!(await verifyPassword(password,existing.password_hash))){const e=new Error('Is mobile number ka account pehle se hai. Sahi password enter karein.');e.status=401;throw e;}return existing;}
 const passwordHash=await hashPassword(password);
 const {data:created,error}=await supabase.from('customer_accounts').insert({full_name:name,phone,password_hash:passwordHash}).select('id,full_name,phone,password_hash').single();
 if(!error)return created;
 if(error.code==='23505'){const {data:race}=await supabase.from('customer_accounts').select('id,full_name,phone,password_hash').eq('phone',phone).maybeSingle();if(race&&await verifyPassword(password,race.password_hash))return race;}
 throw error;
}
export async function loginCustomer(phone,password){
 if(!supabase)throw unavailable();
 const {data:customer,error}=await supabase.from('customer_accounts').select('id,full_name,phone,password_hash').eq('phone',phone).maybeSingle();
 if(error)throw error;
 if(!customer||!(await verifyPassword(password,customer.password_hash))){const e=new Error('Mobile number ya password sahi nahi hai.');e.status=401;throw e;}
 return customer;
}
export async function issueCustomerSession(customerId){
 const token=createSessionToken(),expiresAt=new Date(Date.now()+30*24*60*60*1000).toISOString();
 const {error}=await supabase.from('customer_sessions').insert({customer_account_id:customerId,token_hash:hashSessionToken(token),expires_at:expiresAt});
 if(error)throw error;
 return {token,expiresAt};
}
export async function findCustomerSession(token){
 if(!supabase||!token)return null;
 const {data,error}=await supabase.from('customer_sessions').select('id,customer_account_id,expires_at,customer_accounts(id,full_name,phone)').eq('token_hash',hashSessionToken(token)).gt('expires_at',new Date().toISOString()).maybeSingle();
 if(error)throw error;
 return data;
}
export async function listCustomerBookings(customerId){
 const {data,error}=await supabase.from('bookings').select('reference,pickup,destination,ride_at,status,quoted_fare,passengers,trip_type,vehicles(vehicle_name,vehicle_class,registration_number),drivers(full_name)').eq('customer_account_id',customerId).order('created_at',{ascending:false}).limit(50);
 if(error)throw error;
 return data||[];
}
