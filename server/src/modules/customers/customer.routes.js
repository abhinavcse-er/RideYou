import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { postCustomerLogin,getCustomerBookings } from './customer.controller.js';
import { requireCustomer } from './customer.middleware.js';
const router=Router();
const loginLimiter=rateLimit({windowMs:15*60*1000,limit:8,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Bahut attempts hue. 15 minute baad try karein.'}});
router.post('/login',loginLimiter,postCustomerLogin);
router.get('/bookings',requireCustomer,getCustomerBookings);
export default router;
