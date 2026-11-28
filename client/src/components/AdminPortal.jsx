import { useState } from 'react';
import AdminDashboard from './AdminDashboard.jsx';

export default function AdminPortal(props){
 const {session,authClient,authStep,sendOtp,verifyOtp,authEmail,setAuthEmail,otp,setOtp,error,notice,authBusy,adminData,adminLoading,adminError,adminBusy,refreshAdmin,quoteBooking,assignBooking,updateTripStatus,verifyOwner,approveVehicle,addDriver,submitSupportRequest}=props;
 const [mode,setMode]=useState('login');
 const [request,setRequest]=useState({fullName:'',phone:'',email:'',subject:'Admin access request',message:'I need authorised access to the RideYou Admin workspace.'});
 const [requestBusy,setRequestBusy]=useState(false),[requestError,setRequestError]=useState(''),[requestNotice,setRequestNotice]=useState('');
 const authorised=Boolean(session&&adminData);
 const switchMode=next=>{setMode(next);setRequestError('');setRequestNotice('');setOtp('');props.setAuthStep('email');props.setError('');props.setNotice('');};
 return <div className="account-panel admin-portal">
  <div className="panel-title"><div><span className="panel-kicker">OPERATIONS ACCESS</span><h3>{authorised?'Operations dashboard':'RideYou Admin'}</h3><p>{authorised?'Manage bookings, owners, vehicles and trip operations.':'Sign in with your authorised email or request access from the RideYou team.'}</p></div><span className="panel-icon">⌘</span></div>
  {authorised?<><div className="admin-session"><span>Verified Admin · {session.user?.email||session.user?.id}</span><button className="mini" type="button" onClick={()=>authClient.auth.signOut()}>Sign out</button></div><AdminDashboard data={adminData} loading={adminLoading} error={adminError} onRefresh={refreshAdmin} onQuote={quoteBooking} onAssign={assignBooking} onStatus={updateTripStatus} onOwner={verifyOwner} onVehicle={approveVehicle} onDriver={addDriver} busy={adminBusy}/></>
   :session?<div className="owner-pending-note"><b>Admin access is not enabled for this account.</b><p>Only authorised accounts provisioned by RideYou management can open operations.</p><button className="mini" type="button" onClick={()=>authClient.auth.signOut()}>Sign out</button>{adminError&&<div className="notice error">{adminError}</div>}</div>
   :<>
    <div className="auth-mode-switch" role="tablist" aria-label="Admin access options">
     <button type="button" className={mode==='login'?'active':''} onClick={()=>switchMode('login')}>Admin sign in</button>
     <button type="button" className={mode==='request'?'active':''} onClick={()=>switchMode('request')}>Request access</button>
    </div>
    {mode==='login'?<form className="owner-form" onSubmit={authStep==='email'?sendOtp:verifyOtp}>
      <label>Authorised Admin email<input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required maxLength="254" autoComplete="email" placeholder="admin@example.com"/></label>
      {authStep==='otp'&&<label>Email verification code<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,8))} required inputMode="numeric" autoComplete="one-time-code" placeholder="Enter the code from your email"/></label>}
      {error&&<div className="notice error" role="alert">{error}</div>}{notice&&<div className="notice success" role="status">{notice}</div>}{adminError&&<div className="notice error">{adminError}</div>}
      <button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='email'?'Send Admin sign-in code':'Verify code & open Admin'} <span>↗</span></button>
      <p className="account-helper">Admin email accounts must be provisioned by RideYou management first. OTP verifies email; server role checks decide access.</p>
    </form>:<form className="owner-form" onSubmit={async e=>{
      e.preventDefault();setRequestBusy(true);setRequestError('');setRequestNotice('');
      try{const result=await submitSupportRequest({...request,requestType:'admin_access',phone:request.phone||undefined});setRequestNotice(result.message||'Access request submitted.');}
      catch(err){setRequestError(err.message);}
      finally{setRequestBusy(false);}
     }}>
      <div className="two"><label>Full name<input value={request.fullName} onChange={e=>setRequest(v=>({...v,fullName:e.target.value}))} required minLength="2" maxLength="100" placeholder="Your name"/></label><label>Mobile number<input value={request.phone} onChange={e=>setRequest(v=>({...v,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} pattern="[6-9][0-9]{9}" placeholder="Optional contact number"/></label></div>
      <label>Email address<input type="email" value={request.email} onChange={e=>setRequest(v=>({...v,email:e.target.value}))} required maxLength="254" placeholder="name@example.com"/></label>
      <label>Why do you need Admin access?<textarea value={request.message} onChange={e=>setRequest(v=>({...v,message:e.target.value}))} required minLength="10" maxLength="1200" rows="3"/></label>
      {requestError&&<div className="notice error">{requestError}</div>}{requestNotice&&<div className="notice success">{requestNotice}</div>}
      <button className="submit" disabled={requestBusy}>{requestBusy?'Sending request…':'Submit access request'} <span>↗</span></button>
      <p className="account-helper">This sends a request for review. It does not create an Admin account or grant operations access automatically.</p>
    </form>}
   </>}
 </div>;
}
