import { z } from 'zod';

export const createBookingSchema = z.object({
  vehicleId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  pickup: z.string().trim().min(2).max(180),
  destination: z.string().trim().min(2).max(180),
  rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rideTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  passengers: z.coerce.number().int().min(1).max(8),
  tripType: z.enum(['local', 'outstation']).default('local'),
  note: z.string().trim().max(500).optional().default(''),
});
