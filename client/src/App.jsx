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
      <div className="top-actions"><span className="demo-pill">DEMO MODE</span><a className="top-link" href="#booking">Book a ride ↗</a></div>
    </header>

    <section className="hero wrap" id="home">
      <div><div className="eyebrow"><i/> BIHAR KI APNI RIDE SERVICE</div>
        <h1>Jahan jaana hai,<br/><em>wahan chaliye.</em></h1>
        <p className="intro">Gaon ho ya shehar, local ride ho ya outstation safar — apni booking request aasani se bhejiye.</p>
        <a className="cta" href="#booking">Ride book karein <b>↓</b></a>
        <p className="assure">✓ Pehle fare confirm, phir booking pakki</p>
      </div>
      <div className="art" aria-label="Car illustration"><div className="sun"/><div className="hill"/><div className="car"><div className="roof"/><div className="body"><i/><i/></div><b/><b/></div><span className="art-note">YOUR RIDE.<br/>YOUR WAY.</span></div>
    </section>

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
