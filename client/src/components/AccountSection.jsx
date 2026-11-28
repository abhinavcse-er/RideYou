import { money, formatDate } from '../utils/format.js';
import AdminDashboard from './AdminDashboard.jsx';

export default function AccountSection(props) {
 const {workspace,setWorkspace,reference,setReference,lookupPhone,setLookupPhone,checkBooking,statusResult,session,authClient,authStep,sendOtp,verifyOtp,otpPhone,setOtpPhone,otp,setOtp,error,authBusy,ownerData,ownerVehicles,vehicleForm,setVehicleForm,addVehicle}=props;
 const adminWorkspace = workspace === 'admin';
 const ownerWorkspace = workspace === 'owner';
 return <section className="account-section" id="workspace"><div className="section-wrap">
  <div className="section-heading"><div><span className="eyebrow">RIDEYOU ACCOUNT</span><h2>Manage your <em>journey.</em></h2></div><p>Booking track karein, owner account manage karein ya secure Admin Console kholein.</p></div>
  <div className="role-tabs" role="tablist" aria-label="Account type">
   <button role="tab" aria-selected={workspace==='customer'} className={workspace==='customer'?'active':''} onClick={()=>setWorkspace('customer')}>Customer</button>
   <button role="tab" aria-selected={ownerWorkspace} className={ownerWorkspace?'active':''} onClick={()=>setWorkspace('owner')}>Vehicle Owner</button>
   <button role="tab" aria-selected={adminWorkspace} className={adminWorkspace?'active':''} onClick={()=>setWorkspace('admin')}>Admin</button>
  </div>
  {workspace==='customer'&&<div className="account-panel"><div className="panel-title"><h3>Track your booking</h3><p>Booking reference aur registered mobile number daalein.</p></div>
   <form className="owner-form lookup-form" onSubmit={checkBooking}><label>Booking reference<input value={reference} onChange={e=>setReference(e.target.value.toUpperCase())} required placeholder="RY-…"/></label><label>Mobile number<input value={lookupPhone} onChange={e=>setLookupPhone(e.target.value.replace(/\D/g,'').slice(0,10))} required pattern="[6-9][0-9]{9}" placeholder="10-digit mobile"/></label><button className="submit">Check booking status <span>↗</span></button></form>
   {statusResult&&<article className="ride-card"><strong>{statusResult.reference}</strong><p>{statusResult.pickup} → {statusResult.destination}</p><small>{formatDate(statusResult.ride_at)}</small><p className="assigned">Status: {statusResult.status}</p>{statusResult.quoted_fare!=null&&<strong>{money(statusResult.quoted_fare)}</strong>}</article>}
  </div>}
  {ownerWorkspace&&<div className="account-panel"><div className="panel-title"><h3>Vehicle Owner Login</h3><p>Registered mobile number par OTP se login karein.</p></div>
   {!session?<form className="owner-form" onSubmit={authStep==='phone'?sendOtp:verifyOtp}><label>Registered mobile number<input value={otpPhone} onChange={e=>setOtpPhone(e.target.value)} required placeholder="+91XXXXXXXXXX"/></label>{authStep==='otp'&&<label>SMS OTP<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} required inputMode="numeric" placeholder="6-digit OTP"/></label>}{error&&<div className="notice error">{error}</div>}<button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='phone'?'Send OTP':'Verify OTP'} <span>↗</span></button>{!authClient&&<small className="privacy">Owner login activate karne ke liye Supabase public settings configure honi chahiye.</small>}</form>
   :<><div className="notice success">Logged in: {session.user?.phone}</div><button className="mini" onClick={()=>authClient.auth.signOut()}>Logout</button>{ownerData&&<p>Account status: <strong>{ownerData.verification_status}</strong></p>}
   {ownerData?.verification_status==='verified'&&<form className="owner-form vehicle-owner-form" onSubmit={addVehicle}><h4>Register your vehicle</h4><label>Gaadi ka naam / model<input value={vehicleForm.vehicleName} onChange={e=>setVehicleForm(v=>({...v,vehicleName:e.target.value}))} required/></label><label>Registration number<input value={vehicleForm.registrationNumber} onChange={e=>setVehicleForm(v=>({...v,registrationNumber:e.target.value.toUpperCase()}))} required placeholder="BR-22-XX-1234"/></label><div className="two"><label>Seats<input type="number" min="1" max="30" value={vehicleForm.seats} onChange={e=>setVehicleForm(v=>({...v,seats:e.target.value}))}/></label><label>Starting fare (₹)<input type="number" min="0" value={vehicleForm.baseFare} onChange={e=>setVehicleForm(v=>({...v,baseFare:e.target.value}))}/></label></div><button className="submit">Submit for verification <span>↗</span></button></form>}
   <h4 className="subheading">Your vehicles</h4>{ownerVehicles.map(v=><article className="ride-card" key={v.id}><strong>{v.vehicle_name} · {v.registration_number}</strong><small>Status: {v.status}</small></article>)}</>}
  </div>}
  {adminWorkspace&&<div className="account-panel admin-panel">
   {!session?<><div className="panel-title"><h3>Admin Console</h3><p>Only pre-approved RideYou administrators can sign in. OTP access is invite-only.</p></div><form className="owner-form" onSubmit={authStep==='phone'?sendOtp:verifyOtp}><label>Admin registered mobile number<input value={otpPhone} onChange={e=>setOtpPhone(e.target.value)} required placeholder="+91XXXXXXXXXX"/></label>{authStep==='otp'&&<label>SMS OTP<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} required inputMode="numeric" placeholder="6-digit OTP"/></label>}{error&&<div className="notice error" role="alert">{error}</div>}<button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='phone'?'Send secure OTP':'Verify and open Admin Console'} <span>↗</span></button><small className="privacy">Admin access is restricted to the two provisioned RideYou accounts.</small></form></>
   :<AdminDashboard token={session.access_token} signOut={()=>authClient?.auth.signOut()}/>}
  </div>}
 </div></section>;
}
