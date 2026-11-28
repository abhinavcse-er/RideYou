import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createSupportRequest } from './support.controller.js';
const router=Router();
const limiter=rateLimit({windowMs:60*60*1000,limit:5,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Bahut requests aa gayi hain. Thodi der baad try karein.'}});
router.post('/',limiter,createSupportRequest);
export default router;
