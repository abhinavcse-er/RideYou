import { useState } from 'react';
import { formatDate,money } from '../../utils/format.js';

export default function CustomerPortal({customerToken,customerBookings,customerBusy,customerError,customerUser,customerLogin,setCustomerLogin,loginCustomer,logoutCustomer,loadCustomerBookings,acceptCustomerQuote,reference}){
 const [showPassword,setShowPassword]=useState(false);
 return <div className="account-panel customer-portal">
  <div className="panel-title"><div><span className="panel-kicker">MY RIDEYOU</span><h3>{customerToken?'Your journeys':'Welcome back'}</h3><p>{customerToken?'Aapki saari bookings ek secure account mein.':'Mobile number aur password se apni bookings access karein.'}</p></div><span className="panel-icon">↗</span></div>
  {customerToken?<><div className="customer-account-bar"><div><small>LOGGED IN AS</small><strong>{customerUser?.name||'RideYou Customer'}</strong><span>{customerUser?.phone||'Your account'}</span></div><button className="mini" type="button" onClick={logoutCustomer}>Logout</button></div>
   {reference&&<div className="notice success">New booking request: <strong>{reference}</strong></div>}
   <div className="customer-booking-heading"><div><b>Booking history</b><small>{customerBookings.length} saved {customerBookings.length===1?'journey':'journeys'}</small></div><button className="mini" type="button" onClick={()=>loadCustomerBookings()} disabled={customerBusy}>{customerBusy?'Loading…':'Refresh'}</button></div>
   {customerError&&<div className="notice error">{customerError}</div>}
   {customerBookings.length?customerBookings.map(item=><article className="ride-card customer-ride" key={item.reference}><div className="ride-card-head"><span className="panel-kicker">{item.reference}</span><span className="ride-status">{item.status}</span></div><strong>{item.pickup} <span>→</span> {item.destination}</strong><div className="customer-ride-meta"><span>{formatDate(item.ride_at)}</span><span>{item.passengers} passenger(s)</span><span>{item.trip_type}</span></div>{item.quoted_fare!=null&&<><b className="customer-fare">{money(item.quoted_fare)}</b>{item.status==='quoted'&&<button className="mini primary" type="button" onClick={()=>acceptCustomerQuote(item.reference)}>Accept fare & confirm</button>}</>}{item.vehicles&&<small>Vehicle: {item.vehicles.vehicle_name} · {item.vehicles.registration_number}</small>}{item.drivers&&<small>Driver: {item.drivers.full_name}</small>}</article>):<div className="empty customer-empty">{customerBusy?'Aapki bookings load ho rahi hain.':'Abhi koi booking nahi hai. Pehli ride book karte hi yahan dikh jayegi.'}</div>}
  </>:<form className="owner-form customer-login-form" onSubmit={loginCustomer}>
   <label>Registered mobile number<input value={customerLogin.phone} onChange={e=>setCustomerLogin(v=>({...v,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} required pattern="[6-9][0-9]{9}" inputMode="numeric" placeholder="10-digit mobile number" autoComplete="tel"/></label>
   <label>Password<div className="password-input-wrap"><input type={showPassword?'text':'password'} value={customerLogin.password} onChange={e=>setCustomerLogin(v=>({...v,password:e.target.value}))} required minLength="8" autoComplete="current-password" placeholder="Your account password"/><button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button></div></label>
   {customerError&&<div className="notice error">{customerError}</div>}
   <button className="submit" disabled={customerBusy}>{customerBusy?'Please wait…':'Login to my account'} <span>↗</span></button>
   <p className="account-helper">Naye customer? Booking form fill karke password create karein. Account automatically ban jayega. SMS OTP ki zaroorat nahi.</p>
  </form>}
 </div>;
}
