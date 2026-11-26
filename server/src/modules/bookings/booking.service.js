import { randomBytes } from 'node:crypto';
import { supabase } from '../../config/supabase.js';

export async function createPublicBooking(data) {
  if (!supabase) {
    const error = new Error('Booking service is not configured.');
    error.status = 503;
    throw error;
  }

  const rideAt = new Date(`${data.rideDate}T${data.rideTime}:00+05:30`);
  if (Number.isNaN(rideAt.getTime()) || rideAt.getTime() < Date.now() + 30 * 60 * 1000) {
    const error = new Error('Ride kam se kam 30 minute baad ke liye book karein.');
    error.status = 400;
    throw error;
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id, seats, status')
    .eq('id', data.vehicleId)
    .eq('status', 'active')
    .maybeSingle();
  if (vehicleError) throw vehicleError;
  if (!vehicle || vehicle.seats < data.passengers) {
    const error = new Error('Selected gaadi ab available nahi hai ya passenger capacity kam hai.');
    error.status = 409;
    throw error;
  }

  const reference = `RY-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
  const { error } = await supabase.from('bookings').insert({
    reference,
    vehicle_id: data.vehicleId,
    customer_name: data.name,
    customer_phone: data.phone,
    pickup: data.pickup,
    destination: data.destination,
    ride_at: rideAt.toISOString(),
    passengers: data.passengers,
    trip_type: data.tripType,
    customer_note: data.note || null,
    status: 'requested',
  });

  if (error) {
    console.error('Booking insert failed:', error.code || 'database_error');
    const saveError = new Error('Booking save nahi ho payi. Kripya dobara try karein.');
    saveError.status = 500;
    throw saveError;
  }

  return { reference };
}
