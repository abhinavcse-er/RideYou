import BookingForm from './BookingForm.jsx';
export default function BookingSection({ booking, setBooking, chosen, submitBooking, error, notice, reference, selected, submitting }) {
  return <section className="booking-section" id="booking"><div className="booking-grid section-wrap">
    <div className="booking-copy"><span className="eyebrow">PLAN YOUR JOURNEY</span><h2>Your trip,<br/><em>your way.</em></h2>
      <p>{chosen ? chosen.vehicle_name : 'Pehle available vehicles mein se apni gaadi select karein.'}</p>
      <div className="booking-assurance"><span>✓</span><div><strong>No advance online payment</strong><small>Booking Team availability aur final fare confirm karegi.</small></div></div>
    </div>
    <BookingForm booking={booking} setBooking={setBooking} chosen={chosen} submitBooking={submitBooking} error={error} notice={notice} reference={reference} selected={selected} submitting={submitting}/>
  </div></section>;
}