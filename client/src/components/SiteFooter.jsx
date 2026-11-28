export default function SiteFooter(){
 return <footer className="footer wrap">
  <a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
  <p>Gaon se shehar tak, safar aasaan.</p>
  <nav className="footer-links" aria-label="Footer links"><a href="#workspace">Account centre</a><a href="#booking">Book a ride</a><a href="#help">Get help</a></nav>
  <small>© {new Date().getFullYear()} RideYou. All rights reserved.</small>
 </footer>;
}
