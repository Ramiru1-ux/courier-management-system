import React, { useState } from 'react';
import { Check, Package, ScanLine } from 'lucide-react';

export default function ManifestScanPanel({ manifest, onScan }) {
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const scan = (event) => { event.preventDefault(); if (!code.trim()) return; onScan?.(code.trim()); setNotice(`${code.trim()} verified and added to the manifest.`); setCode(''); };
  return <section className="manifest-scan"><div className="manifest-panel-heading"><div><span className="manifest-eyebrow">Manifest receiving</span><h2>Scan shipments</h2><p>{manifest?.number || 'Select a manifest'} · Verify each package before departure.</p></div><ScanLine size={20} color="#3e7bfa" /></div><form className="manifest-scan-form" onSubmit={scan}><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Scan or enter tracking number" aria-label="Tracking number" /><button type="submit"><ScanLine size={15} /> Verify</button></form>{notice && <div className="manifest-scan-notice"><Check size={14} />{notice}</div>}<div className="manifest-scan-summary"><span><Package size={15} /> Verified items</span><strong>{manifest?.verified || 0} / {manifest?.shipmentCount || 0}</strong></div></section>;
}
