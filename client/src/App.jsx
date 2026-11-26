import { useEffect, useMemo, useState } from 'react';

const STORE = 'rideyou-demo-bookings-v1';
const drivers = [{ id:'D1', name:'Raju Kumar' }, { id:'D2', name:'Amit Kumar' }, { id:'D3', name:'Sanjay Singh' }, { id:'D4', name:'Pintu Kumar' }];
const vehicles = [{ id:'V1', name:'Maruti Swift · BR-22-AB-1234' }, { id:'V2', name:'WagonR · BR-22-CD-5678' }, { id:'V3', name:'Bolero · BR-22-EF-9012' }, { id:'V4', name:'Ertiga · BR-22-GH-3456' }];
const blank = { name:'', phone:'', pickup:'', destination:'', date:'', time:'', passengers:'1', type:'local', note:'' };
const money = value => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(Number(value || 0));
const stamp = () => new Date().toISOString();
const ref = () => 'RY-' + Math.random().toString(36).slice(2,8).toUpperCase();

export default function App() {
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState(blank);
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; }
  });
  const [phone, setPhone] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(bookings)); }, [bookings]);
  const update = (id, patch) => setBookings(list => list.map(b => b.id === id ? { ...b, ...patch, updatedAt:stamp() } : b));
  const visible = useMemo(() => bookings.filter(b => {
    const match = [b.reference,b.name,b.phone,b.pickup,b.destination].join(' ').toLowerCase().includes(query.toLowerCase());
    return match && (filter === 'all' || b.status === filter);
  }), [bookings, filter, query]);
  const change = e => setForm(v => ({ ...v, [e.target.name]:e.target.value }));

  function submit(e) {
    e.preventDefault();
    const rideAt = new Date(form.date + 'T' + form.time);
    if (!Number.isFinite(rideAt.getTime()) || rideAt.getTime() < Date.now() + 30 * 60 * 1000) {
      setNotice('Kripya kam se kam 30 minute baad ka pickup time chunein.'); return;
    }
    const booking = { ...form, id:ref(), reference:ref(), passengers:Number(form.passengers), status:'requested', fare:'', driverId:'', vehicleId:'', createdAt:stamp() };
    setBookings(list => [booking, ...list]);
    setPhone(form.phone);
    setForm(blank);
    setNotice('Request save ho gayi! Aapka reference: ' + booking.reference);
  }

  const statusLabel = { requested:'New request', quoted:'Fare sent', accepted:'Fare accepted', assigned:'Driver assigned', started:'Trip started', completed:'Completed', cancelled:'Cancelled' };
  const statusClass = status => 'status status-' + status;

  function exportData() {
    const blob = new Blob([JSON.stringify(bookings,null,2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'rideyou-demo-bookings.json'; a.click(); URL.revokeObjectURL(url);
  }

  return <main>
    <header className="top wrap">
      <a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
      <nav className="main-nav"><a href="#features">Features</a><a href="#journey">How it works</a><a href="#workspace">Live demo</a></nav><div className="top-actions"><span className="demo-pill">CLIENT PREVIEW</span><a className="top-link" href="#booking">Book a ride ↗</a></div>
    </header>

    <section className="hero wrap" id="home">
      <div><div className="eyebrow"><i/> BIHAR KI APNI RIDE SERVICE</div>
        <h1>Jahan jaana hai,<br/><em>wahan chaliye.</em></h1>
        <p className="intro">Gaon ho ya shehar, local ride ho ya outstation safar — apni booking request aasani se bhejiye.</p>
        <a className="cta" href="#booking">Ride book karein <b>↓</b></a>
        <p className="assure">✓ Pehle fare confirm, phir booking pakki</p>
      </div>
      <div className="hero-photo"><div className="hero-visual" aria-hidden="true"/><div className="photo-shade"/><div className="photo-caption"><span>SAFAR AAPKA</span><strong>Har raaste par,<br/>aapke saath.</strong><small>Local rides · Outstation journeys</small></div><div className="photo-stamp">RIDEYOU<br/><b>BIHAR</b></div></div>
    </section>

    <section className="ride-types wrap">
      <div className="section-heading"><div><div className="eyebrow"><i/> PICK YOUR JOURNEY</div><h2>Har safar ke liye<br/><em>ek sahi ride.</em></h2></div><p>Chhoti doori ho ya lamba safar, apni zaroorat ke hisaab se booking request bhejein.</p></div>
      <div className="ride-type-grid">
        <article className="type-card"><div><span>01 / CITY & TOWN</span><h3>Local rides</h3><p>Market, station, hospital ya daily travel.</p></div></article>
        <article className="type-card"><div><span>02 / FAMILY TRAVEL</span><h3>Comfort rides</h3><p>Family aur group ke safar ke liye.</p></div></article>
        <article className="type-card"><div><span>03 / LONG DISTANCE</span><h3>Outstation</h3><p>Ek shehar se doosre shehar tak.</p></div></article>
      </div>
      <p className="photo-credit">Illustrative travel photography: <a href="https://unsplash.com/photos/a-car-driving-on-a-road-x-dyoS4EmM8" target="_blank" rel="noreferrer">Vignesh Rajendran</a>, <a href="https://unsplash.com/photos/a-white-car-parked-on-a-dirt-road-ns6i92wlfsM" target="_blank" rel="noreferrer">Shabd Raj</a> and <a href="https://unsplash.com/photos/a-car-driving-down-a-road-at-sunset-kCwqxF6-b2M" target="_blank" rel="noreferrer">Sukumar Bardoloi</a> / Unsplash.</p>
    </section>

    <section className="showcase" id="features">
      <div className="wrap">
        <div className="showcase-head"><div><div className="eyebrow"><i/> ONE PLATFORM · THREE EXPERIENCES</div><h2>RideYou ka poora<br/><em>system, ek jagah.</em></h2></div><p>Customer ke simple booking experience se lekar admin ke complete control aur driver ke trip updates tak — ek connected ride operation.</p></div>
        <div className="feature-groups">
          <div className="feature-group">
            <div className="group-label"><span>01</span><div><small>FOR PASSENGERS</small><h3>Customer experience</h3></div></div>
            <div className="feature-cards">
              <article className="feature-card"><b>↗</b><h4>Easy village-friendly booking</h4><p>Simple form, clear Hindi-friendly labels. Customer ko sirf apna naam, mobile aur pickup/destination dena hai.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>₹</b><h4>Fare before confirmation</h4><p>Team fare quote bhejegi. Customer accept kare tabhi booking aage badhegi — no surprise pricing.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>◎</b><h4>Booking status & history</h4><p>Reference number se request, fare, driver assignment aur trip completion ka status dekh sakega.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>♧</b><h4>Driver & vehicle details</h4><p>Assignment ke baad assigned driver, vehicle name/number aur approved photo customer ko dikh sakti hai.</p><span className="feature-state plan-state">LAUNCH SCOPE</span></article>
            </div>
          </div>
          <div className="feature-group">
            <div className="group-label"><span>02</span><div><small>FOR OPERATIONS TEAM</small><h3>Admin control room</h3></div></div>
            <div className="feature-cards">
              <article className="feature-card"><b>▤</b><h4>All bookings in one dashboard</h4><p>New, quoted, accepted, assigned, started, completed aur cancelled requests ko search/filter karein.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>⇄</b><h4>Manual fare & approval</h4><p>Admin route aur ride details dekhkar fare set kare. Customer approval ke bina assignment nahi.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>▣</b><h4>Driver & vehicle allocation</h4><p>Available driver aur suitable vehicle choose karein; trip ka assignment record maintain ho.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>◷</b><h4>Fleet & booking oversight</h4><p>Vehicle availability, trip schedule, booking history, cancellations aur operational reports.</p><span className="feature-state plan-state">LAUNCH SCOPE</span></article>
            </div>
          </div>
          <div className="feature-group">
            <div className="group-label"><span>03</span><div><small>FOR DRIVERS</small><h3>Driver workspace</h3></div></div>
            <div className="feature-cards">
              <article className="feature-card"><b>⌖</b><h4>Assigned trip list</h4><p>Driver ko apni assigned ride, pickup, destination, passenger aur schedule dikhe.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>▶</b><h4>Start & complete trip</h4><p>Driver trip start aur complete mark kare. Status customer/admin view mein update ho.</p><span className="feature-state demo-state">DEMO PREVIEW</span></article>
              <article className="feature-card"><b>▧</b><h4>Vehicle & profile details</h4><p>Driver ko allocated vehicle, basic trip instructions aur profile information mile.</p><span className="feature-state plan-state">LAUNCH SCOPE</span></article>
              <article className="feature-card"><b>◉</b><h4>Private communication</h4><p>Customer aur driver in-app chat ya masked calling se baat karein — personal number public na ho.</p><span className="feature-state plan-state">LAUNCH SCOPE</span></article>
            </div>
          </div>
          <div className="feature-group">
            <div className="group-label"><span>04</span><div><small>PLATFORM FOUNDATION</small><h3>Trust & scale</h3></div></div>
            <div className="feature-cards">
              <article className="feature-card"><b>☎</b><h4>Official owner contact</h4><p>Public website par sirf RideYou owner/business ka approved phone aur WhatsApp contact show hoga.</p><span className="feature-state plan-state">LAUNCH SCOPE</span></article>
              <article className="feature-card"><b>⌑</b><h4>Secure role-based access</h4><p>Separate customer, driver aur invite-only admin access; admin actions ka audit record.</p><span className="feature-state plan-state">BACKEND SCOPE</span></article>
              <article className="feature-card"><b>✓</b><h4>Availability protection</h4><p>Scheduled trips ke liye driver/vehicle conflict check, taaki ek gaadi do bookings mein assign na ho.</p><span className="feature-state plan-state">BACKEND SCOPE</span></article>
              <article className="feature-card"><b>▣</b><h4>Android app roadmap</h4><p>Same secured backend ke saath customer aur driver Android experience; future updates ek hi system se.</p><span className="feature-state plan-state">FUTURE RELEASE</span></article>
            </div>
          </div>
        </div>
        <div className="privacy-strip"><div className="privacy-icon">✦</div><div><small>PRIVACY BY DESIGN</small><h3>Customer ko owner ka contact. Driver ka personal number private.</h3><p>Public website par RideYou ka official contact/WhatsApp rahega. Driver-customer communication secure in-app channel ke through plan ki gayi hai.</p></div><span className="feature-state plan-state">PRODUCTION FEATURE</span></div>
      </div>
    </section>

    <section className="journey-section" id="journey"><div className="wrap">
      <div className="journey-head"><div><div className="eyebrow"><i/> HOW A RIDE MOVES</div><h2>Request se destination tak,<br/><em>har step clear.</em></h2></div><p>Manual fare approval aur admin assignment ke saath controlled booking flow.</p></div>
      <div className="journey-steps">
        <article><span>01</span><b>Customer request</b><p>Customer pickup, destination, date aur passenger details bhejta hai.</p></article>
        <article><span>02</span><b>Admin quotes fare</b><p>Admin request review karke fare share karta hai.</p></article>
        <article><span>03</span><b>Customer approves</b><p>Customer quote accept kare tabhi ride confirm process aage badhe.</p></article>
        <article><span>04</span><b>Driver + vehicle assigned</b><p>Admin suitable driver aur vehicle allocate karta hai.</p></article>
        <article><span>05</span><b>Trip updates</b><p>Driver start aur complete status update karta hai; customer progress dekh sakta hai.</p></article>
      </div>
      <div className="roadmap-row"><div><small>SAFETY & RELIABILITY ROADMAP</small><strong>No double-booking · Secure role login · Audit trail · Notifications · Backups</strong></div><span className="feature-state plan-state">BACKEND IMPLEMENTATION</span></div>
    </div></section>

    <section className="features wrap">
      <div><b>01</b><strong>Simple booking</strong><small>Bas kuch zaroori details</small></div>
      <div><b>02</b><strong>Fare pehle confirm</strong><small>Aapki manzoori zaroori</small></div>
      <div><b>03</b><strong>Driver details</strong><small>Assignment ke baad</small></div>
    </section>

    <section className="booking" id="booking"><div className="wrap booking-grid">
      <div className="booking-copy"><div className="eyebrow"><i/> BOOK YOUR JOURNEY</div><h2>Chaliye,<br/><em>plan banate hain.</em></h2>
        <p>Form bhariye. RideYou team request check karke aapko fare batayegi.</p>
        <aside><b>i</b><span><strong>Abhi payment nahi karna hai</strong><br/>Pehle fare bataya jayega. Aapki manzoori ke baad hi gaadi assign hogi.</span></aside>
      </div>
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
        {notice && <div className="notice success" role="status">{notice}</div>}
        <button className="submit">Booking request bhejein <span>↗</span></button>
        <small className="privacy">Demo: details sirf isi browser mein save hoti hain.</small>
      </form>
    </div></section>

    <section className="workspace" id="workspace"><div className="wrap">
      <div className="workspace-head"><div><div className="eyebrow"><i/> RIDEYOU CONTROL ROOM</div><h2>Manage <em>rides.</em></h2><p>Demo workspace — roles switch karke booking process dekhein.</p></div><div className="demo-pill large">SAMPLE / LOCAL DATA</div></div>
      <div className="role-tabs" role="tablist" aria-label="Demo role">
        <button className={role==='customer'?'active':''} onClick={()=>setRole('customer')}>Customer</button>
        <button className={role==='admin'?'active':''} onClick={()=>setRole('admin')}>Admin</button>
        <button className={role==='driver'?'active':''} onClick={()=>setRole('driver')}>Driver</button>
      </div>
      {role==='customer' && <div className="panel">
        <div className="panel-title"><div><h3>My booking status</h3><p>Apne mobile number se demo booking dekhein.</p></div></div>
        <div className="lookup"><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Apna 10-digit mobile number" inputMode="numeric" maxLength="10"/><span>{bookings.filter(b=>b.phone===phone).length} booking(s)</span></div>
        {bookings.filter(b=>b.phone===phone && phone.length===10).length===0 ? <div className="empty">Booking yahan dikhegi. Pehle booking form submit karein.</div> : bookings.filter(b=>b.phone===phone).map(b=><article className="ride-card" key={b.id}><div className="ride-top"><b>{b.reference}</b><span className={statusClass(b.status)}>{statusLabel[b.status]}</span></div><strong>{b.pickup} → {b.destination}</strong><small>{b.date} · {b.time} · {b.passengers} passenger(s)</small>{b.fare && <p className="fare">Quoted fare: {money(b.fare)}</p>}{b.status==='quoted' && <button className="mini primary" onClick={()=>update(b.id,{status:'accepted'})}>Fare accept karein</button>}{b.status==='assigned' && <p className="assigned">Driver: {drivers.find(d=>d.id===b.driverId)?.name || 'Assigned'} · Vehicle: {vehicles.find(v=>v.id===b.vehicleId)?.name || 'Assigned'}</p>}</article>)}
      </div>}
      {role==='admin' && <div className="panel">
        <div className="panel-title"><div><h3>Admin dashboard</h3><p>Fare quote, acceptance aur driver/vehicle assignment manage karein.</p></div><button className="mini" onClick={exportData}>Export JSON ↓</button></div>
        <div className="stats"><div><b>{bookings.length}</b><small>Total</small></div><div><b>{bookings.filter(b=>b.status==='requested').length}</b><small>New</small></div><div><b>{bookings.filter(b=>b.status==='accepted').length}</b><small>Accepted</small></div><div><b>{bookings.filter(b=>b.status==='completed').length}</b><small>Completed</small></div></div>
        <div className="filters"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, phone, route..."/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option>{Object.entries(statusLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        {visible.length===0 ? <div className="empty">Abhi koi booking nahi hai. Pehle customer tab se request submit karein.</div> : visible.map(b=><article className="ride-card" key={b.id}>
          <div className="ride-top"><b>{b.reference}</b><span className={statusClass(b.status)}>{statusLabel[b.status]}</span></div>
          <strong>{b.name} · {b.phone}</strong><p>{b.pickup} → {b.destination}</p><small>{b.date} · {b.time} · {b.type} · {b.passengers} passenger(s)</small>{b.note && <small className="note">Note: {b.note}</small>}
          {b.status==='requested' && <div className="action-row"><label>Fare (₹)<input type="number" min="0" value={b.fare} placeholder="Enter fare" onChange={e=>update(b.id,{fare:e.target.value})}/></label><button className="mini primary" disabled={!b.fare || Number(b.fare)<0} onClick={()=>update(b.id,{status:'quoted'})}>Send quote</button></div>}
          {b.status==='accepted' && <div className="action-row"><label>Driver<select value={b.driverId} onChange={e=>update(b.id,{driverId:e.target.value})}><option value="">Choose driver</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label>Vehicle<select value={b.vehicleId} onChange={e=>update(b.id,{vehicleId:e.target.value})}><option value="">Choose vehicle</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label><button className="mini primary" disabled={!b.driverId || !b.vehicleId} onClick={()=>update(b.id,{status:'assigned'})}>Assign</button></div>}
          {b.status==='assigned' && <p className="assigned">{drivers.find(d=>d.id===b.driverId)?.name} · {vehicles.find(v=>v.id===b.vehicleId)?.name}</p>}
          {!['completed','cancelled'].includes(b.status) && <button className="mini danger" onClick={()=>update(b.id,{status:'cancelled'})}>Cancel booking</button>}
        </article>)}
      </div>}
      {role==='driver' && <div className="panel"><div className="panel-title"><div><h3>Driver dashboard</h3><p>Assigned trips aur trip status.</p></div></div>
        {bookings.filter(b=>['assigned','started'].includes(b.status)).length===0 ? <div className="empty">Koi assigned trip nahi hai. Admin tab se fare accept karke driver aur vehicle assign karein.</div> : bookings.filter(b=>['assigned','started'].includes(b.status)).map(b=><article className="ride-card" key={b.id}><div className="ride-top"><b>{b.reference}</b><span className={statusClass(b.status)}>{statusLabel[b.status]}</span></div><strong>{b.pickup} → {b.destination}</strong><p>{b.name} · {b.phone}</p><small>{b.date} · {b.time}</small><p className="assigned">{vehicles.find(v=>v.id===b.vehicleId)?.name}</p>{b.status==='assigned' ? <button className="mini primary" onClick={()=>update(b.id,{status:'started'})}>Start trip</button> : <button className="mini primary" onClick={()=>update(b.id,{status:'completed'})}>Complete trip</button>}</article>)}
      </div>}
      <p className="demo-warning">Demo only: role switch is not authentication. Data is stored in this browser only and is not shared with another device or user. Do not enter real customer information.</p>
    </div></section>

    <footer className="footer wrap"><a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a><p>Safar aapka. Saath RideYou ka.</p><small>© {new Date().getFullYear()} RideYou</small></footer>
  </main>;
}
