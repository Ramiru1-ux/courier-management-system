import React from 'react';
import { MapPin } from 'lucide-react';

export default function RouteMap({ stops = [], className = '' }) {
  return <div className={`route-map ${className}`} role="img" aria-label="Delivery route map"><div className="route-map-grid" />{stops.map((stop, index) => <span className={`route-map-marker marker-${index % 4}`} style={{ left: `${18 + ((index * 19) % 68)}%`, top: `${22 + ((index * 23) % 58)}%` }} title={`${index + 1}. ${stop.recipient || stop.name || 'Delivery stop'}`} key={stop.id || stop.trackingNumber || index}><b>{index + 1}</b><MapPin size={19} /></span>)}<span className="route-map-label">{stops.length ? `${stops.length} delivery stops` : 'No stops planned'}</span></div>;
}
