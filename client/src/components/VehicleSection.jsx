export default function VehicleSection({ vehicles, loading, error, selected, onSelect }) {
  return <section className="vehicle-market section-wrap" id="vehicles">
    <div className="section-heading"><div><span className="eyebrow">YOUR NEXT RIDE</span><h2>Choose your <em>vehicle.</em></h2></div><p>Verified vehicles for local travel and outstation journeys.</p></div>
    {loading ? <div className="empty">Gaadiyon ki list load ho rahi hai…</div> : vehicles.length === 0 ? <div className="empty">{error || 'Abhi koi approved gaadi available nahi hai. Baad mein dobara check karein.'}</div> :
      <div className="vehicle-grid">{vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} selected={selected === vehicle.id} onSelect={onSelect} />)}</div>}
  </section>;
}
import VehicleCard from './VehicleCard.jsx';