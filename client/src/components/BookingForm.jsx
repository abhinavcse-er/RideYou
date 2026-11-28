export default function BookingForm({booking,setBooking,chosen,submitBooking,error,notice,reference,selected,submitting,customerToken,customerUser}){
 return <form className="form" onSubmit={submitBooking}>
  <div className="form-title"><div><small>RIDE REQUEST</small><h3>Plan your journey</h3></div><span>01 / 01</span></div>
  {customerToken?<div className="booking-account-chip"><span>✓</span><div><b>{customerUser?.name||'Customer account active'}</b><small>{customerUser?.phone||'Signed in to RideYou'}</small></div><a href="#workspace">Account</a></div>:<div className="booking-auth-gate"><div><b>Customer account required</b><p>Register or sign in from the Account Centre before sending a booking request.</p></div><a href="#workspace">Open Account Centre <span>↗</span></a></div>}
  <label>Selected vehicle<input value={chosen?.vehicle_name||'Pehle gaadi select karein'} readOnly required/></label>
  <label>Pickup location<input value={booking.pickup} onChange={e=>setBooking(v=>({...v,pickup:e.target.value}))} maxLength="180" required placeholder="Village, landmark or address"/></label>
  <label>Destination<input value={booking.destination} onChange={e=>setBooking(v=>({...v,destination:e.target.value}))} maxLength="180" required placeholder="Destination / city name"/></label>
  <div className="two"><label>Travel date<input type="date" value={booking.rideDate} min={new Date().toLocaleDateString('en-CA')} onChange={e=>setBooking(v=>({...v,rideDate:e.target.value}))} required/></label><label>Pickup time<input type="time" value={booking.rideTime} onChange={e=>setBooking(v=>({...v,rideTime:e.target.value}))} required/></label></div>
  <div className="two"><label>Trip type<select value={booking.tripType} onChange={e=>setBooking(v=>({...v,tripType:e.target.value}))}><option value="local">Local</option><option value="outstation">Outstation</option></select></label><label>Passengers<select value={booking.passengers} onChange={e=>setBooking(v=>({...v,passengers:Number(e.target.value)}))}>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}</select></label></div>
  <label>Additional note (optional)<textarea value={booking.note} onChange={e=>setBooking(v=>({...v,note:e.target.value}))} maxLength="500" rows="2" placeholder="Any important information…"/></label>
  {error&&<div className="notice error" role="alert">{error}</div>}{notice&&<div className="notice success" role="status">{notice}</div>}
  {reference&&<div className="reference-card"><small>YOUR BOOKING REFERENCE</small><strong>{reference}</strong><span>Is reference ko sambhal kar rakhein.</span></div>}
  <button className="submit" disabled={!selected||submitting||!customerToken}>{submitting?'Request bheji ja rahi hai…':'Send booking request'} <span>↗</span></button>
  <small className="privacy">Your request is saved to your RideYou account. Owner and driver personal numbers are never shown publicly.</small>
 </form>;
}
