import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const isDatabaseConfigured = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

export const supabase = isDatabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'X-Application-Name': 'RideYou-API' } },
    })
  : null;
