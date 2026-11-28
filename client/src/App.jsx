import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import VehicleSection from './components/VehicleSection.jsx';
import BookingSection from './components/BookingSection.jsx';
import AccountSection from './components/AccountSection.jsx';
import useRideYou from './hooks/useRideYou.js';

export default function App(){
 const ride=useRideYou();
 return <main className="app-shell">
  <SiteHeader health={ride.health}/>
  <HeroSection/>
  <VehicleSection vehicles={ride.vehicles} loading={ride.loading} error={ride.error} selected={ride.selected} onSelect={id=>ride.setSelected(id)}/>
  <BookingSection booking={ride.booking} setBooking={ride.setBooking} chosen={ride.chosen} submitBooking={ride.submitBooking} error={ride.error} notice={ride.notice} reference={ride.reference} selected={ride.selected} submitting={ride.submitting} customerToken={ride.customerToken} customerUser={ride.customerUser}/>
  <HowItWorks/>
  <AccountSection {...ride}/>
  <SiteFooter/>
 </main>;
}
