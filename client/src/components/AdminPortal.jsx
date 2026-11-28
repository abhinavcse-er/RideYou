import AdminDashboard from './AdminDashboard.jsx';

export default function AdminPortal(props){
 const {session,authClient,authStep,sendOtp,verifyOtp,otpPhone,setOtpPhone,otp,setOtp,error,notice,authBusy,adminData,adminLoading,adminError,adminBusy,refreshAdmin,quoteBooking,assignBooking,updateTripStatus,verifyOwner,approveVehicle,addDriver}=props;
 const authorised=Boolean(session&&adminData);
 return <div className="account-panel admin-portal">
  <div className="panel-title"><div><span className="panel-kicker">OPERATIONS ACCESS</span><h3>{authorised?'Operations dashboard':'Admin sign in'}</h3><p>Admin accounts are created by RideYou management. Public Admin registration is disabled for security.</p></div><span className="panel-icon">⌘</span></div>
  {authorised?<><div className="admin-session"><span>Verified Admin · {session.user?.phone||session.user?.id}</span><button className="mini" type="button" onClick={()=>authClient.auth.signOut()}>Sign out</button></div><AdminDashboard data={adminData} loading={adminLoading} error={adminError} onRefresh={refreshAdmin} onQuote={quoteBooking} onAssign={assignBooking} onStatus={updateTripStatus} onOwner={verifyOwner} onVehicle={approveVehicle} onDriver={addDriver} busy={adminBusy}/></>
   :session?<div className="owner-pending-note"><b>Admin access is not enabled for this account.</b><p>Only accounts provisioned by RideYou management can open operations.</p><button className="mini" type="button" onClick={()=>authClient.auth.signOut()}>Sign out</button>{adminError&&<div className="notice error">{adminError}</div>}</div>
   :<form className="owner-form" onSubmit={authStep==='phone'?sendOtp:verifyOtp}>
    <label>Admin registered mobile<input value={otpPhone} onChange={e=>setOtpPhone(e.target.value.replace(/\D/g,'').slice(0,10))} required pattern="[6-9][0-9]{9}" inputMode="numeric" placeholder="10-digit Admin mobile"/></label>
    {authStep==='otp'&&<label>SMS verification code<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} required inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit OTP"/></label>}
    {error&&<div className="notice error" role="alert">{error}</div>}{notice&&<div className="notice success" role="status">{notice}</div>}
    <button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='phone'?'Send secure OTP':'Verify & open Admin'} <span>↗</span></button>
   </form>}
 </div>;
}
