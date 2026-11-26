import { Router } from 'express';
import { supabase } from '../../config/supabase.js';

const router = Router();

// Public catalogue deliberately exposes no owner or driver contact details.
router.get('/', async (_req, res, next) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Vehicle catalogue is not configured.' });
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, vehicle_name, seats, photo_path, base_fare')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return res.json({ ok: true, vehicles: data || [] });
  } catch (error) {
    return next(error);
  }
});

export default router;
