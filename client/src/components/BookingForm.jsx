export default function BookingForm({ booking, setBooking, chosen, submitBooking, error, notice, reference, selected, submitting }) {
  return <form className="form" onSubmit={submitBooking}>
    <div className="form-title"><div><small>RIDE REQUEST</small><h3>Customer details</h3></div><span>01 / 01</span></div>
    <label>Selected vehicle<input value={chosen?.vehicle_name||'Pehle gaadi select karein'} readOnly required/></label>
    <div className="two"><label>Aapka naam<input value={booking.name} onChange={e=>setBooking(v=>({...v,name:e.target.value}))} minLength="2" maxLength="80" required placeholder="Jaise: Rahul Kumar"/></label><label>Mobile number<input value={booking.phone} onChange={e=>setBooking(v=>({...v,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} inputMode="numeric" pattern="[6-9][0-9]{9}" required placeholder="10-digit mobile"/></label></div>
    <label>Pickup kahan se hoga?<input value={booking.pickup} onChange={e=>setBooking(v=>({...v,pickup:e.target.value}))} maxLength="180" required placeholder="Gaon, landmark ya address"/></label>
    <label>Kahan jaana hai?<input value={booking.destination} onChange={e=>setBooking(v=>({...v,destination:e.target.value}))} maxLength="180" required placeholder="Destination / shehar ka naam"/></label>
    <div className="two"><label>Safar ki tareekh<input type="date" value={booking.rideDate} min={new Date().toLocaleDateString('en-CA')} onChange={e=>setBooking(v=>({...v,rideDate:e.target.value}))} required/></label><label>Pickup ka samay<input type="time" value={booking.rideTime} onChange={e=>setBooking(v=>({...v,rideTime:e.target.value}))} required/></label></div>
    <div className="two"><label>Safar ka type<select value={booking.tripType} onChange={e=>setBooking(v=>({...v,tripType:e.target.value}))}><option value="local">Local</option><option value="outstation">Outstation</option></select></label><label>Passengers<select value={booking.passengers} onChange={e=>setBooking(v=>({...v,passengers:Number(e.target.value)}))}>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}</select></label></div>
    <label>Extra baat (optional)<textarea value={booking.note} onChange={e=>setBooking(v=>({...v,note:e.target.value}))} maxLength="500" rows="2" placeholder="Koi zaroori jaankari…"/></label>
    {error&&<div className="notice error" role="alert">{error}</div>}{notice&&<div className="notice success" role="status">{notice}</div>}
    {reference&&<div className="reference-card"><small>YOUR BOOKING REFERENCE</small><strong>{reference}</strong><span>Is reference ko sambhal kar rakhein.</span></div>}
    <button className="submit" disabled={!selected||submitting}>{submitting?'Request bheji ja rahi hai…':'Booking request bhejein'} <span>↗</span></button>
    <small className="privacy">Aapki request secure server par save hoti hai. Owner aur driver ke personal numbers public nahi honge.</small>
  </form>;
}
