import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { authClient } from '../services/auth.js';
import { initialBooking } from '../utils/format.js';

export default function useRideYou() {
 const [vehicles,setVehicles]=useState([]),[selected,setSelected]=useState(''),[booking,setBooking]=useState(initialBooking);
 const [notice,setNotice]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true),[submitting,setSubmitting]=useState(false);
 const [reference,setReference]=useState(''),[lookupPhone,setLookupPhone]=useState(''),[statusResult,setStatusResult]=useState(null);
 const [workspace,setWorkspace]=useState('customer'),[session,setSession]=useState(null),[otpPhone,setOtpPhone]=useState(''),[otp,setOtp]=useState(''),[authStep,setAuthStep]=useState('phone'),[authBusy,setAuthBusy]=useState(false);
 const [ownerData,setOwnerData]=useState(null),[ownerVehicles,setOwnerVehicles]=useState([]),[vehicleForm,setVehicleForm]=useState({vehicleName:'',vehicleClass:'sedan',registrationNumber:'',seats:4,baseFare:''}),[health,setHealth]=useState('checking');
 const [adminData,setAdminData]=useState(null),[adminLoading,setAdminLoading]=useState(false),[adminError,setAdminError]=useState(''),[adminBusy,setAdminBusy]=useState(false);
 const chosen=useMemo(()=>vehicles.find(v=>v.id===selected),[vehicles,selected]),token=session?.access_token;
 async function loadVehicles(){try{const data=await api('/api/vehicles');setVehicles(data.vehicles||[]);setError('');}catch(e){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{
  let active=true, checking=false, vehiclesLoaded=false;
  const checkHealth=async()=>{
   if(checking)return;
   checking=true;
   try{
    await api('/api/health');
    if(!active)return;
    setHealth('online');
    if(!vehiclesLoaded){vehiclesLoaded=true;await loadVehicles();}
   }catch{
    if(active)setHealth('offline');
   }finally{checking=false;}
  };
  checkHealth();
  // Render free instances can sleep; keep retrying so a cold start does not
  // leave the header permanently stuck on SERVICE OFFLINE.
  const healthTimer=setInterval(checkHealth,20000);
  if(authClient){authClient.auth.getSession().then(({data})=>{if(active)setSession(data.session);});const {data:{subscription}}=authClient.auth.onAuthStateChange((_event,next)=>setSession(next));return()=>{active=false;clearInterval(healthTimer);subscription.unsubscribe();};}
  return()=>{active=false;clearInterval(healthTimer);};
 },[]);
 useEffect(()=>{if(!token){setOwnerData(null);setOwnerVehicles([]);setAdminData(null);return;}if(workspace==='owner'){Promise.all([api('/api/owners/me',{},token),api('/api/owners/vehicles',{},token)]).then(([owner,items])=>{setOwnerData(owner.owner);setOwnerVehicles(items.vehicles||[]);setError('');}).catch(e=>setError(e.message));}if(workspace==='admin'){refreshAdmin();}},[token,workspace]);
 useEffect(()=>{if(workspace!=='admin'||!token)return;const timer=setInterval(()=>refreshAdmin(),30000);return()=>clearInterval(timer);},[workspace,token]);
 useEffect(()=>{if(workspace!=='customer'||!statusResult?.reference||!reference||!lookupPhone)return;let active=true;const poll=async()=>{try{const data=await api('/api/bookings/'+encodeURIComponent(reference.trim())+'?phone='+encodeURIComponent(lookupPhone));if(active)setStatusResult(data.booking);}catch{}};const timer=setInterval(poll,20000);return()=>{active=false;clearInterval(timer);};},[workspace,statusResult?.reference,reference,lookupPhone]);
 async function refreshAdmin(){if(!token)return;setAdminLoading(true);setAdminError('');try{await api('/api/admin/me',{},token);const result=await api('/api/admin/dashboard',{},token);setAdminData(result);}catch(e){setAdminData(null);setAdminError(e.message);}finally{setAdminLoading(false);}}
 async function adminAction(path,body){setAdminBusy(true);setAdminError('');try{await api(path,{method:'PATCH',body:JSON.stringify(body)},token);await refreshAdmin();}catch(e){setAdminError(e.message);}finally{setAdminBusy(false);}}
 async function quoteBooking(id,fare){return adminAction('/api/admin/bookings/'+id+'/quote',{fare});}
 async function assignBooking(id,value){return adminAction('/api/admin/bookings/'+id+'/assign',{vehicleId:value.vehicleId,driverId:value.driverId,rideEndAt:new Date(value.endAt).toISOString()});}
 async function updateTripStatus(id,status){return adminAction('/api/admin/bookings/'+id+'/status',{status});}
 async function verifyOwner(id,status){return adminAction('/api/admin/owners/'+id+'/verification',{status});}
 async function approveVehicle(id,status,vehicleClass){return adminAction('/api/admin/vehicles/'+id+'/approval',{status,vehicleClass});}
 async function addDriver(value){setAdminBusy(true);setAdminError('');try{await api('/api/admin/drivers',{method:'POST',body:JSON.stringify(value)},token);await refreshAdmin();}catch(e){setAdminError(e.message);}finally{setAdminBusy(false);}}
 async function submitBooking(e){e.preventDefault();setError('');setNotice('');setSubmitting(true);if(!selected){setError('Pehle ek gaadi select karein.');setSubmitting(false);return;}try{const result=await api('/api/bookings',{method:'POST',body:JSON.stringify({...booking,vehicleId:selected})});setReference(result.reference);setNotice('Aapki request receive ho gayi hai. Admin availability aur fare confirm karega.');setBooking(initialBooking);}catch(e){setError(e.message);}finally{setSubmitting(false);}}
 async function sendOtp(e){e.preventDefault();if(!authClient){setError('Login configure nahi hai. Supabase public environment settings set honi chahiye.');return;}setAuthBusy(true);setError('');try{const {error:e}=await authClient.auth.signInWithOtp({phone:otpPhone});if(e)throw e;setAuthStep('otp');setNotice('OTP aapke mobile par bhej diya gaya hai.');}catch(e){setError(e.message);}finally{setAuthBusy(false);}}
 async function verifyOtp(e){e.preventDefault();setAuthBusy(true);setError('');try{const {error:e}=await authClient.auth.verifyOtp({phone:otpPhone,token:otp,type:'sms'});if(e)throw e;setNotice('Login successful.');}catch(e){setError(e.message);}finally{setAuthBusy(false);}}
 async function addVehicle(e){e.preventDefault();setError('');setNotice('');try{const result=await api('/api/owners/vehicles',{method:'POST',body:JSON.stringify(vehicleForm)},token);setOwnerVehicles(items=>[result.vehicle,...items]);setVehicleForm({vehicleName:'',vehicleClass:'sedan',registrationNumber:'',seats:4,baseFare:''});setNotice('Four-wheeler verification ke liye submit ho gayi hai.');}catch(e){setError(e.message);}}
 async function checkBooking(e){e.preventDefault();setError('');setStatusResult(null);try{const data=await api('/api/bookings/'+encodeURIComponent(reference.trim())+'?phone='+encodeURIComponent(lookupPhone));setStatusResult(data.booking);}catch(e){setError(e.message);}}
 async function acceptQuote(){setError('');try{const result=await api('/api/bookings/'+encodeURIComponent(reference.trim())+'/accept',{method:'POST',body:JSON.stringify({phone:lookupPhone})});setStatusResult(v=>({...v,...result.booking}));setNotice('Fare accepted. Admin will assign the vehicle and driver.');}catch(e){setError(e.message);}}
 return {vehicles,selected,setSelected,booking,setBooking,notice,error,loading,submitting,reference,setReference,lookupPhone,setLookupPhone,statusResult,workspace,setWorkspace,session,otpPhone,setOtpPhone,otp,setOtp,authStep,authBusy,ownerData,ownerVehicles,vehicleForm,setVehicleForm,health,chosen,submitBooking,sendOtp,verifyOtp,addVehicle,checkBooking,acceptQuote,authClient,adminData,adminLoading,adminError,adminBusy,refreshAdmin,quoteBooking,assignBooking,updateTripStatus,verifyOwner,approveVehicle,addDriver};
}
