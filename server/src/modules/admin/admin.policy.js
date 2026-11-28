export const FOUR_WHEELER_CLASSES = Object.freeze(['hatchback','sedan','suv','muv','van','luxury']);
export const isFourWheelerClass = value => FOUR_WHEELER_CLASSES.includes(value);
export const canQuoteBooking = status => status === 'requested';
export const canAssignBooking = status => status === 'accepted';
const transitions = Object.freeze({ assigned:['started','cancelled'], started:['completed','cancelled'] });
export const canTransitionTrip = (from,to) => (transitions[from] || []).includes(to);
