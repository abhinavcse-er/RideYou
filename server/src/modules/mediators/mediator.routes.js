import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { supabase } from '../../config/supabase.js';

const router = Router();

router.get('/me', requireAuth, requireRole('mediator'), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('mediators')
      .select('id, display_name, active')
      .eq('profile_id', req.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.active) return res.status(403).json({ error: 'Mediator access is inactive.' });
    return res.json({ ok: true, mediator: data });
  } catch (error) {
    return next(error);
  }
});

export default router;
