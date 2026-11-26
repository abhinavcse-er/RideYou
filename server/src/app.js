import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDatabaseConfigured } from './config/supabase.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
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

app.use('/api/bookings', bookingRoutes);
app.use('/api', notFoundHandler);
app.use(errorHandler);

export default app;
