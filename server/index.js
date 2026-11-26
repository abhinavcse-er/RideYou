import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 4000);
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim());
const ready = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const db = ready ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed')); } }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/bookings', rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false }));

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  pickup: z.string().trim().min(2).max(180),
  destination: z.string().trim().min(2).max(180),
  rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rideTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  passengers: z.coerce.number().int().min(1).max(8),
  tripType: z.enum(['local','outstation']),
  note: z.string().trim().max(500).optional().default('')
});

app.get('/api/health', (_req,res) => res.json({ ok:true, service:'rideyou-api', databaseConfigured:ready }));

app.post('/api/bookings', async (req,res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'Kripya form ki details check karein.' });
  if (!db) return res.status(503).json({ error:'Booking service abhi setup ho rahi hai. Kripya baad mein try karein.' });
  const d = parsed.data;
  const rideAt = new Date(`${d.rideDate}T${d.rideTime}:00+05:30`);
  if (Number.isNaN(rideAt.getTime()) || rideAt.getTime() < Date.now() + 30*60*1000) {
    return res.status(400).json({ error:'Ride kam se kam 30 minute baad ke liye book karein.' });
  }
  const reference = `RY-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
  const { error } = await db.from('bookings').insert({
    reference, customer_name:d.name, customer_phone:d.phone, pickup:d.pickup,
    destination:d.destination, ride_at:rideAt.toISOString(), passengers:d.passengers,
    trip_type:d.tripType, customer_note:d.note || null, status:'requested'
  });
  if (error) {
    console.error('Booking insert failed:', error.code || 'database_error');
    return res.status(500).json({ error:'Booking save nahi ho payi. Kripya dobara try karein.' });
  }
  return res.status(201).json({ ok:true, reference });
});

app.use((err,_req,res,_next) => {
  if (err.message === 'Origin not allowed') return res.status(403).json({ error:'Request origin not allowed.' });
  console.error('API error:',err.message);
  return res.status(500).json({ error:'Server mein dikkat aa gayi.' });
});
app.listen(port, () => console.log(`RideYou API listening on ${port}; Supabase configured: ${ready}`));
