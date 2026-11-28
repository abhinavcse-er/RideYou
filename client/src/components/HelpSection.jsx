import { useState } from 'react';

const topics=[
 {title:'How do I create a Customer account?',body:'Open Account Centre → Customer → Create account. Enter your name, mobile number and password. After registration you can book and view journeys from the same dashboard.'},
 {title:'How does Vehicle Owner registration work?',body:'Choose Vehicle Owner → Create owner account. Verify your email using the one-time code, add your mobile contact and business name. Your profile remains pending until RideYou Admin reviews it.'},
 {title:'Why is my vehicle not visible?',body:'Only vehicles approved by RideYou Admin and marked active appear in the booking list. Owners can check their vehicle status inside their account.'},
 {title:'How do I contact the RideYou team?',body:'Send the support form below with your registered mobile number and email. Include your booking reference when asking about a ride.'},
];
export default function HelpSection({submitSupportRequest}){
 const [form,setForm]=useState({fullName:'',phone:'',email:'',subject:'Account or booking help',message:''});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function submit(e){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  try{const result=await submitSupportRequest({...form,requestType:'account_help',phone:form.phone||undefined});setNotice(result.message||'Request sent to RideYou support.');setForm(v=>({...v,subject:'Account or booking help',message:''}));}
  catch(e){setError(e.message);}
  finally{setBusy(false);}
 }
 return <section className="help-section" id="help">
  <div className="section-wrap">
   <div className="help-heading"><div><span className="eyebrow">RIDEYOU SUPPORT</span><h2>Need a hand?<br/><em>We’re here to help.</em></h2></div><p>Account registration, OTP, vehicle approval or booking updates — find a quick answer or send our team a support request.</p></div>
   <div className="help-grid">
    <div className="help-faq"><div className="help-label">QUICK ANSWERS</div>
     {topics.map((topic,index)=><details className="help-faq-item" key={topic.title} open={index===0}><summary><span>{String(index+1).padStart(2,'0')}</span>{topic.title}<b>＋</b></summary><p>{topic.body}</p></details>)}
    </div>
    <form className="help-form" onSubmit={submit}>
     <div className="help-form-title"><span className="panel-kicker">SEND A REQUEST</span><h3>Talk to RideYou</h3><p>Share enough detail so the team can identify and resolve your issue.</p></div>
     <label>Full name<input value={form.fullName} onChange={e=>setForm(v=>({...v,fullName:e.target.value}))} required minLength="2" maxLength="100" placeholder="Your name"/></label>
     <div className="two">
      <label>Mobile number <small>Optional</small><input value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} pattern="[6-9][0-9]{9}" placeholder="10-digit mobile"/></label>
      <label>Email address<input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} required maxLength="254" placeholder="name@example.com"/></label>
     </div>
     <label>What do you need help with?<input value={form.subject} onChange={e=>setForm(v=>({...v,subject:e.target.value}))} required minLength="3" maxLength="120"/></label>
     <label>Message / booking reference<textarea value={form.message} onChange={e=>setForm(v=>({...v,message:e.target.value}))} required minLength="10" maxLength="1200" rows="4" placeholder="Describe the issue. Add your booking reference when relevant."/></label>
     {error&&<div className="notice error" role="alert">{error}</div>}{notice&&<div className="notice success" role="status">{notice}</div>}
     <button className="submit" disabled={busy}>{busy?'Sending request…':'Send support request'} <span>↗</span></button>
     <small className="privacy">Your request is stored securely for the RideYou team to review.</small>
    </form>
   </div>
  </div>
 </section>;
}
