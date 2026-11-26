import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { postBooking, getBookingStatus } from './booking.controller.js';

const router = Router();

// Public booking requests are rate-limited to reduce spam and accidental floods.
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Bahut saari requests bheji gayi hain. Kripya 15 minute baad try karein.' },
});

router.get('/:reference', bookingLimiter, getBookingStatus);
router.post('/', bookingLimiter, postBooking);

export default router;
