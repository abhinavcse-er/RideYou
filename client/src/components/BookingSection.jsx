import BookingForm from './BookingForm.jsx';
export default function BookingSection({booking,setBooking,chosen,submitBooking,error,notice,reference,selected,submitting,customerToken,customerUser}){
 return <section className="booking-section" id="booking"><div className="booking-grid section-wrap">
  <div className="booking-copy"><span className="eyebrow">PLAN YOUR JOURNEY</span><h2>Your trip,<br/><em>your way.</em></h2>
   <p>{chosen?chosen.vehicle_name:'Choose an available four-wheeler, add your route and confirm the fare with RideYou.'}</p>
   <div className="booking-assurance"><span>✓</span><div><strong>No advance online payment</strong><small>RideYou Admin checks availability and confirms the final fare.</small></div></div>
  </div>
  <BookingForm booking={booking} setBooking={setBooking} chosen={chosen} submitBooking={submitBooking} error={error} notice={notice} reference={reference} selected={selected} submitting={submitting} customerToken={customerToken} customerUser={customerUser}/>
 </div></section>;
}
