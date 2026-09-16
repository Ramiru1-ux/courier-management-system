import React, { useState } from 'react';
import { Check, ChevronDown, Clock3, Route, Sparkles } from 'lucide-react';

export default function RouteOptimizerPanel({ driverOptions = [], initialDriver = '', onOptimize, onSave }) {
  const [driver, setDriver] = useState(initialDriver || driverOptions[0]?.id || '');
  const [optimized, setOptimized] = useState(false);
  const optimize = () => { setOptimized(true); onOptimize?.(driver); };
  return <section className="route-optimizer-panel"><div className="route-optimizer-heading"><div><span>Route planning</span><h2>Optimize delivery route</h2><p>Reduce distance while respecting stop priority and driver capacity.</p></div><Route size={20} /></div><label className="route-optimizer-field">Driver<span><select value={driver} onChange={(event) => { setDriver(event.target.value); setOptimized(false); }}><option value="">Select a driver</option>{driverOptions.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><ChevronDown size={14} /></span></label><div className="route-optimizer-metrics"><Metric label="Stops" value={optimized ? '12' : '0'} /><Metric label="Distance" value={optimized ? '38.4 km' : '--'} /><Metric label="Est. time" value={optimized ? '1h 42m' : '--'} /></div><button className="route-optimize-button" type="button" onClick={optimize} disabled={!driver}><Sparkles size={15} /> {optimized ? 'Route optimized' : 'Optimize route'}</button>{optimized && <div className="route-optimized-notice"><Check size={14} /> Suggested sequence is ready for review.</div>}<button className="route-save-button" type="button" onClick={() => onSave?.({ driverId: driver, optimized })} disabled={!optimized}><Clock3 size={14} /> Save route assignment</button></section>;
}
function Metric({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
