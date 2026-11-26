import { useState } from 'react';

const blank = { name:'', phone:'', pickup:'', destination:'', date:'', time:'', passengers:'1', type:'local', note:'' };

export default function App() {
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const change = e => setForm(v => ({ ...v, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMessage(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/bookings`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ name:form.name, phone:form.phone, pickup:form.pickup, destination:form.destination, rideDate:form.date, rideTime:form.time, passengers:form.passengers, tripType:form.type, note:form.note })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request submit nahi hui.');
      setMessage({kind:'success', text:`Request receive ho gayi. Reference: ${data.reference}. Fare confirm karne ke liye team aapse sampark karegi.`});
      setForm(blank);
    } catch (err) {
      setMessage({kind:'error', text:err.message || 'Network error. Dobara try karein.'});
    } finally { setLoading(false); }
  }

  return <main>
    <header className="top wrap">
      <a className="logo" href="#"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
      <a className="top-link" href="#booking">Ride book karein ↗</a>
    </header>
    <section className="hero wrap">
      <div>
        <div className="eyebrow"><i/> BIHAR KI APNI RIDE SERVICE</div>
        <h1>Jahan jaana hai,<br/><em>wahan chaliye.</em></h1>
        <p className="intro">Gaon ho ya shehar, local ride ho ya outstation safar — apni booking request aasani se bhejiye.</p>
        <a className="cta" href="#booking">Ride book karein <b>↓</b></a>
        <p className="assure">✓ Pehle fare confirm, phir booking pakki</p>
      </div>
      <div className="art" aria-label="Illustration of a car on a road"><div className="sun"/><div className="hill"/><div className="car"><div className="roof"/><div className="body"><i/><i/></div><b/><b/></div><span className="art-note">YOUR RIDE.<br/>YOUR WAY.</span></div>
    </section>
    <section className="features wrap">
      <div><b>01</b><strong>Simple booking</strong><small>Bas kuch zaroori details</small></div>
      <div><b>02</b><strong>Fare pehle confirm</strong><small>Admin aapko rate batayega</small></div>
      <div><b>03</b><strong>Driver details</strong><small>Assignment ke baad milengi</small></div>
    </section>
    <section className="booking" id="booking"><div className="wrap booking-grid">
      <div className="booking-copy"><div className="eyebrow"><i/> BOOK YOUR JOURNEY</div><h2>Chaliye,<br/><em>plan banate hain.</em></h2><p>Form bhariye. RideYou team request check karke aapko fare batayegi.</p><aside><b>i</b><span><strong>Abhi payment nahi karna hai</strong><br/>Pehle fare bataya jayega. Aapki manzoori ke baad hi gaadi assign hogi.</span></aside></div>
      <form className="form" onSubmit={submit}>
        <div className="form-title"><div><small>RIDE REQUEST</small><h3>Booking details</h3></div><span>01 / 01</span></div>
        <div className="two">
          <label>Aapka naam<input name="name" value={form.name} onChange={change} placeholder="Jaise: Rahul Kumar" minLength="2" maxLength="80" required/></label>
          <label>Mobile number<input name="phone" value={form.phone} onChange={change} placeholder="10-digit mobile" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength="10" required/></label>
        </div>
        <label>Pickup kahan se hoga?<input name="pickup" value={form.pickup} onChange={change} placeholder="Gaon, landmark ya address" maxLength="180" required/></label>
        <label>Kahan jaana hai?<input name="destination" value={form.destination} onChange={change} placeholder="Destination / shehar ka naam" maxLength="180" required/></label>
        <div className="two">
          <label>Safar ki tareekh<input type="date" name="date" value={form.date} onChange={change} min={new Date().toLocaleDateString('en-CA')} required/></label>
          <label>Pickup ka samay<input type="time" name="time" value={form.time} onChange={change} required/></label>
        </div>
        <div className="two">
          <label>Ride type<select name="type" value={form.type} onChange={change}><option value="local">Local</option><option value="outstation">Outstation</option></select></label>
          <label>Passengers<select name="passengers" value={form.passengers} onChange={change}>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
        </div>
        <label>Extra baat (optional)<textarea name="note" value={form.note} onChange={change} placeholder="Koi zaroori jaankari..." maxLength="500" rows="2"/></label>
        {message && <div className={`notice ${message.kind}`} role="status">{message.text}</div>}
        <button className="submit" disabled={loading}>{loading?'Request bhej rahe hain…':'Booking request bhejein'} <span>↗</span></button>
        <small className="privacy">Aapki details sirf is ride request ko manage karne ke liye use hongi.</small>
      </form>
    </div></section>
    <footer className="footer wrap"><a className="logo" href="#"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a><p>Safar aapka. Saath RideYou ka.</p><small>© {new Date().getFullYear()} RideYou</small></footer>
  </main>;
}
