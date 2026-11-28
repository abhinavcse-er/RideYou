import { money, formatDate } from '../utils/format.js';
import AdminDashboard from './AdminDashboard.jsx';

export default function AccountSection(props) {
 const {workspace,setWorkspace,reference,setReference,lookupPhone,setLookupPhone,checkBooking,acceptQuote,statusResult,session,authClient,authStep,sendOtp,verifyOtp,otpPhone,setOtpPhone,otp,setOtp,error,notice,authBusy,ownerData,ownerVehicles,vehicleForm,setVehicleForm,addVehicle,adminData,adminLoading,adminError,adminBusy,refreshAdmin,quoteBooking,assignBooking,updateTripStatus,verifyOwner,approveVehicle,addDriver}=props;
 return <section className="account-section" id="workspace">
  <div className="section-wrap account-layout">
   <div className="account-heading">
    <div><span className="eyebrow">RIDEYOU ACCOUNT</span><h2>Every ride,<br/><em>in control.</em></h2></div>
    <p>Track your booking, manage your vehicle or access secure Admin operations — all in one place.</p>
   </div>
   <div className="account-body">
    <aside className="account-aside">
     <div className="account-aside-mark">R</div>
     <span className="account-aside-kicker">YOUR RIDEYOU SPACE</span>
     <h3>Safar ka poora<br/>control, ek jagah.</h3>
     <p>Choose how you want to continue. Your account access stays private and secure.</p>
     <div className="account-benefit"><span>01</span><div><b>Customer</b><small>Booking status aur fare updates</small></div></div>
     <div className="account-benefit"><span>02</span><div><b>Vehicle Owner</b><small>Gaadi aur verification manage karein</small></div></div>
     <div className="account-benefit"><span>03</span><div><b>Admin</b><small>Bookings aur trip operations</small></div></div>
     <div className="account-aside-foot"><span className="account-secure-dot"/> Secure access · RideYou Bihar</div>
    </aside>
    <div className="account-main">
     <div className="role-tabs" role="tablist" aria-label="Choose account type">
      <button role="tab" aria-selected={workspace==='customer'} className={workspace==='customer'?'active':''} onClick={()=>setWorkspace('customer')}>Customer</button>
      <button role="tab" aria-selected={workspace==='owner'} className={workspace==='owner'?'active':''} onClick={()=>setWorkspace('owner')}>Vehicle Owner</button>
      <button role="tab" aria-selected={workspace==='admin'} className={workspace==='admin'?'active':''} onClick={()=>setWorkspace('admin')}>Admin</button>
     </div>
     {workspace==='customer'&&<div className="account-panel">
      <div className="panel-title"><div><span className="panel-kicker">CUSTOMER PORTAL</span><h3>Track your booking</h3><p>Apna booking reference aur registered mobile number enter karein.</p></div><span className="panel-icon">↗</span></div>
      <form className="owner-form lookup-form" onSubmit={checkBooking}>
       <label>Booking reference<input value={reference} onChange={e=>setReference(e.target.value.toUpperCase())} required placeholder="RY-XXXXXXXX"/></label>
       <label>Registered mobile number<input value={lookupPhone} onChange={e=>setLookupPhone(e.target.value.replace(/\D/g,'').slice(0,10))} required pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" inputMode="numeric"/></label>
       {error&&<div className="notice error lookup-message">{error}</div>}
       <button className="submit" type="submit">Find my booking <span>↗</span></button>
      </form>
      {statusResult&&<article className="ride-card"><div className="ride-card-head"><span className="panel-kicker">BOOKING DETAILS</span><span className="ride-status">{statusResult.status}</span></div><strong>{statusResult.reference}</strong><p>{statusResult.pickup} → {statusResult.destination}</p><small>{formatDate(statusResult.ride_at)} · Status refreshes every 20 seconds</small><p className="assigned">Status: {statusResult.status}</p>{statusResult.quoted_fare!=null&&<><strong>{money(statusResult.quoted_fare)}</strong>{statusResult.status==='quoted'&&<button className="mini primary" type="button" onClick={acceptQuote}>Accept fare & confirm</button>}</>}{statusResult.vehicles&&<p className="assigned">Vehicle: {statusResult.vehicles.vehicle_name} · {statusResult.vehicles.registration_number}</p>}{statusResult.drivers&&<p className="assigned">Driver: {statusResult.drivers.full_name}</p>}</article>}
      <p className="account-helper">Booking reference aapko request submit karne ke baad milta hai. Isse apne paas safe rakhein.</p>
     </div>}
     {workspace==='owner'&&<div className="account-panel">
      <div className="panel-title"><div><span className="panel-kicker">PARTNER PORTAL</span><h3>Vehicle Owner Login</h3><p>Registered mobile number par secure OTP se login karein.</p></div><span className="panel-icon">⌁</span></div>
      {!session?<form className="owner-form" onSubmit={authStep==='phone'?sendOtp:verifyOtp}><label>Registered mobile number<input value={otpPhone} onChange={e=>setOtpPhone(e.target.value)} required placeholder="+91 XXXXX XXXXX"/></label>{authStep==='otp'&&<label>SMS OTP<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} required inputMode="numeric" placeholder="6-digit OTP"/></label>}{error&&<div className="notice error">{error}</div>}{notice&&<div className="notice success">{notice}</div>}<button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='phone'?'Send OTP':'Verify OTP'} <span>↗</span></button>{!authClient&&<small className="privacy">Supabase public URL aur anon key configure hone par Owner login activate hoga.</small>}</form>
      :<><div className="notice success">Logged in: {session.user?.phone}</div><button className="mini" onClick={()=>authClient.auth.signOut()}>Logout</button>{ownerData&&<p>Account status: <strong>{ownerData.verification_status}</strong></p>}
       {ownerData?.verification_status==='verified'&&<form className="owner-form vehicle-owner-form" onSubmit={addVehicle}><h4>Register your four-wheeler</h4><label>Gaadi ka naam / model<input value={vehicleForm.vehicleName} onChange={e=>setVehicleForm(v=>({...v,vehicleName:e.target.value}))} required/></label><label>Vehicle class<select value={vehicleForm.vehicleClass} onChange={e=>setVehicleForm(v=>({...v,vehicleClass:e.target.value}))}>{[['hatchback','Hatchback'],['sedan','Sedan'],['suv','SUV'],['muv','MUV'],['van','Van'],['luxury','Luxury car']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Registration number<input value={vehicleForm.registrationNumber} onChange={e=>setVehicleForm(v=>({...v,registrationNumber:e.target.value.toUpperCase()}))} required placeholder="BR-22-XX-1234"/></label><div className="two"><label>Seats (4–12)<input type="number" min="4" max="12" value={vehicleForm.seats} onChange={e=>setVehicleForm(v=>({...v,seats:e.target.value}))}/></label><label>Starting fare (₹)<input type="number" min="0" value={vehicleForm.baseFare} onChange={e=>setVehicleForm(v=>({...v,baseFare:e.target.value}))}/></label></div><button className="submit">Submit for verification <span>↗</span></button></form>}
       <h4 className="subheading">Your vehicles</h4>{ownerVehicles.map(v=><article className="ride-card" key={v.id}><strong>{v.vehicle_name} · {v.registration_number}</strong><small>{v.vehicle_class||'Class pending'} · {v.status}</small></article>)}</>}
     </div>}
     {workspace==='admin'&&<div className="account-panel">
      <div className="panel-title"><div><span className="panel-kicker">OPERATIONS PORTAL</span><h3>Admin sign in</h3><p>Only provisioned Admin accounts can access booking operations.</p></div><span className="panel-icon">⌘</span></div>
      {!session?<form className="owner-form" onSubmit={authStep==='phone'?sendOtp:verifyOtp}><label>Admin registered mobile<input value={otpPhone} onChange={e=>setOtpPhone(e.target.value)} required placeholder="+91 XXXXX XXXXX"/></label>{authStep==='otp'&&<label>SMS OTP<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} required inputMode="numeric" placeholder="6-digit OTP"/></label>}{error&&<div className="notice error">{error}</div>}{notice&&<div className="notice success">{notice}</div>}<button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='phone'?'Send secure OTP':'Verify & open Admin'} <span>↗</span></button></form>
      :<><div className="admin-session"><span>Authenticated account: {session.user?.phone||session.user?.id}</span><button className="mini" onClick={()=>authClient.auth.signOut()}>Logout</button></div><AdminDashboard data={adminData} loading={adminLoading} error={adminError} onRefresh={refreshAdmin} onQuote={quoteBooking} onAssign={assignBooking} onStatus={updateTripStatus} onOwner={verifyOwner} onVehicle={approveVehicle} onDriver={addDriver} busy={adminBusy}/></>}
     </div>}
    </div>
   </div>
  </div>
 </section>;
}
