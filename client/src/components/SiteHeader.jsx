export default function SiteHeader({ health }) {
  return <header className="top wrap" id="home">
    <a className="logo" href="#home" aria-label="RideYou home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
    <nav className="main-nav" aria-label="Main navigation"><a href="#vehicles">Gaadiyan</a><a href="#how">Booking kaise karein</a><a href="#workspace">Account</a></nav>
    <div className="top-actions"><span className={'service-state '+(health==='online'?'online':'')}>{health==='online'?'SERVICE ONLINE':health==='offline'?'SERVICE OFFLINE':'CONNECTING'}</span><a className="top-link" href="#vehicles">Gaadi dekhein ↓</a></div>
  </header>;
}
