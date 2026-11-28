import { useState } from 'react';
import { formatDate,money } from '../../utils/format.js';

export default function CustomerPortal({customerToken,customerBookings,customerBusy,customerError,customerUser,customerLogin,setCustomerLogin,loginCustomer,registerCustomer,logoutCustomer,loadCustomerBookings,acceptCustomerQuote,reference}){
 const [showPassword,setShowPassword]=useState(false);
 const [mode,setMode]=useState('register');
 const [registration,setRegistration]=useState({name:'',phone:'',password:''});
 const changeMode=(next)=>{setMode(next);setShowPassword(false);};
 return <div className="account-panel customer-portal">
  <div className="panel-title"><div><span className="panel-kicker">CUSTOMER ACCOUNT</span><h3>{customerToken?'Your journeys':mode==='register'?'Create your RideYou account':'Welcome back'}</h3><p>{customerToken?'Aapki bookings, fare updates aur trip details ek jagah.':mode==='register'?'Register first, then book and manage every ride from one dashboard.':'Registered mobile number aur password se sign in karein.'}</p></div><span className="panel-icon">↗</span></div>
  {customerToken?<><div className="customer-account-bar"><div><small>LOGGED IN AS</small><strong>{customerUser?.name||'RideYou Customer'}</strong><span>{customerUser?.phone||'Your account'}</span></div><button className="mini" type="button" onClick={logoutCustomer}>Sign out</button></div>
   {reference&&<div className="notice success">New booking request: <strong>{reference}</strong></div>}
   <div className="customer-booking-heading"><div><b>Booking history</b><small>{customerBookings.length} saved {customerBookings.length===1?'journey':'journeys'}</small></div><button className="mini" type="button" onClick={()=>loadCustomerBookings()} disabled={customerBusy}>{customerBusy?'Loading…':'Refresh'}</button></div>
   {customerError&&<div className="notice error">{customerError}</div>}
   {customerBookings.length?customerBookings.map(item=><article className="ride-card customer-ride" key={item.reference}><div className="ride-card-head"><span className="panel-kicker">{item.reference}</span><span className="ride-status">{item.status}</span></div><strong>{item.pickup} <span>→</span> {item.destination}</strong><div className="customer-ride-meta"><span>{formatDate(item.ride_at)}</span><span>{item.passengers} passenger(s)</span><span>{item.trip_type}</span></div>{item.quoted_fare!=null&&<><b className="customer-fare">{money(item.quoted_fare)}</b>{item.status==='quoted'&&<button className="mini primary" type="button" onClick={()=>acceptCustomerQuote(item.reference)}>Accept fare & confirm</button>}</>}{item.vehicles&&<small>Vehicle: {item.vehicles.vehicle_name} · {item.vehicles.registration_number}</small>}{item.drivers&&<small>Driver: {item.drivers.full_name}</small>}</article>):<div className="empty customer-empty">{customerBusy?'Aapki bookings load ho rahi hain.':'Abhi koi booking nahi hai. Pehli ride book karte hi yahan dikh jayegi.'}</div>}
  </>:<>
   <div className="auth-mode-switch" role="tablist" aria-label="Customer account action">
    <button type="button" className={mode==='register'?'active':''} onClick={()=>changeMode('register')}>Create account</button>
    <button type="button" className={mode==='login'?'active':''} onClick={()=>changeMode('login')}>Sign in</button>
   </div>
   {mode==='register'?<form className="owner-form customer-login-form" onSubmit={e=>{e.preventDefault();registerCustomer(registration);}}>
    <label>Full name<input value={registration.name} onChange={e=>setRegistration(v=>({...v,name:e.target.value}))} required minLength="2" maxLength="80" placeholder="Your full name" autoComplete="name"/></label>
    <label>Mobile number<input value={registration.phone} onChange={e=>setRegistration(v=>({...v,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} required pattern="[6-9][0-9]{9}" inputMode="numeric" placeholder="10-digit mobile number" autoComplete="tel"/></label>
    <label>Create password<div className="password-input-wrap"><input type={showPassword?'text':'password'} value={registration.password} onChange={e=>setRegistration(v=>({...v,password:e.target.value}))} required minLength="8" maxLength="128" autoComplete="new-password" placeholder="At least 8 characters"/><button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button></div></label>
    {customerError&&<div className="notice error" role="alert">{customerError}</div>}
    <button className="submit" disabled={customerBusy}>{customerBusy?'Creating account…':'Create customer account'} <span>↗</span></button>
    <p className="account-helper">Your password is securely hashed. Use the same mobile number and password whenever you sign in.</p>
   </form>:<form className="owner-form customer-login-form" onSubmit={loginCustomer}>
    <label>Registered mobile number<input value={customerLogin.phone} onChange={e=>setCustomerLogin(v=>({...v,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} required pattern="[6-9][0-9]{9}" inputMode="numeric" placeholder="10-digit mobile number" autoComplete="tel"/></label>
    <label>Password<div className="password-input-wrap"><input type={showPassword?'text':'password'} value={customerLogin.password} onChange={e=>setCustomerLogin(v=>({...v,password:e.target.value}))} required minLength="8" autoComplete="current-password" placeholder="Your account password"/><button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button></div></label>
    {customerError&&<div className="notice error" role="alert">{customerError}</div>}
    <button className="submit" disabled={customerBusy}>{customerBusy?'Signing in…':'Login to my account'} <span>↗</span></button>
   </form>}
  </>}
 </div>;
}
