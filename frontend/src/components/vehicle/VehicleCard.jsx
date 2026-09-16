import React from 'react';
import { CalendarClock, Gauge, MapPin, Truck } from 'lucide-react';

export default function VehicleCard({ vehicle, onMaintenance }) {
  const tone = vehicle.status === 'Available' ? 'teal' : vehicle.status === 'Maintenance due' ? 'coral' : 'amber';
  return <article className="vehicle-card"><div className="vehicle-card-top"><span className="vehicle-icon"><Truck size={19} /></span><div><strong>{vehicle.registration || vehicle.id}</strong><small>{vehicle.type || 'Delivery vehicle'} · {vehicle.model || 'Fleet unit'}</small></div><span className={`vehicle-status ${tone}`}>{vehicle.status}</span></div><div className="vehicle-card-stats"><span><MapPin size={13} />{vehicle.location || 'Depot'}</span><span><Gauge size={13} />{vehicle.mileage || '—'} km</span><span><CalendarClock size={13} />Service {vehicle.serviceDue || 'not set'}</span></div><button className="vehicle-maintenance-button" type="button" onClick={() => onMaintenance?.(vehicle)}>Record maintenance</button></article>;
}
