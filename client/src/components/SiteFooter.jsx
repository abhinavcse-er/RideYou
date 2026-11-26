export default function SiteFooter() {
  return <footer className="footer wrap">
    <a className="logo" href="#home"><span className="mark">R</span><span>Ride<span className="orange">You</span><small>BIHAR · INDIA</small></span></a>
    <p>Gaon se shehar tak, safar aasaan.</p>
    <small>© {new Date().getFullYear()} RideYou. All rights reserved.</small>
  </footer>;
}
