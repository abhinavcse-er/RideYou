import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { supabase } from '../../config/supabase.js';

const router = Router();

const vehicleInput = z.object({
  vehicleName: z.string().trim().min(2).max(100),
  registrationNumber: z.string().trim().min(5).max(20).regex(/^[A-Za-z0-9 -]+$/),
  seats: z.coerce.number().int().min(1).max(30),
  driverId: z.string().uuid().optional().nullable(),
  baseFare: z.coerce.number().min(0).max(1000000).optional().nullable(),
});

async function getOwner(profileId) {
  const { data, error } = await supabase
    .from('owners')
    .select('id, business_name, verification_status')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

router.get('/me', requireAuth, requireRole('owner'), async (req, res, next) => {
  try {
    const owner = await getOwner(req.user.id);
    if (!owner) return res.status(403).json({ error: 'Owner profile is not configured.' });
    return res.json({ ok: true, owner });
  } catch (error) {
    return next(error);
  }
});

router.get('/vehicles', requireAuth, requireRole('owner'), async (req, res, next) => {
  try {
    const owner = await getOwner(req.user.id);
    if (!owner) return res.status(403).json({ error: 'Owner profile is not configured.' });
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, vehicle_name, registration_number, seats, photo_path, base_fare, status, created_at, driver_id')
      .eq('owner_id', owner.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ ok: true, vehicles: data || [] });
  } catch (error) {
    return next(error);
  }
});

router.post('/vehicles', requireAuth, requireRole('owner'), async (req, res, next) => {
  try {
    const parsed = vehicleInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Vehicle details check karein.', details: parsed.error.flatten().fieldErrors });
    }

    const owner = await getOwner(req.user.id);
    if (!owner) return res.status(403).json({ error: 'Owner profile is not configured.' });
    if (owner.verification_status !== 'verified') {
      return res.status(403).json({ error: 'Vehicle add karne se pehle owner verification complete hona zaroori hai.' });
    }

    const input = parsed.data;
    if (input.driverId) {
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('id', input.driverId)
        .eq('owner_id', owner.id)
        .eq('active', true)
        .maybeSingle();
      if (driverError) throw driverError;
      if (!driver) return res.status(400).json({ error: 'Selected driver aapke account se linked nahi hai.' });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        owner_id: owner.id,
        driver_id: input.driverId || null,
        vehicle_name: input.vehicleName,
        registration_number: input.registrationNumber.replace(/\\s+/g, '').toUpperCase(),
        seats: input.seats,
        base_fare: input.baseFare ?? null,
        status: 'pending',
      })
      .select('id, vehicle_name, registration_number, seats, base_fare, status, created_at')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Ye registration number pehle se registered hai.' });
      throw error;
    }
    return res.status(201).json({ ok: true, vehicle: data, message: 'Vehicle verification ke liye submit ho gayi hai.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
