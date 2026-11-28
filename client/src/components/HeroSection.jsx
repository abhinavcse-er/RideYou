export default function HeroSection() {
  return <section className="hero wrap">
    <div className="hero-copy"><div className="eyebrow"><i/> BIHAR KI APNI RIDE SERVICE</div>
      <h1>Move freely.<br/><em>Ride locally.</em></h1>
      <p className="intro">Apni destination batayein, available vehicle chuniye. RideYou Admin aapki request par availability aur final fare confirm karega.</p>
      <a className="cta" href="#booking">Book your ride <b>↗</b></a>
      <p className="assure">✓ No advance payment · Fare confirmed before your trip</p>
    </div>
    <div className="hero-photo"><img className="hero-image" src="https://images.unsplash.com/photo-1663852397535-18292e115327?auto=format&fit=crop&w=1200&q=75" alt="Car travelling on an open road" fetchPriority="high"/><div className="photo-shade"/><div className="photo-caption"><span>RIDEYOU · BIHAR</span><strong>Your ride,<br/>your way.</strong><small>Local rides · Outstation journeys</small></div></div>
  </section>;
}
