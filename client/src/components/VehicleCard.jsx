import { money } from '../utils/format.js';

export default function VehicleCard({ vehicle, selected, onSelect }) {
  return <article className={'vehicle-card '+(selected?'vehicle-selected':'')}>
    {vehicle.photo_url ? <img src={vehicle.photo_url} alt={vehicle.vehicle_name} loading="lazy"/> : <div className="vehicle-placeholder">RideYou</div>}
    <div className="vehicle-card-body">
      <div className="vehicle-card-top"><span className="vehicle-tag">VERIFIED VEHICLE</span><span className="vehicle-seats">{vehicle.seats} seater</span></div>
      <h3>{vehicle.vehicle_name}</h3>
      <strong>{money(vehicle.base_fare)}</strong>
      <button className="mini primary" type="button" onClick={()=>onSelect(vehicle.id)}>{selected?'Selected ✓':'Is gaadi ko chunein'}</button>
    </div>
  </article>;
}
