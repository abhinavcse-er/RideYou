export default function HowItWorks() {
  const steps = [
    ['01','Gaadi chuniye','Apne safar ke hisaab se available vehicle dekhein.'],
    ['02','Booking request bhejein','Pickup, destination aur travel details fill karein.'],
    ['03','Booking Team confirm karegi','Admin owner se availability aur fare check karega.'],
    ['04','Fare accept karein','Aapki manzoori ke baad booking confirm hogi.'],
    ['05','Aaram se safar karein','Confirmation ke baad trip ki zaroori details milengi.'],
  ];
  return <section className="journey-section" id="how"><div className="wrap">
    <div className="journey-head"><div><div className="eyebrow"><i/> HOW RIDEYOU WORKS</div><h2>Booking ka simple<br/><em>process.</em></h2></div><p>Customer ke liye simple booking. Vehicle owner aur customer ke beech coordination Admin karta hai.</p></div>
    <div className="journey-steps">{steps.map(([number,title,description])=><article key={number}><span>{number}</span><b>{title}</b><p>{description}</p></article>)}</div>
  </div></section>;
}
