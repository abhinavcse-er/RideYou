export default function HeroSection() {
  return <section className="hero wrap" aria-labelledby="hero-title">
    <div className="hero-copy">
      <div className="eyebrow"><i/> BIHAR KI APNI FOUR-WHEELER RIDE</div>
      <h1 id="hero-title">Jahan jaana hai,<br/><em>RideYou karega.</em></h1>
      <p className="intro">Local travel ho ya outstation trip — apni gaadi chuniye, pickup aur destination batayein. Booking Manager aapko availability aur final fare confirm karega.</p>
      <div className="hero-actions">
        <a className="cta" href="#booking">Book your ride <b>→</b></a>
        <a className="hero-secondary" href="#vehicles">Explore cars <span>↓</span></a>
      </div>
      <div className="hero-trust">
        <span>✓ No advance payment</span>
        <span>✓ Verified four-wheelers</span>
        <span>✓ Local support</span>
      </div>
    </div>
    <div className="hero-visual">
      <img className="hero-image" src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85" alt="Premium car ready for a journey" fetchPriority="high"/>
      <div className="hero-visual-shade"/>
      <div className="hero-photo-top"><span className="hero-live-dot"/> LOCAL & OUTSTATION RIDES</div>
      <div className="photo-caption"><span>YOUR JOURNEY, OUR PRIORITY</span><strong>Har safar,<br/>aapke saath.</strong><small>Simple booking · Transparent fare · Local support</small></div>
      <div className="hero-float-card"><span className="hero-float-icon">✓</span><div><strong>Easy booking</strong><small>Request first. Confirm after fare approval.</small></div></div>
    </div>
  </section>;
}
