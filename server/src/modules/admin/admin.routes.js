import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { supabase } from '../../config/supabase.js';

const router = Router();
const bookingStatuses = ['requested', 'quoted', 'accepted', 'assigned', 'started', 'completed', 'cancelled'];
const updateSchema = z.object({
  quotedFare: z.coerce.number().finite().min(0).max(1000000).optional(),
  status: z.enum(bookingStatuses).optional(),
}).refine((value) => value.quotedFare !== undefined || value.status !== undefined, {
  message: 'At least one booking field is required.',
});

async function requireActiveAdmin(req, res) {
  const { data, error } = await supabase
    .from('mediators')
    .select('id, display_name, active')
    .eq('profile_id', req.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.active) {
    res.status(403).json({ error: 'Admin access is not active. Contact RideYou support.' });
    return null;
  }
  return data;
}

router.use(requireAuth, requireRole('admin'));

router.get('/me', async (req, res, next) => {
  try {
    const admin = await requireActiveAdmin(req, res);
    if (!admin) return;
    return res.json({ ok: true, admin: { id: admin.id, displayName: admin.display_name, role: 'admin' } });
  } catch (error) {
    return next(error);
  }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const admin = await requireActiveAdmin(req, res);
    if (!admin) return;
    const status = req.query.status ? String(req.query.status) : '';
    if (status && !bookingStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status filter.' });
    }
    let query = supabase.from('bookings')
      .select('id, reference, customer_name, customer_phone, pickup, destination, ride_at, passengers, trip_type, customer_note, status, quoted_fare, created_at, updated_at, vehicle_id')
      .order('created_at', { ascending: false })
      .limit(100);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ ok: true, bookings: data || [] });
  } catch (error) {
    return next(error);
  }
});

router.patch('/bookings/:id', async (req, res, next) => {
  try {
    const admin = await requireActiveAdmin(req, res);
    if (!admin) return;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Booking update check karein.', details: parsed.error.flatten().fieldErrors });
    }
    const patch = { updated_at: new Date().toISOString() };
    if (parsed.data.quotedFare !== undefined) patch.quoted_fare = parsed.data.quotedFare;
    if (parsed.data.status !== undefined) patch.status = parsed.data.status;
    if (patch.quoted_fare !== undefined && patch.status === undefined) patch.status = 'quoted';
    const { data, error } = await supabase.from('bookings')
      .update(patch)
      .eq('id', req.params.id)
      .select('id, reference, status, quoted_fare, updated_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Booking nahi mili.' });
    return res.json({ ok: true, booking: data });
  } catch (error) {
    return next(error);
  }
});

export default router;
