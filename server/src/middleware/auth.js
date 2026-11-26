import { supabase } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  if (!supabase) return res.status(503).json({ error: 'Authentication service is not configured.' });
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Login required.' });

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) return res.status(401).json({ error: 'Session invalid or expired.' });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (profileError || !profile) return res.status(403).json({ error: 'Account profile is not configured.' });
    req.user = { id: userData.user.id, email: userData.user.email, profile };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unable to verify login session.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.profile || !allowedRoles.includes(req.user.profile.role)) {
      return res.status(403).json({ error: 'You do not have permission for this action.' });
    }
    return next();
  };
}
