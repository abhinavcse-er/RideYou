export default function HeroSection() {
  return <section className="hero wrap">
    <div className="hero-copy"><div className="eyebrow"><i/> BIHAR KI APNI RIDE SERVICE</div>
      <h1>Safar ab hoga<br/><em>aur bhi aasaan.</em></h1>
      <p className="intro">Apni pasand ki gaadi chuniye, pickup aur destination batayein. Admin availability aur fare confirm karega.</p>
      <a className="cta" href="#vehicles">Ride book karein <b>→</b></a>
      <p className="assure">✓ Booking confirm hone se pehle koi payment nahi</p>
    </div>
    <div className="hero-photo"><img className="hero-image" src="https://images.unsplash.com/photo-1663852397535-18292e115327?auto=format&fit=crop&w=1200&q=75" alt="Car on an open road" fetchPriority="high"/><div className="photo-shade"/><div className="photo-caption"><span>RIDEYOU · BIHAR</span><strong>Har safar,<br/>aapke saath.</strong><small>Local rides · Outstation journeys</small></div></div>
  </section>;
}
