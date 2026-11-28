import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDatabaseConfigured } from './config/supabase.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import bookingAcceptRoutes from './modules/bookings/booking.accept.js';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import ownerRoutes from './modules/owners/owner.routes.js';
import vehicleRoutes from './modules/vehicles/vehicle.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
const allowedClientOrigins = new Set([
  ...env.clientOrigins,
  'https://abhinavcse-er.github.io',
]);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedClientOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
}));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({
  ok: true, service: 'rideyou-api', databaseConfigured: isDatabaseConfigured,
  environment: env.nodeEnv,
}));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingAcceptRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', notFoundHandler);
app.use(errorHandler);
export default app;
