import { createBookingSchema } from './booking.schema.js';
import { createPublicBooking } from './booking.service.js';

export async function postBooking(req, res, next) {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Kripya form ki details check karein.',
      fields: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
  }

  try {
    const result = await createPublicBooking(parsed.data);
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}
