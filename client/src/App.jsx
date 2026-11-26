import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const API = import.meta.env.VITE_API_URL || '';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const authClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const money = value => value == null ? 'Fare confirm hoga' : new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(value));
const formatDate = value => new Date(value).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
const initialBooking = { name:'', phone:'', pickup:'', destination:'', rideDate:'', rideTime:'', passengers:1, tripType:'local', note:'' };

async function api(path, options = {}, token) {
  const response = await fetch(API + path, {
    ...options,
    headers: { 'Content-Type':'application/json', ...(token ? { Authorization:'Bearer ' + token } : {}), ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request complete nahi ho payi.');
  return payload;
}

export default function App() {
  const [vehicles,setVehicles] = useState([]);
  const [selected,setSelected] = useState('');
  const [booking,setBooking] = useState(initialBooking);
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);
  const [submitting,setSubmitting] = useState(false);
  const [reference,setReference] = useState('');
  const [lookupPhone,setLookupPhone] = useState('');
  const [statusResult,setStatusResult] = useState(null);
  const [workspace,setWorkspace] = useState('customer');
  const [session,setSession] = useState(null);
  const [otpPhone,setOtpPhone] = useState('');
  const [otp,setOtp] = useState('');
  const [authStep,setAuthStep] = useState('phone');
  const [authBusy,setAuthBusy] = useState(false);
  const [ownerData,setOwnerData] = useState(null);
  const [ownerVehicles,setOwnerVehicles] = useState([]);
  const [vehicleForm,setVehicleForm] = useState({vehicleName:'',registrationNumber:'',seats:4,baseFare:''});
  const [health,setHealth] = useState('checking');

  const chosen = useMemo(()=>vehicles.find(v=>v.id===selected),[vehicles,selected]);
  const token = session?.access_token;

  async function loadVehicles() {
    try {
      const data = await api('/api/vehicles');
      setVehicles(data.vehicles || []);
      setError('');
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(()=>{
    loadVehicles();
    api('/api/health').then(()=>setHealth('online')).catch(()=>setHealth('offline'));
    if (authClient) {
      authClient.auth.getSession().then(({data})=>setSession(data.session));
      const {data:{subscription}}=authClient.auth.onAuthStateChange((_event,next)=>setSession(next));
      return ()=>subscription.unsubscribe();
    }
  },[]);

  useEffect(()=>{
    if (!token) { setOwnerData(null); setOwnerVehicles([]); return; }
    if (workspace !== 'owner') return;
    Promise.all([api('/api/owners/me',{},token),api('/api/owners/vehicles',{},token)])
      .then(([owner,items])=>{setOwnerData(owner.owner);setOwnerVehicles(items.vehicles||[]);setError('');})
      .catch(e=>setError(e.message));
  },[token,workspace]);

  async function submitBooking(e) {
    e.preventDefault(); setError('');setNotice('');setSubmitting(true);
    if (!selected) {setError('Pehle ek gaadi select karein.');setSubmitting(false);return;}
    try {
      const result=await api('/api/bookings',{method:'POST',body:JSON.stringify({...booking,vehicleId:selected})});
      setReference(result.reference);
      setNotice('Aapki request receive ho gayi hai. Booking team availability aur fare confirm karegi.');
      setBooking(initialBooking);
    } catch(e){setError(e.message);}
    finally{setSubmitting(false);}
  }

  async function sendOtp(e) {
    e.preventDefault(); if(!authClient){setError('Owner login configure nahi hai. Admin ko VITE_SUPABASE_URL aur VITE_SUPABASE_ANON_KEY set karna hoga.');return;}
    setAuthBusy(true);setError('');
    try {
      const {error:e}=await authClient.auth.signInWithOtp({phone:otpPhone});
      if(e)throw e;setAuthStep('otp');setNotice('OTP aapke mobile par bhej diya gaya hai.');
    } catch(e){setError(e.message);}
    finally{setAuthBusy(false);}
  }

  async function verifyOtp(e) {
    e.preventDefault();setAuthBusy(true);setError('');
    try {const {error:e}=await authClient.auth.verifyOtp({phone:otpPhone,token:otp,type:'sms'});if(e)throw e;setNotice('Login successful.');}
    catch(e){setError(e.message);}
    finally{setAuthBusy(false);}
  }

  async function addVehicle(e) {
    e.preventDefault();setError('');setNotice('');
    try {
      const result=await api('/api/owners/vehicles',{method:'POST',body:JSON.stringify(vehicleForm)},token);
      setOwnerVehicles(items=>[result.vehicle,...items]);setVehicleForm({vehicleName:'',registrationNumber:'',seats:4,baseFare:''});
      setNotice('Gaadi verification ke liye submit ho gayi hai.');
    } catch(e){setError(e.message);}
  }

  async function checkBooking(e) {
    e.preventDefault();setError('');setStatusResult(null);
    try {const data=await api('/api/bookings/'+encodeURIComponent(reference.trim())+'?phone='+encodeURIComponent(lookupPhone));setStatusResult(data.booking);}
    catch(e){setError(e.message);}
  }

  return <main>
    <header className="top wrap" id="home">
      <a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
      <nav className="main-nav"><a href="#vehicles">Gaadiyan</a><a href="#how">Booking kaise karein</a><a href="#workspace">Account</a></nav>
      <div className="top-actions"><span className={'service-state '+(health==='online'?'online':'')}>{health==='online'?'SERVICE ONLINE':health==='offline'?'SERVICE OFFLINE':'CONNECTING'}</span><a className="top-link" href="#vehicles">Gaadi dekhein ↓</a></div>
    </header>

    <section className="hero wrap">
      <div><div className="eyebrow"><i/> BIHAR KI APNI RIDE SERVICE</div>
        <h1>Gaadi chuniye,<br/><em>safar pakka kariye.</em></h1>
        <p className="intro">Apni pasand ki gaadi dekhein aur booking request bhejein. Hamari Booking Team owner se availability aur fare confirm karegi.</p>
        <a className="cta" href="#vehicles">Available gaadi dekhein <b>↓</b></a>
        <p className="assure">✓ Owner ki confirmation ke baad hi booking pakki</p>
      </div>
      <div className="hero-photo"><img className="hero-image" src="https://images.unsplash.com/photo-1663852397535-18292e115327?auto=format&fit=crop&w=1000&q=65" alt="Car travelling on a road" fetchPriority="high"/><div className="photo-shade"/><div className="photo-caption"><span>SAFAR AAPKA</span><strong>Har raaste par,<br/>aapke saath.</strong><small>Local rides · Outstation journeys</small></div></div>
    </section>

    <section className="vehicle-market wrap" id="vehicles">
      <div className="section-heading"><div><div className="eyebrow"><i/> AVAILABLE VEHICLES</div><h2>Apni gaadi <em>chuniye.</em></h2></div><p>Yahan sirf approved aur available gaadiyan dikhayi jaati hain.</p></div>
      {loading?<div className="empty">Gaadiyon ki list load ho rahi hai…</div>:vehicles.length===0?<div className="empty">{error||'Abhi koi approved gaadi available nahi hai. Baad mein dobara check karein.'}</div>:
      <div className="vehicle-grid">{vehicles.map(v=><article className={'vehicle-card '+(selected===v.id?'vehicle-selected':'')} key={v.id}>
        {v.photo_url?<img src={v.photo_url} alt={v.vehicle_name}/>:<div className="vehicle-placeholder">RideYou</div>}
        <div className="vehicle-card-body"><h3>{v.vehicle_name}</h3><p>{v.seats} seater</p><strong>{money(v.base_fare)}</strong><button className="mini primary" onClick={()=>{setSelected(v.id);setNotice('Gaadi select ho gayi. Booking form bharein.');}}>Is gaadi ko chunein</button></div>
      </article>)}</div>}
    </section>

    <section className="booking" id="booking"><div className="wrap booking-grid">
      <div className="booking-copy"><div className="eyebrow"><i/> BOOK YOUR JOURNEY</div><h2>Booking request<br/><em>bhejiye.</em></h2><p>{chosen?chosen.vehicle_name:'Pehle upar se gaadi select karein.'}</p><aside><b>i</b><span><strong>Abhi online payment nahi</strong><br/>Booking Team owner se availability aur final fare confirm karegi.</span></aside></div>
      <form className="form" onSubmit={submitBooking}>
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
      </form>
    </div></section>

    <section className="journey-section" id="how"><div className="wrap"><div className="journey-head"><div><div className="eyebrow"><i/> SIMPLE BOOKING PROCESS</div><h2>Booking ka seedha<br/><em>aur aasaan tareeka.</em></h2></div><p>Customer ka direct owner/driver se contact nahi hoga. Booking Team availability, fare aur confirmation coordinate karegi.</p></div>
      <div className="journey-steps"><article><span>01</span><b>Owner gaadi register kare</b><p>Owner apni gaadi aur driver ki details submit karega.</p></article><article><span>02</span><b>Customer gaadi chune</b><p>Customer approved listing dekhkar booking request bhejega.</p></article><article><span>03</span><b>Booking Team check kare</b><p>Booking Manager ya Booking Sahayak owner se availability aur fare confirm karenge.</p></article><article><span>04</span><b>Fare ki manzoori</b><p>Customer fare accept karega, tab booking confirm hogi.</p></article><article><span>05</span><b>Safar shuru</b><p>Confirmed booking par zaroori trip details share hongi.</p></article></div>
    </div></section>

    <section className="workspace" id="workspace"><div className="wrap">
      <div className="workspace-head"><div><div className="eyebrow"><i/> RIDEYOU ACCOUNT</div><h2>Apna <em>account kholein.</em></h2><p>Vehicle owners ke liye secure login. Customer booking reference se status check kar sakte hain.</p></div></div>
      <div className="role-tabs"><button className={workspace==='customer'?'active':''} onClick={()=>setWorkspace('customer')}>Customer</button><button className={workspace==='owner'?'active':''} onClick={()=>setWorkspace('owner')}>Vehicle Owner</button></div>
      {workspace==='customer'&&<div className="panel"><div className="panel-title"><div><h3>Booking status check karein</h3><p>Booking reference aur wahi mobile number daalein jo request mein diya tha.</p></div></div>
        <form className="owner-form" onSubmit={checkBooking}><label>Booking reference<input value={reference} onChange={e=>setReference(e.target.value.toUpperCase())} required placeholder="RY-…"/></label><label>Mobile number<input value={lookupPhone} onChange={e=>setLookupPhone(e.target.value.replace(/\D/g,'').slice(0,10))} required pattern="[6-9][0-9]{9}" placeholder="10-digit mobile"/></label><button className="submit">Status dekhein ↗</button></form>
        {statusResult&&<article className="ride-card"><strong>{statusResult.reference}</strong><p>{statusResult.pickup} → {statusResult.destination}</p><small>{formatDate(statusResult.ride_at)}</small><p className="assigned">Status: {statusResult.status}</p>{statusResult.quoted_fare!=null&&<strong>{money(statusResult.quoted_fare)}</strong>}</article>}
      </div>}
      {workspace==='owner'&&<div className="panel"><div className="panel-title"><div><h3>Vehicle Owner Login</h3><p>Registered mobile number par OTP se login karein.</p></div></div>
        {!session?<form className="owner-form" onSubmit={authStep==='phone'?sendOtp:verifyOtp}>
          <label>Registered mobile number<input value={otpPhone} onChange={e=>setOtpPhone(e.target.value)} required placeholder="+91XXXXXXXXXX"/></label>
          {authStep==='otp'&&<label>SMS OTP<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} required inputMode="numeric" placeholder="6-digit OTP"/></label>}
          {error&&<div className="notice error">{error}</div>}<button className="submit" disabled={authBusy}>{authBusy?'Please wait…':authStep==='phone'?'OTP bhejein':'Verify OTP'}</button>
          {!authClient&&<small className="privacy">Login activate karne ke liye Supabase public environment settings configure honi chahiye.</small>}
        </form>:<><div className="notice success">Logged in: {session.user?.phone}</div><button className="mini" onClick={()=>authClient.auth.signOut()}>Logout</button>
          {ownerData&&<p>Account status: <strong>{ownerData.verification_status}</strong></p>}
          {ownerData?.verification_status==='verified'&&<form className="owner-form" onSubmit={addVehicle}><h4>Apni gaadi register karein</h4><label>Gaadi ka naam / model<input value={vehicleForm.vehicleName} onChange={e=>setVehicleForm(v=>({...v,vehicleName:e.target.value}))} required/></label><label>Registration number<input value={vehicleForm.registrationNumber} onChange={e=>setVehicleForm(v=>({...v,registrationNumber:e.target.value.toUpperCase()}))} required placeholder="BR-22-XX-1234"/></label><div className="two"><label>Seats<input type="number" min="1" max="30" value={vehicleForm.seats} onChange={e=>setVehicleForm(v=>({...v,seats:e.target.value}))}/></label><label>Starting fare (₹)<input type="number" min="0" value={vehicleForm.baseFare} onChange={e=>setVehicleForm(v=>({...v,baseFare:e.target.value}))}/></label></div><button className="submit">Gaadi verification ke liye bhejein</button></form>}
          <h4 className="subheading">Aapki gaadiyan</h4>{ownerVehicles.map(v=><article className="ride-card" key={v.id}><strong>{v.vehicle_name} · {v.registration_number}</strong><small>Status: {v.status}</small></article>)}
        </>}
      </div>}
    </div></section>

    <footer className="footer wrap"><a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a><p>Gaon se shehar tak, safar aasaan.</p><small>© {new Date().getFullYear()} RideYou. All rights reserved.</small></footer>
  </main>;
}
