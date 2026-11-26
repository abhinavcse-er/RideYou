import { useEffect, useMemo, useState } from 'react';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import VehicleSection from './components/VehicleSection.jsx';
import BookingSection from './components/BookingSection.jsx';
import AccountSection from './components/AccountSection.jsx';
import { api } from './services/api.js';
import { authClient } from './services/auth.js';
import { initialBooking } from './utils/format.js';

export default function App() {
 const [vehicles,setVehicles]=useState([]),[selected,setSelected]=useState(''),[booking,setBooking]=useState(initialBooking);
 const [notice,setNotice]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true),[submitting,setSubmitting]=useState(false);
 const [reference,setReference]=useState(''),[lookupPhone,setLookupPhone]=useState(''),[statusResult,setStatusResult]=useState(null);
 const [workspace,setWorkspace]=useState('customer'),[session,setSession]=useState(null),[otpPhone,setOtpPhone]=useState(''),[otp,setOtp]=useState(''),[authStep,setAuthStep]=useState('phone'),[authBusy,setAuthBusy]=useState(false);
 const [ownerData,setOwnerData]=useState(null),[ownerVehicles,setOwnerVehicles]=useState([]),[vehicleForm,setVehicleForm]=useState({vehicleName:'',registrationNumber:'',seats:4,baseFare:''}),[health,setHealth]=useState('checking');
 const chosen=useMemo(()=>vehicles.find(v=>v.id===selected),[vehicles,selected]),token=session?.access_token;

 async function loadVehicles(){try{const data=await api('/api/vehicles');setVehicles(data.vehicles||[]);setError('');}catch(e){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{loadVehicles();api('/api/health').then(()=>setHealth('online')).catch(()=>setHealth('offline'));if(authClient){authClient.auth.getSession().then(({data})=>setSession(data.session));const {data:{subscription}}=authClient.auth.onAuthStateChange((_event,next)=>setSession(next));return()=>subscription.unsubscribe();}},[]);
 useEffect(()=>{if(!token){setOwnerData(null);setOwnerVehicles([]);return;}if(workspace!=='owner')return;Promise.all([api('/api/owners/me',{},token),api('/api/owners/vehicles',{},token)]).then(([owner,items])=>{setOwnerData(owner.owner);setOwnerVehicles(items.vehicles||[]);setError('');}).catch(e=>setError(e.message));},[token,workspace]);
 async function submitBooking(e){e.preventDefault();setError('');setNotice('');setSubmitting(true);if(!selected){setError('Pehle ek gaadi select karein.');setSubmitting(false);return;}try{const result=await api('/api/bookings',{method:'POST',body:JSON.stringify({...booking,vehicleId:selected})});setReference(result.reference);setNotice('Aapki request receive ho gayi hai. Booking Team availability aur fare confirm karegi.');setBooking(initialBooking);}catch(e){setError(e.message);}finally{setSubmitting(false);}}
 async function sendOtp(e){e.preventDefault();if(!authClient){setError('Owner login configure nahi hai. Supabase public environment settings set honi chahiye.');return;}setAuthBusy(true);setError('');try{const {error:e}=await authClient.auth.signInWithOtp({phone:otpPhone});if(e)throw e;setAuthStep('otp');setNotice('OTP aapke mobile par bhej diya gaya hai.');}catch(e){setError(e.message);}finally{setAuthBusy(false);}}
 async function verifyOtp(e){e.preventDefault();setAuthBusy(true);setError('');try{const {error:e}=await authClient.auth.verifyOtp({phone:otpPhone,token:otp,type:'sms'});if(e)throw e;setNotice('Login successful.');}catch(e){setError(e.message);}finally{setAuthBusy(false);}}
 async function addVehicle(e){e.preventDefault();setError('');setNotice('');try{const result=await api('/api/owners/vehicles',{method:'POST',body:JSON.stringify(vehicleForm)},token);setOwnerVehicles(items=>[result.vehicle,...items]);setVehicleForm({vehicleName:'',registrationNumber:'',seats:4,baseFare:''});setNotice('Gaadi verification ke liye submit ho gayi hai.');}catch(e){setError(e.message);}}
 async function checkBooking(e){e.preventDefault();setError('');setStatusResult(null);try{const data=await api('/api/bookings/'+encodeURIComponent(reference.trim())+'?phone='+encodeURIComponent(lookupPhone));setStatusResult(data.booking);}catch(e){setError(e.message);}}
 return <main className="app-shell"><SiteHeader health={health}/><HeroSection/><VehicleSection vehicles={vehicles} loading={loading} error={error} selected={selected} onSelect={id=>{setSelected(id);setNotice('Gaadi select ho gayi. Booking form bharein.');}}/><BookingSection booking={booking} setBooking={setBooking} chosen={chosen} submitBooking={submitBooking} error={error} notice={notice} reference={reference} selected={selected} submitting={submitting}/><HowItWorks/><AccountSection workspace={workspace} setWorkspace={setWorkspace} reference={reference} setReference={setReference} lookupPhone={lookupPhone} setLookupPhone={setLookupPhone} checkBooking={checkBooking} statusResult={statusResult} session={session} authClient={authClient} authStep={authStep} sendOtp={sendOtp} verifyOtp={verifyOtp} otpPhone={otpPhone} setOtpPhone={setOtpPhone} otp={otp} setOtp={setOtp} error={error} authBusy={authBusy} ownerData={ownerData} ownerVehicles={ownerVehicles} vehicleForm={vehicleForm} setVehicleForm={setVehicleForm} addVehicle={addVehicle}/><SiteFooter/></main>;
}