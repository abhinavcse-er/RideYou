import { useEffect, useMemo, useState } from 'react';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import VehicleCard from './components/VehicleCard.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import BookingForm from './components/BookingForm.jsx';
import { api } from './services/api.js';
import { authClient } from './services/auth.js';
import { money, formatDate, initialBooking } from './utils/format.js';



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
    <SiteHeader health={health} />

    <HeroSection />

    <section className="vehicle-market wrap" id="vehicles">
      <div className="section-heading"><div><div className="eyebrow"><i/> AVAILABLE VEHICLES</div><h2>Apni gaadi <em>chuniye.</em></h2></div><p>Yahan sirf approved aur available gaadiyan dikhayi jaati hain.</p></div>
      {loading?<div className="empty">Gaadiyon ki list load ho rahi hai…</div>:vehicles.length===0?<div className="empty">{error||'Abhi koi approved gaadi available nahi hai. Baad mein dobara check karein.'}</div>:
      <div className="vehicle-grid">{vehicles.map(vehicle=><VehicleCard key={vehicle.id} vehicle={vehicle} selected={selected===vehicle.id} onSelect={id=>{setSelected(id);setNotice('Gaadi select ho gayi. Booking form bharein.');}} />)}</div>}}
        <div className="vehicle-card-body"><h3>{v.vehicle_name}</h3><p>{v.seats} seater</p><strong>{money(v.base_fare)}</strong><button className="mini primary" onClick={()=>{setSelected(v.id);setNotice('Gaadi select ho gayi. Booking form bharein.');}}>Is gaadi ko chunein</button></div>
      </article>)}</div>}
    </section>

    <section className="booking" id="booking"><div className="wrap booking-grid">
      <div className="booking-copy"><div className="eyebrow"><i/> BOOK YOUR JOURNEY</div><h2>Booking request<br/><em>bhejiye.</em></h2><p>{chosen?chosen.vehicle_name:'Pehle upar se gaadi select karein.'}</p><aside><b>i</b><span><strong>Abhi online payment nahi</strong><br/>Booking Team owner se availability aur final fare confirm karegi.</span></aside></div>
      <BookingForm booking={booking} setBooking={setBooking} chosen={chosen} submitBooking={submitBooking} error={error} notice={notice} reference={reference} selected={selected} submitting={submitting} />
    </div></section>

    <HowItWorks />

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

    <SiteFooter />
  </main>;
}
