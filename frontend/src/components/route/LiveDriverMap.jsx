import React, { useMemo, useState } from 'react';
import { MapPin, Navigation, Radio } from 'lucide-react';

export default function LiveDriverMap({ drivers = [], onDriverSelect }) {
  const [selected, setSelected] = useState(null);
  const markers = useMemo(() => drivers.filter((driver) => driver.latitude != null && driver.longitude != null), [drivers]);
  const choose = (driver) => { setSelected(driver.id); onDriverSelect?.(driver); };
  return <div className="live-driver-map"><div className="live-map-grid" />{markers.map((driver, index) => <button type="button" className={`live-driver-marker ${driver.status?.toLowerCase() || 'available'} ${selected === driver.id ? 'selected' : ''}`} style={{ left: `${12 + ((index * 23) % 72)}%`, top: `${20 + ((index * 29) % 62)}%` }} onClick={() => choose(driver)} title={driver.name} key={driver.id}><MapPin size={19} /><span>{driver.name}</span></button>)}<div className="live-map-legend"><Radio size={14} /> {markers.length} drivers reporting location</div>{!markers.length && <div className="live-map-empty"><Navigation size={20} />No live driver locations available</div>}</div>;
}
