import { findCustomerSession } from './customer.service.js';
export async function requireCustomer(req,res,next){
 try{
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
  if(!token)return res.status(401).json({error:'Customer login required hai.'});
  const session=await findCustomerSession(token);
  if(!session)return res.status(401).json({error:'Session expire ho gaya. Dobara login karein.'});
  req.customer={id:session.customer_account_id,...session.customer_accounts};
  req.customerSessionId=session.id;
  return next();
 }catch(error){return next(error);}
}
