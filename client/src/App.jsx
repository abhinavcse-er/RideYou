import { useEffect, useMemo, useState } from 'react';

const MEDIATORS = ['Booking Manager', 'Booking Sahayak'];
const VEHICLE_KEY = 'rideyou-demo-vehicles-v2';
const BOOKING_KEY = 'rideyou-demo-bookings-v2';
const OWNER_KEY = 'rideyou-demo-owners-v2';
const stamp = () => new Date().toISOString();
const makeId = prefix => prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
const money = value => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(Number(value || 0));
const emptyVehicle = { ownerName:'', ownerPhone:'', vehicleName:'', registration:'', seats:'4', fare:'', driverName:'', driverPhone:'', photo:'' };

export default function App() {
  const [role, setRole] = useState('customer');
  const [mediator, setMediator] = useState(MEDIATORS[0]);
  const [vehicles, setVehicles] = useState(() => { try { return JSON.parse(localStorage.getItem(VEHICLE_KEY) || '[]'); } catch { return []; } });
  const [bookings, setBookings] = useState(() => { try { return JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]'); } catch { return []; } });
  const [owners, setOwners] = useState(() => { try { return JSON.parse(localStorage.getItem(OWNER_KEY) || '[]'); } catch { return []; } });
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [customerForm, setCustomerForm] = useState({ name:'', phone:'', pickup:'', destination:'', date:'', time:'', passengers:'1', note:'' });
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [notice, setNotice] = useState('');
  const [mediatorFilter, setMediatorFilter] = useState('all');

  useEffect(() => { localStorage.setItem(VEHICLE_KEY, JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem(OWNER_KEY, JSON.stringify(owners)); }, [owners]);

  const updateBooking = (id, patch) => setBookings(items => items.map(item => item.id === id ? { ...item, ...patch, updatedAt:stamp() } : item));
  const customerBookings = bookings.filter(item => item.phone === lookupPhone && lookupPhone.length === 10);
  const mediatorBookings = bookings.filter(item => item.mediator === mediator && (mediatorFilter === 'all' || item.status === mediatorFilter));

  function saveVehicle(event) {
    event.preventDefault();
    if (!vehicleForm.photo) { setNotice('Gaadi ki photo upload karna zaroori hai.'); return; }
    const vehicle = { ...vehicleForm, id:makeId('CAR'), seats:Number(vehicleForm.seats), fare:Number(vehicleForm.fare || 0), createdAt:stamp(), active:true };
    setVehicles(items => [vehicle, ...items]);
    setOwners(items => items.some(owner => owner.phone === vehicle.ownerPhone) ? items : [{ name:vehicle.ownerName, phone:vehicle.ownerPhone }, ...items]);
    setVehicleForm(emptyVehicle);
    setNotice('Gaadi ki listing save ho gayi. Ab customer ise dekh sakte hain.');
  }

  function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotice('Kripya image file select karein.'); return; }
    if (file.size > 2 * 1024 * 1024) { setNotice('Photo 2 MB se chhoti rakhein.'); return; }
    const reader = new FileReader();
    reader.onload = () => setVehicleForm(value => ({ ...value, photo:String(reader.result) }));
    reader.readAsDataURL(file);
  }

  function submitBooking(event) {
    event.preventDefault();
    const vehicle = vehicles.find(item => item.id === selectedVehicle && item.active);
    if (!vehicle) { setNotice('Pehle available gaadi select karein.'); return; }
    const rideAt = new Date(customerForm.date + 'T' + customerForm.time);
    if (!Number.isFinite(rideAt.getTime()) || rideAt.getTime() < Date.now() + 30 * 60 * 1000) {
      setNotice('Pickup kam se kam 30 minute baad ka chunein.'); return;
    }
    const mediatorName = MEDIATORS[bookings.length % MEDIATORS.length];
    const booking = { ...customerForm, id:makeId('RY'), reference:makeId('RY'), vehicleId:vehicle.id, vehicleName:vehicle.vehicleName, mediator:mediatorName, ownerName:vehicle.ownerName, ownerPhone:vehicle.ownerPhone, driverName:vehicle.driverName, driverPhone:vehicle.driverPhone, status:'requested', fare:'', ownerConfirmed:false, createdAt:stamp() };
    setBookings(items => [booking, ...items]);
    setLookupPhone(customerForm.phone);
    setCustomerForm({ name:'', phone:'', pickup:'', destination:'', date:'', time:'', passengers:'1', note:'' });
    setNotice('Request bhej di gayi! ' + mediatorName + ' owner se availability confirm karenge.');
  }

  const statusNames = { requested:'Mediator se sampark', checking:'Owner se availability check ho rahi hai', quoted:'Fare aapki manzoori ke liye', confirmed:'Booking confirmed', completed:'Trip complete', cancelled:'Cancelled' };
  const chosenVehicle = vehicles.find(item => item.id === selectedVehicle);

  return <main>
    <header className="top wrap" id="home">
      <a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
      <nav className="main-nav"><a href="#vehicles">Gaadiyan</a><a href="#how">Kaise kaam karta hai</a><a href="#workspace">Login / Dashboard</a></nav>
      <div className="top-actions"><span className="demo-pill">CLIENT PREVIEW</span><a className="top-link" href="#vehicles">Gaadi dekhein ↓</a></div>
    </header>

    <section className="hero wrap">
      <div><div className="eyebrow"><i/> BIHAR KI APNI RIDE SERVICE</div>
        <h1>Gaadi chuniye,<br/><em>safar pakka kariye.</em></h1>
        <p className="intro">Apni pasand ki gaadi dekhein. RideYou ke mediator owner se baat karke availability aur fare confirm karenge.</p>
        <a className="cta" href="#vehicles">Available gaadi dekhein <b>↓</b></a>
        <p className="assure">✓ Owner se confirmation ke baad hi booking pakki</p>
      </div>
      <div className="hero-photo"><img className="hero-image" src="https://images.unsplash.com/photo-1663852397535-18292e115327?auto=format&fit=crop&w=1000&q=65" alt="Car travelling on a road" fetchPriority="high"/><div className="photo-shade"/><div className="photo-caption"><span>SAFAR AAPKA</span><strong>Har raaste par,<br/>aapke saath.</strong><small>Local rides · Outstation journeys</small></div></div>
    </section>

    <section className="vehicle-market wrap" id="vehicles">
      <div className="section-heading"><div><div className="eyebrow"><i/> AVAILABLE VEHICLES</div><h2>Apni gaadi <em>chuniye.</em></h2></div><p>Owner ki upload ki hui gaadi aur photo dekhein. Booking request mediator ko milegi.</p></div>
      {vehicles.filter(item => item.active).length === 0 ? <div className="empty">Abhi gaadiyan list nahi hui hain. Owner dashboard se pehli gaadi add ki ja sakti hai.</div> :
        <div className="vehicle-grid">{vehicles.filter(item => item.active).map(vehicle => <article className={'vehicle-card ' + (selectedVehicle === vehicle.id ? 'vehicle-selected' : '')} key={vehicle.id}>
          <img src={vehicle.photo} alt={vehicle.vehicleName}/><div className="vehicle-card-body"><h3>{vehicle.vehicleName}</h3><p>{vehicle.seats} seater · {vehicle.registration}</p><strong>{vehicle.fare ? 'Starting ' + money(vehicle.fare) : 'Fare mediator confirm karenge'}</strong><button className="mini primary" onClick={() => { setSelectedVehicle(vehicle.id); setNotice('Gaadi select ho gayi. Neeche booking details bharein.'); }}>Is gaadi ko book karein</button></div>
        </article>)}</div>}
    </section>

    <section className="booking" id="booking"><div className="wrap booking-grid">
      <div className="booking-copy"><div className="eyebrow"><i/> BOOK YOUR JOURNEY</div><h2>Booking request<br/><em>bhejiye.</em></h2><p>{chosenVehicle ? 'Selected: ' + chosenVehicle.vehicleName : 'Pehle upar se gaadi select karein.'}</p><aside><b>i</b><span><strong>Payment abhi nahi karna hai</strong><br/>Mediator owner se baat karke gaadi aur fare confirm karenge.</span></aside>
      </div>
      <form className="form" onSubmit={submitBooking}>
        <div className="form-title"><div><small>RIDE REQUEST</small><h3>Customer details</h3></div><span>01 / 01</span></div>
        <label>Selected vehicle<input value={chosenVehicle?.vehicleName || 'Pehle gaadi select karein'} readOnly required/></label>
        <div className="two"><label>Aapka naam<input value={customerForm.name} onChange={e=>setCustomerForm(v=>({...v,name:e.target.value}))} placeholder="Jaise: Rahul Kumar" minLength="2" maxLength="80" required/></label><label>Mobile number<input value={customerForm.phone} onChange={e=>setCustomerForm(v=>({...v,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} placeholder="10-digit mobile" inputMode="numeric" pattern="[6-9][0-9]{9}" required/></label></div>
        <label>Pickup kahan se hoga?<input value={customerForm.pickup} onChange={e=>setCustomerForm(v=>({...v,pickup:e.target.value}))} placeholder="Gaon, landmark ya address" maxLength="180" required/></label>
        <label>Kahan jaana hai?<input value={customerForm.destination} onChange={e=>setCustomerForm(v=>({...v,destination:e.target.value}))} placeholder="Destination / shehar ka naam" maxLength="180" required/></label>
        <div className="two"><label>Safar ki tareekh<input type="date" value={customerForm.date} onChange={e=>setCustomerForm(v=>({...v,date:e.target.value}))} min={new Date().toLocaleDateString('en-CA')} required/></label><label>Pickup ka samay<input type="time" value={customerForm.time} onChange={e=>setCustomerForm(v=>({...v,time:e.target.value}))} required/></label></div>
        <label>Passengers<select value={customerForm.passengers} onChange={e=>setCustomerForm(v=>({...v,passengers:e.target.value}))}>{[1,2,3,4,5,6,7,8].map(n=><option key={n}>{n}</option>)}</select></label>
        <label>Extra baat (optional)<textarea value={customerForm.note} onChange={e=>setCustomerForm(v=>({...v,note:e.target.value}))} placeholder="Koi zaroori jaankari..." maxLength="500" rows="2"/></label>
        {notice && <div className="notice success" role="status">{notice}</div>}
        <button className="submit" disabled={!selectedVehicle}>Booking request bhejein <span>↗</span></button>
        <small className="privacy">Demo: data isi browser mein save hota hai, doosre device par share nahi hota.</small>
      </form>
    </div></section>

    <section className="journey-section" id="how"><div className="wrap"><div className="journey-head"><div><div className="eyebrow"><i/> SIMPLE BOOKING PROCESS</div><h2>Customer aur owner ke beech<br/><em>RideYou mediator.</em></h2></div><p>Customer ka direct owner/driver se contact nahi hoga. Mediator hi availability, fare aur confirmation coordinate karega.</p></div>
      <div className="journey-steps"><article><span>01</span><b>Owner gaadi list kare</b><p>Owner vehicle photo, details aur driver information upload karega.</p></article><article><span>02</span><b>Customer gaadi chune</b><p>Customer listing dekhkar booking request bhejega.</p></article><article><span>03</span><b>Mediator owner se baat kare</b><p>Booking Manager ya Booking Sahayak availability aur fare confirm karenge.</p></article><article><span>04</span><b>Customer ko confirmation</b><p>Mediator fare batayega; customer accept karega tab booking pakki.</p></article><article><span>05</span><b>Safar shuru</b><p>Confirmed booking par driver aur gaadi ki details customer ko milengi.</p></article></div>
    </div></section>

    <section className="workspace" id="workspace"><div className="wrap">
      <div className="workspace-head"><div><div className="eyebrow"><i/> THREE-SIDE RIDEYOU SYSTEM</div><h2>Alag role, <em>ek platform.</em></h2><p>Owner, mediator aur customer ke liye alag workspace.</p></div><div className="demo-pill large">DEMO PREVIEW · LOCAL DATA</div></div>
      <div className="role-tabs" role="tablist" aria-label="Choose workspace"><button className={role==='customer'?'active':''} onClick={()=>setRole('customer')}>Customer</button><button className={role==='owner'?'active':''} onClick={()=>setRole('owner')}>Vehicle Owner</button><button className={role==='mediator'?'active':''} onClick={()=>setRole('mediator')}>Mediator</button></div>

      {role==='owner' && <div className="panel"><div className="panel-title"><div><h3>Vehicle owner dashboard</h3><p>Apni gaadi, owner details aur driver ki jaankari add karein.</p></div></div>
        <form className="owner-form" onSubmit={saveVehicle}>
          <h4>Owner details</h4><div className="two"><label>Owner ka naam<input value={vehicleForm.ownerName} onChange={e=>setVehicleForm(v=>({...v,ownerName:e.target.value}))} required placeholder="Owner full name"/></label><label>Owner mobile (private)<input value={vehicleForm.ownerPhone} onChange={e=>setVehicleForm(v=>({...v,ownerPhone:e.target.value.replace(/\D/g,'').slice(0,10)}))} required pattern="[6-9][0-9]{9}" placeholder="10-digit number"/></label></div>
          <h4>Gaadi ki details</h4><div className="two"><label>Gaadi ka naam / model<input value={vehicleForm.vehicleName} onChange={e=>setVehicleForm(v=>({...v,vehicleName:e.target.value}))} required placeholder="Jaise: Maruti Ertiga"/></label><label>Vehicle number<input value={vehicleForm.registration} onChange={e=>setVehicleForm(v=>({...v,registration:e.target.value.toUpperCase()}))} required placeholder="BR-22-XX-1234"/></label></div>
          <div className="two"><label>Seating capacity<select value={vehicleForm.seats} onChange={e=>setVehicleForm(v=>({...v,seats:e.target.value}))}>{[4,5,6,7,8,12,17].map(n=><option key={n}>{n}</option>)}</select></label><label>Starting fare (₹, optional)<input type="number" min="0" value={vehicleForm.fare} onChange={e=>setVehicleForm(v=>({...v,fare:e.target.value}))} placeholder="Optional"/></label></div>
          <label>Gaadi ki photo upload karein<input type="file" accept="image/*" onChange={uploadPhoto} required={!vehicleForm.photo}/></label>{vehicleForm.photo && <img className="upload-preview" src={vehicleForm.photo} alt="Vehicle preview"/>}
          <h4>Driver details (private)</h4><div className="two"><label>Driver ka naam<input value={vehicleForm.driverName} onChange={e=>setVehicleForm(v=>({...v,driverName:e.target.value}))} required placeholder="Driver full name"/></label><label>Driver mobile<input value={vehicleForm.driverPhone} onChange={e=>setVehicleForm(v=>({...v,driverPhone:e.target.value.replace(/\D/g,'').slice(0,10)}))} required pattern="[6-9][0-9]{9}" placeholder="10-digit number"/></label></div>
          {notice && <div className="notice success" role="status">{notice}</div>}<button className="submit">Gaadi list karein <span>↗</span></button>
        </form>
        <h4 className="subheading">Aapki listed gaadiyan ({vehicles.length})</h4>{vehicles.length===0 ? <div className="empty">Abhi koi gaadi add nahi hui.</div> : vehicles.map(v=><article className="ride-card owner-listing" key={v.id}><img src={v.photo} alt={v.vehicleName}/><div><strong>{v.vehicleName} · {v.registration}</strong><small>Owner: {v.ownerName} · Driver: {v.driverName}</small><button className="mini danger" onClick={()=>setVehicles(items=>items.filter(item=>item.id!==v.id))}>Listing remove karein</button></div></article>)}
      </div>}

      {role==='mediator' && <div className="panel"><div className="panel-title"><div><h3>Mediator dashboard</h3><p>Customer aur vehicle owner ke beech booking coordinate karein.</p></div></div>
        <label className="mediator-picker">Mediator account<select value={mediator} onChange={e=>setMediator(e.target.value)}>{MEDIATORS.map(name=><option key={name}>{name}</option>)}</select></label>
        <div className="mediator-names">{MEDIATORS.map(name=><span key={name}>{name}</span>)}</div>
        <div className="filters"><select value={mediatorFilter} onChange={e=>setMediatorFilter(e.target.value)}><option value="all">Saari requests</option><option value="requested">New request</option><option value="checking">Checking owner</option><option value="quoted">Fare sent</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
        {mediatorBookings.length===0 ? <div className="empty">Is mediator ke paas abhi koi booking nahi hai.</div> : mediatorBookings.map(b=>{ const vehicle=vehicles.find(v=>v.id===b.vehicleId); return <article className="ride-card" key={b.id}><div className="ride-top"><b>{b.reference}</b><span className={'status status-'+b.status}>{statusNames[b.status]}</span></div><strong>{b.name} · {b.phone}</strong><p>{b.pickup} → {b.destination}</p><small>{b.date} · {b.time} · {b.passengers} passenger(s)</small><p className="assigned">Selected: {b.vehicleName}</p><div className="mediator-private"><b>Owner (private):</b> {b.ownerName} · {b.ownerPhone}<br/><b>Driver (private):</b> {b.driverName} · {b.driverPhone}</div>
          {b.status==='requested' && <button className="mini primary" onClick={()=>updateBooking(b.id,{status:'checking'})}>Owner se availability check karein</button>}
          {b.status==='checking' && <><label className="confirm-owner"><input type="checkbox" checked={b.ownerConfirmed} onChange={e=>updateBooking(b.id,{ownerConfirmed:e.target.checked})}/> Owner ne gaadi available confirm ki hai</label><div className="action-row"><label>Customer ko fare batayein (₹)<input type="number" min="1" value={b.fare} onChange={e=>updateBooking(b.id,{fare:e.target.value})} placeholder="Fare"/></label><button className="mini primary" disabled={!b.ownerConfirmed || !b.fare || Number(b.fare)<=0} onClick={()=>updateBooking(b.id,{status:'quoted'})}>Customer ko fare bhejein</button></div></>}
          {b.status==='quoted' && <p className="assigned">Customer ki manzoori ka intezar · {money(b.fare)}</p>}
          {b.status==='confirmed' && <><p className="assigned">Booking confirmed · {money(b.fare)}</p><button className="mini primary" onClick={()=>updateBooking(b.id,{status:'completed'})}>Trip complete mark karein</button></>}
          {b.status==='cancelled' && <p>Booking cancelled.</p>}
          {!['completed','cancelled'].includes(b.status) && <button className="mini danger" onClick={()=>updateBooking(b.id,{status:'cancelled'})}>Cancel request</button>}
        </article>; })}
      </div>}

      {role==='customer' && <div className="panel"><div className="panel-title"><div><h3>My booking status</h3><p>Apne mobile number se booking aur mediator ka update dekhein.</p></div></div>
        <div className="lookup"><input value={lookupPhone} onChange={e=>setLookupPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="Apna 10-digit mobile number" inputMode="numeric" maxLength="10"/><span>{customerBookings.length} booking(s)</span></div>
        {customerBookings.length===0 ? <div className="empty">Aapki booking yahan dikhegi. Pehle gaadi select karke request bhejein.</div> : customerBookings.map(b=><article className="ride-card" key={b.id}><div className="ride-top"><b>{b.reference}</b><span className={'status status-'+b.status}>{statusNames[b.status]}</span></div><strong>{b.pickup} → {b.destination}</strong><small>{b.date} · {b.time} · {b.vehicleName}</small><p>Mediator: {b.mediator}</p>{b.fare && <p className="fare">Fare: {money(b.fare)}</p>}{b.status==='quoted' && <button className="mini primary" onClick={()=>updateBooking(b.id,{status:'confirmed'})}>Fare accept karein aur booking confirm karein</button>}{b.status==='confirmed' && <div className="assigned"><b>Booking confirmed</b><br/>Gaadi: {b.vehicleName}<br/>Driver: {b.driverName}<br/><small>Driver ka personal number private rahega. Zaroorat par mediator se sampark karein.</small></div>}</article>)}
      </div>}
      <p className="demo-warning">Demo limitation: role switch login/password nahi hai. Data local browser mein hi store hota hai; Supabase se abhi connected nahi hai. Real multi-user booking aur secure access backend phase mein banega.</p>
    </div></section>

    <footer className="footer wrap"><a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a><p>Safar aapka. Saath RideYou ka.</p><small>© {new Date().getFullYear()} RideYou</small></footer>
  </main>;
}
