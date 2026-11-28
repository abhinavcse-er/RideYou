import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import VehicleSection from './components/VehicleSection.jsx';
import BookingSection from './components/BookingSection.jsx';
import AccountSection from './components/AccountSection.jsx';
import useRideYou from './hooks/useRideYou.js';

export default function App() {
 const ride=useRideYou();
 return <main className="app-shell">
  <SiteHeader health={ride.health}/>
  <HeroSection/>
  <VehicleSection vehicles={ride.vehicles} loading={ride.loading} error={ride.error} selected={ride.selected} onSelect={id=>{ride.setSelected(id);}}/>
  <BookingSection booking={ride.booking} setBooking={ride.setBooking} chosen={ride.chosen} submitBooking={ride.submitBooking} error={ride.error} notice={ride.notice} reference={ride.reference} selected={ride.selected} submitting={ride.submitting}/>
  <HowItWorks/>
  <AccountSection workspace={ride.workspace} setWorkspace={ride.setWorkspace} reference={ride.reference} setReference={ride.setReference} lookupPhone={ride.lookupPhone} setLookupPhone={ride.setLookupPhone} checkBooking={ride.checkBooking} statusResult={ride.statusResult} session={ride.session} authClient={ride.authClient} authStep={ride.authStep} sendOtp={ride.sendOtp} verifyOtp={ride.verifyOtp} otpPhone={ride.otpPhone} setOtpPhone={ride.setOtpPhone} otp={ride.otp} setOtp={ride.setOtp} error={ride.error} authBusy={ride.authBusy} ownerData={ride.ownerData} ownerVehicles={ride.ownerVehicles} vehicleForm={ride.vehicleForm} setVehicleForm={ride.setVehicleForm} addVehicle={ride.addVehicle}/>
  <SiteFooter/>
  <a className="mobile-book-cta" href="#booking">Book a ride <span>↗</span></a>
 </main>;
}