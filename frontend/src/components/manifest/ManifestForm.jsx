import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function ManifestForm({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ origin: 'Colombo Central', destination: 'Kandy Hub', vehicle: 'VAN-024', driver: 'Kasun Dissanayake' });
  if (!open) return null;
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); onCreate?.(form); };
  return <div className="manifest-modal-backdrop" onClick={onClose} role="presentation"><form className="manifest-form" onSubmit={submit} onClick={(event) => event.stopPropagation()}><button className="manifest-close" type="button" onClick={onClose} aria-label="Close"><X size={17} /></button><span className="manifest-eyebrow">Transfer manifest</span><h2>Create manifest</h2><p>Group shipments for a verified branch-to-branch transfer.</p><Field label="Origin branch" name="origin" value={form.origin} onChange={update} options={['Colombo Central', 'Colombo North', 'Galle Branch']} /><Field label="Destination hub" name="destination" value={form.destination} onChange={update} options={['Kandy Hub', 'Jaffna Hub', 'Galle Hub', 'Kurunegala Hub']} /><Field label="Vehicle" name="vehicle" value={form.vehicle} onChange={update} options={['VAN-024', 'TRUCK-011', 'BIKE-088']} /><Field label="Driver" name="driver" value={form.driver} onChange={update} options={['Kasun Dissanayake', 'Ruwan Jayasuriya', 'Sunil Perera']} /><div className="manifest-form-actions"><button className="manifest-cancel" type="button" onClick={onClose}>Cancel</button><button className="manifest-submit" type="submit">Create manifest</button></div></form></div>;
}
function Field({ label, name, value, onChange, options }) { return <label className="manifest-field">{label}<span><select name={name} value={value} onChange={onChange}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></span></label>; }
