import React, { useState } from 'react';
import { Check, ChevronDown, Truck, X } from 'lucide-react';

export default function DriverAssignmentModal({ open, shipment, drivers = [], onClose, onAssign }) {
  const [driverId, setDriverId] = useState('');
  if (!open) return null;
  const assign = (event) => {
    event.preventDefault();
    const driver = drivers.find((item) => item.id === driverId);
    if (driver && onAssign) onAssign({ shipment, driver });
  };
  return <div className="assignment-overlay" onClick={onClose} role="presentation"><div className="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-title" onClick={(event) => event.stopPropagation()}><button className="assignment-close" type="button" onClick={onClose} aria-label="Close"><X size={17} /></button><span className="assignment-eyebrow">Dispatch assignment</span><h2 id="assignment-title">Assign a driver</h2><p className="assignment-subtitle">Choose an available driver for <strong>{shipment?.trackingNumber || shipment?.id || 'this shipment'}</strong>.</p><div className="assignment-shipment"><span><Truck size={17} /></span><div><strong>{shipment?.recipient || 'Shipment recipient'}</strong><small>{shipment?.destination || 'Delivery destination'}</small></div></div><form onSubmit={assign}><label className="assignment-field">Available driver<span><select value={driverId} onChange={(event) => setDriverId(event.target.value)} required><option value="">Select a driver</option>{drivers.map((driver) => <option value={driver.id} key={driver.id}>{driver.name} · {driver.area || driver.location || 'Available'}</option>)}</select><ChevronDown size={14} /></span></label><div className="assignment-actions"><button className="assignment-cancel" type="button" onClick={onClose}>Cancel</button><button className="assignment-submit" type="submit" disabled={!driverId}><Check size={15} /> Assign driver</button></div></form></div></div>;
}
