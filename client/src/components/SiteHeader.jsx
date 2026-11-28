export default function SiteHeader({ health }) {
  return <header className="top wrap" id="home">
    <a className="logo" href="#home" aria-label="RideYou home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
    <nav className="main-nav" aria-label="Main navigation"><a href="#vehicles">Explore rides</a><a href="#how">How it works</a><a href="#workspace">My booking</a></nav>
    <div className="top-actions"><span className={'service-state '+(health==='online'?'online':'')}>{health==='online'?'SERVICE ONLINE':health==='offline'?'SERVICE OFFLINE':'CONNECTING'}</span><a className="top-link" href="#booking">Book a ride <span aria-hidden="true">↗</span></a></div>
  </header>;
}
