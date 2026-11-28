export const money = value => value == null ? 'Fare confirm hoga' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
export const formatDate = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
export const initialBooking = { name: '', phone: '', password: '', pickup: '', destination: '', rideDate: '', rideTime: '', passengers: 1, tripType: 'local', note: '' };
