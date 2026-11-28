import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { authClient } from '../services/auth.js';
import { initialBooking } from '../utils/format.js';

export default function useRideYou(){
 const [vehicles,setVehicles]=useState([]),[selected,setSelected]=useState(''),[booking,setBooking]=useState(initialBooking);
 const [notice,setNotice]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true),[submitting,setSubmitting]=useState(false);
 const [reference,setReference]=useState(''),[lookupPhone,setLookupPhone]=useState(''),[statusResult,setStatusResult]=useState(null);
 const [customerToken,setCustomerToken]=useState(()=>localStorage.getItem('rideyou_customer_token')||''),[customerBookings,setCustomerBookings]=useState([]),[customerBusy,setCustomerBusy]=useState(false),[customerError,setCustomerError]=useState(''),[customerUser,setCustomerUser]=useState(null),[customerLogin,setCustomerLogin]=useState({phone:'',password:''});
 const [workspace,setWorkspace]=useState('customer'),[session,setSession]=useState(null),[authEmail,setAuthEmail]=useState(''),[otp,setOtp]=useState(''),[authStep,setAuthStep]=useState('email'),[authBusy,setAuthBusy]=useState(false);
 const [ownerMode,setOwnerMode]=useState('register'),[ownerRegistration,setOwnerRegistration]=useState({fullName:'',businessName:'',phone:''});
 const [ownerData,setOwnerData]=useState(null),[ownerVehicles,setOwnerVehicles]=useState([]),[vehicleForm,setVehicleForm]=useState({vehicleName:'',vehicleClass:'sedan',registrationNumber:'',seats:4,baseFare:''}),[health,setHealth]=useState('checking');
 const [adminData,setAdminData]=useState(null),[adminLoading,setAdminLoading]=useState(false),[adminError,setAdminError]=useState(''),[adminBusy,setAdminBusy]=useState(false);
 const chosen=useMemo(()=>vehicles.find(v=>v.id===selected),[vehicles,selected]),token=session?.access_token;

 async function loadVehicles(){try{const data=await api('/api/vehicles');setVehicles(data.vehicles||[]);setError('');}catch(e){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{
  let active=true,checking=false,vehiclesLoaded=false;
  const checkHealth=async()=>{
   if(checking)return;checking=true;
   try{await api('/api/health');if(!active)return;setHealth('online');if(!vehiclesLoaded){vehiclesLoaded=true;await loadVehicles();}}
   catch{if(active)setHealth('offline');}
   finally{checking=false;}
  };
  checkHealth();const healthTimer=setInterval(checkHealth,20000);
  if(authClient){
   authClient.auth.getSession().then(({data})=>{if(active)setSession(data.session);});
   const {data:{subscription}}=authClient.auth.onAuthStateChange((_event,next)=>setSession(next));
   return()=>{active=false;clearInterval(healthTimer);subscription.unsubscribe();};
  }
  return()=>{active=false;clearInterval(healthTimer);};
 },[]);

 useEffect(()=>{
  if(!token){setOwnerData(null);setOwnerVehicles([]);setAdminData(null);return;}
  if(workspace==='owner'){
   Promise.all([api('/api/owners/me',{},token),api('/api/owners/vehicles',{},token)])
    .then(([owner,items])=>{setOwnerData(owner.owner);setOwnerVehicles(items.vehicles||[]);setError('');})
    .catch(e=>{setOwnerData(null);setOwnerVehicles([]);setError(e.message);});
  }
  if(workspace==='admin')refreshAdmin();
 },[token,workspace]);
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

 async function registerCustomer(payload){
  setCustomerBusy(true);setCustomerError('');
  try{const result=await api('/api/customers/register',{method:'POST',body:JSON.stringify(payload)});setCustomerToken(result.token);localStorage.setItem('rideyou_customer_token',result.token);setCustomerUser(result.customer);setCustomerLogin({phone:result.customer.phone,password:''});await loadCustomerBookings(result.token);}
  catch(e){setCustomerError(e.message);}finally{setCustomerBusy(false);}
 }
 async function submitBooking(e){
  e.preventDefault();setError('');setNotice('');
  if(!customerToken){setError('Booking se pehle Account Centre mein Customer register ya sign in karein.');return;}
  if(!selected){setError('Pehle ek gaadi select karein.');return;}
  setSubmitting(true);
  try{const result=await api('/api/bookings',{method:'POST',body:JSON.stringify({...booking,vehicleId:selected})},customerToken);setReference(result.reference);setCustomerUser(result.customer);setNotice('Booking request receive ho gayi. Aapke account mein save ho gayi hai.');setBooking(initialBooking);await loadCustomerBookings(customerToken);}
  catch(e){setError(e.message);}finally{setSubmitting(false);}
 }
 async function acceptCustomerQuote(referenceValue){setCustomerError('');try{await api('/api/bookings/'+encodeURIComponent(referenceValue)+'/accept',{method:'POST'},customerToken);await loadCustomerBookings();}catch(e){setCustomerError(e.message);}}
 async function loadCustomerBookings(activeToken=customerToken){
  if(!activeToken)return;setCustomerBusy(true);setCustomerError('');
  try{const result=await api('/api/customers/bookings',{},activeToken);setCustomerBookings(result.bookings||[]);if(result.customer)setCustomerUser(result.customer);}
  catch(e){setCustomerError(e.message);if(/session|login/i.test(e.message)){localStorage.removeItem('rideyou_customer_token');setCustomerToken('');setCustomerUser(null);}}
  finally{setCustomerBusy(false);}
 }
 async function loginCustomer(e){
  e.preventDefault();setCustomerBusy(true);setCustomerError('');
  try{const result=await api('/api/customers/login',{method:'POST',body:JSON.stringify(customerLogin)});setCustomerToken(result.token);localStorage.setItem('rideyou_customer_token',result.token);setCustomerUser(result.customer);await loadCustomerBookings(result.token);}
  catch(e){setCustomerError(e.message);}finally{setCustomerBusy(false);}
 }
 function logoutCustomer(){localStorage.removeItem('rideyou_customer_token');setCustomerToken('');setCustomerBookings([]);setCustomerUser(null);setCustomerError('');}
 useEffect(()=>{if(customerToken)loadCustomerBookings(customerToken);},[]);
 useEffect(()=>{if(!customerToken)return;const timer=setInterval(()=>loadCustomerBookings(customerToken),20000);return()=>clearInterval(timer);},[customerToken]);

 async function sendOtp(e){
  e.preventDefault();
  if(!authClient){setError('Supabase URL aur publishable/anon key configure honi chahiye.');return;}
  const email=String(authEmail||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Valid email address enter karein.');return;}
  if(workspace==='owner'&&ownerMode==='register'){
   if(!ownerRegistration.fullName.trim()||!ownerRegistration.businessName.trim()){setError('Full name aur business/owner name enter karein.');return;}
   if(!/^[6-9]\d{9}$/.test(ownerRegistration.phone)){setError('Valid 10-digit mobile number enter karein.');return;}
  }
  setAuthBusy(true);setError('');setNotice('');
  try{
   const shouldCreateUser=workspace==='owner'&&ownerMode==='register';
   const {error:e}=await authClient.auth.signInWithOtp({email,options:{shouldCreateUser}});
   if(e)throw e;
   setAuthEmail(email);setAuthStep('otp');setNotice('Email par verification code bhej diya gaya hai. Inbox aur spam folder check karein.');
  }catch(e){setError(e.message);}finally{setAuthBusy(false);}
 }
 async function verifyOtp(e){
  e.preventDefault();if(!authClient)return;
  setAuthBusy(true);setError('');setNotice('');
  try{
   const email=String(authEmail||'').trim().toLowerCase();
   const {error:e}=await authClient.auth.verifyOtp({email,token:otp,type:'email'});
   if(e)throw e;
   const {data,error:sessionError}=await authClient.auth.getSession();if(sessionError)throw sessionError;
   const verifiedSession=data.session;if(!verifiedSession)throw new Error('Verified session nahi mila. Dobara code verify karein.');
   setSession(verifiedSession);
   if(workspace==='owner'&&ownerMode==='register'){
    const result=await api('/api/owners/register',{method:'POST',body:JSON.stringify({...ownerRegistration,email})},verifiedSession.access_token);
    setOwnerData(result.owner);setOwnerVehicles([]);setError('');setNotice(result.message||'Owner account register ho gaya hai.');
   }else if(workspace==='owner'){
    const [owner,items]=await Promise.all([api('/api/owners/me',{},verifiedSession.access_token),api('/api/owners/vehicles',{},verifiedSession.access_token)]);
    setOwnerData(owner.owner);setOwnerVehicles(items.vehicles||[]);setNotice('Owner login successful.');
   }else if(workspace==='admin'){
    await api('/api/admin/me',{},verifiedSession.access_token);
    const result=await api('/api/admin/dashboard',{},verifiedSession.access_token);
    setAdminData(result);setAdminError('');setNotice('Admin login successful.');
   }
   setAuthStep('email');setOtp('');
  }catch(e){setError(e.message);}finally{setAuthBusy(false);}
 }
 async function addVehicle(e){
  e.preventDefault();setError('');setNotice('');
  try{const result=await api('/api/owners/vehicles',{method:'POST',body:JSON.stringify(vehicleForm)},token);setOwnerVehicles(items=>[result.vehicle,...items]);setVehicleForm({vehicleName:'',vehicleClass:'sedan',registrationNumber:'',seats:4,baseFare:''});setNotice('Four-wheeler verification ke liye submit ho gayi hai.');}
  catch(e){setError(e.message);}
 }
 async function submitSupportRequest(payload){
  return api('/api/support',{method:'POST',body:JSON.stringify(payload)});
 }
 async function checkBooking(e){e.preventDefault();setError('');setStatusResult(null);try{const data=await api('/api/bookings/'+encodeURIComponent(reference.trim())+'?phone='+encodeURIComponent(lookupPhone));setStatusResult(data.booking);}catch(e){setError(e.message);}}
 async function acceptQuote(){setError('');try{const result=await api('/api/bookings/'+encodeURIComponent(reference.trim())+'/accept',{method:'POST',body:JSON.stringify({phone:lookupPhone})});setStatusResult(v=>({...v,...result.booking}));setNotice('Fare accepted. Admin will assign the vehicle and driver.');}catch(e){setError(e.message);}}
 return {vehicles,selected,setSelected,booking,setBooking,notice,setNotice,error,setError,loading,submitting,reference,setReference,lookupPhone,setLookupPhone,statusResult,customerToken,customerBookings,customerBusy,customerError,customerUser,customerLogin,setCustomerLogin,loginCustomer,registerCustomer,logoutCustomer,loadCustomerBookings,acceptCustomerQuote,workspace,setWorkspace,session,authEmail,setAuthEmail,otp,setOtp,authStep,setAuthStep,authBusy,ownerMode,setOwnerMode,ownerRegistration,setOwnerRegistration,ownerData,ownerVehicles,vehicleForm,setVehicleForm,health,chosen,submitBooking,sendOtp,verifyOtp,addVehicle,checkBooking,acceptQuote,authClient,adminData,adminLoading,adminError,adminBusy,refreshAdmin,quoteBooking,assignBooking,updateTripStatus,verifyOwner,approveVehicle,addDriver,submitSupportRequest};
}
