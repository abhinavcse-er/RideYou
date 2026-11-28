export default function OwnerPortal(props){
 const {session,authClient,authStep,sendOtp,verifyOtp,otpPhone,setOtpPhone,otp,setOtp,error,notice,authBusy,ownerData,ownerVehicles,vehicleForm,setVehicleForm,addVehicle,ownerMode,setOwnerMode,ownerRegistration,setOwnerRegistration}=props;
 const registered=Boolean(session&&ownerData);
 const switchMode=(mode)=>{setOwnerMode(mode);setOtp('');props.setAuthStep('phone');props.setError('');props.setNotice('');};
 return <div className="account-panel owner-portal">
  <div className="panel-title"><div><span className="panel-kicker">VEHICLE PARTNER</span><h3>{registered?'Owner workspace':'Join as a vehicle owner'}</h3><p>{registered?'Your verification and fleet details.':'Register with your verified mobile number to list your four-wheelers.'}</p></div><span className="panel-icon">⌁</span></div>
  {registered?<div className="owner-dashboard-view">
    <div className="owner-account-status"><div><small>OWNER ACCOUNT</small><strong>{ownerData.business_name||'Vehicle owner'}</strong><span>{session.user?.phone||otpPhone}</span></div><span className={'owner-status '+(ownerData.verification_status==='verified'?'verified':'')}>{ownerData.verification_status||'pending'}</span></div>
    {notice&&<div className="notice success">{notice}</div>}
    {error&&<div className="notice error">{error}</div>}
    {ownerData.verification_status!=='verified'&&<div className="owner-pending-note"><b>Verification in progress</b><p>RideYou Admin aapki details review karega. Approval ke baad aap apni gaadiyan register kar sakenge.</p></div>}
    {ownerData.verification_status==='verified'&&<form className="owner-form vehicle-owner-form" onSubmit={addVehicle}>
      <h4>Register a four-wheeler</h4>
      <label>Vehicle name / model<input value={vehicleForm.vehicleName} onChange={e=>setVehicleForm(v=>({...v,vehicleName:e.target.value}))} required placeholder="Toyota Innova Crysta"/></label>
      <label>Vehicle class<select value={vehicleForm.vehicleClass} onChange={e=>setVehicleForm(v=>({...v,vehicleClass:e.target.value}))}>{[['hatchback','Hatchback'],['sedan','Sedan'],['suv','SUV'],['muv','MUV'],['van','Van'],['luxury','Luxury car']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <label>Registration number<input value={vehicleForm.registrationNumber} onChange={e=>setVehicleForm(v=>({...v,registrationNumber:e.target.value.toUpperCase()}))} required placeholder="BR-22-XX-1234"/></label>
      <div className="two"><label>Seats (4–12)<input type="number" min="4" max="12" value={vehicleForm.seats} onChange={e=>setVehicleForm(v=>({...v,seats:e.target.value}))}/></label><label>Starting fare (₹)<input type="number" min="0" value={vehicleForm.baseFare} onChange={e=>setVehicleForm(v=>({...v,baseFare:e.target.value}))}/></label></div>
      <button className="submit">Submit vehicle for review <span>↗</span></button>
    </form>}
    <div className="owner-fleet-list"><div className="customer-booking-heading"><div><b>Your vehicles</b><small>{ownerVehicles.length} registered</small></div></div>
      {ownerVehicles.length?ownerVehicles.map(v=><article className="ride-card" key={v.id}><strong>{v.vehicle_name} · {v.registration_number}</strong><small>{v.vehicle_class||'Class pending'} · {v.status}</small></article>):<div className="empty">No vehicles registered yet.</div>}
    </div>
    <button className="mini owner-logout" type="button" onClick={()=>authClient.auth.signOut()}>Sign out</button>
  </div>:session?<div className="owner-pending-note"><b>This session is not connected to a Vehicle Owner profile.</b><p>Sign out and choose Register or Sign in with the correct owner mobile number.</p><button className="mini" type="button" onClick={()=>authClient.auth.signOut()}>Sign out</button></div>:
  <>
   <div className="auth-mode-switch" role="tablist" aria-label="Owner account action">
    <button type="button" className={ownerMode==='register'?'active':''} onClick={()=>switchMode('register')}>Create owner account</button>
    <button type="button" className={ownerMode==='login'?'active':''} onClick={()=>switchMode('login')}>Sign in</button>
   </div>
   <form className="owner-form" onSubmit={authStep==='phone'?sendOtp:verifyOtp}>
    {ownerMode==='register'&&<div className="two">
      <label>Full name<input value={ownerRegistration.fullName} onChange={e=>setOwnerRegistration(v=>({...v,fullName:e.target.value}))} minLength="2" maxLength="100" required placeholder="Your full name"/></label>
      <label>Business / owner name<input value={ownerRegistration.businessName} onChange={e=>setOwnerRegistration(v=>({...v,businessName:e.target.value}))} minLength="2" maxLength="100" required placeholder="Business or fleet name"/></label>
    </div>}
    <label>Mobile number<input value={otpPhone} onChange={e=>setOtpPhone(e.target.value.replace(/\D/g,'').slice(0,10))} required pattern="[6-9][0-9]{9}" inputMode="numeric" placeholder="10-digit mobile number"/></label>
    {authStep==='otp'&&<label>SMS verification code<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} required inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit OTP"/></label>}
    {error&&<div className="notice error" role="alert">{error}</div>}{notice&&<div className="notice success" role="status">{notice}</div>}
    <button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='phone'?(ownerMode==='register'?'Send OTP & continue':'Send sign-in OTP'):'Verify OTP & '+(ownerMode==='register'?'register':'sign in')} <span>↗</span></button>
    <p className="account-helper">{ownerMode==='register'?'Phone OTP confirms your number. New owner accounts remain pending until RideYou Admin verifies the details.':'Use the mobile number you registered with RideYou.'}</p>
   </form>
  </>}
 </div>;
}
