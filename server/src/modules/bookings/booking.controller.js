import { createBookingSchema } from './booking.schema.js';
import { createPublicBooking } from './booking.service.js';
import { getOrCreateCustomer, issueCustomerSession } from '../customers/customer.service.js';

export async function postBooking(req, res, next) {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Kripya form ki details check karein.',
      fields: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
  }

  try {
    const customer = await getOrCreateCustomer(parsed.data);
    const result = await createPublicBooking(parsed.data, customer.id);
    const session = await issueCustomerSession(customer.id);
    return res.status(201).json({ ok: true, ...result, token: session.token, expiresAt: session.expiresAt, customer: { name: customer.full_name, phone: customer.phone } });
  } catch (error) {
    return next(error);
  }
}


export async function getBookingStatus(req, res, next) {
  const reference = String(req.params.reference || '').trim();
  const phone = String(req.query.phone || '').trim();
  if (!/^RY-[A-Z0-9-]{5,40}$/.test(reference) || !/^[6-9][0-9]{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Booking reference aur mobile number check karein.' });
  }
  try {
    const { supabase } = await import('../../config/supabase.js');
    if (!supabase) return res.status(503).json({ error: 'Booking service is not configured.' });
    const { data, error } = await supabase.from('bookings')
      .select('reference, pickup, destination, ride_at, status, quoted_fare, passengers, trip_type, vehicles(vehicle_name,vehicle_class,registration_number), drivers(full_name)')
      .eq('reference', reference).eq('customer_phone', phone).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Is reference aur mobile se booking nahi mili.' });
    return res.json({ ok: true, booking: data });
  } catch (error) { return next(error); }
}
