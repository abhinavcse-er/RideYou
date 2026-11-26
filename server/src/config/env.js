import 'dotenv/config';

const requiredInProduction = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

export function validateEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
