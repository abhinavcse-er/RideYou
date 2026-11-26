import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  const { id, full_name, phone, role } = req.user.profile;
  res.json({ ok: true, user: { id, fullName: full_name, phone, role } });
});

export default router;
