import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDatabaseConfigured } from './config/supabase.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import mediatorRoutes from './modules/mediators/mediator.routes.js';
import ownerRoutes from './modules/owners/owner.routes.js';
import vehicleRoutes from './modules/vehicles/vehicle.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
}));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'rideyou-api',
    databaseConfigured: isDatabaseConfigured,
    environment: env.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/mediators', mediatorRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', notFoundHandler);
app.use(errorHandler);

export default app;
