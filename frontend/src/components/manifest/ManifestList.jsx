import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';

export default function ManifestList({ manifests = [], selectedId, onSelect }) {
  return <div className="manifest-list">{manifests.map((manifest) => <button className={selectedId === manifest.id ? 'manifest-row active' : 'manifest-row'} type="button" key={manifest.id} onClick={() => onSelect?.(manifest)}><span className="manifest-icon"><FileText size={16} /></span><span className="manifest-row-copy"><strong>{manifest.number || manifest.id}</strong><small>{manifest.origin} to {manifest.destination}</small></span><span className="manifest-row-meta"><strong>{manifest.shipmentCount} shipments</strong><small>{manifest.status}</small></span><ChevronRight size={15} /></button>)}</div>;
}
