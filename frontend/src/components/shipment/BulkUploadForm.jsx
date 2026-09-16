import React, { useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Upload, XCircle } from 'lucide-react';

const styles = `
	.bulk-upload { display: grid; gap: 16px; padding: 20px; border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; }
	.bulk-upload h2 { margin: 0; color: #12213F; font: 700 15px 'Sora', sans-serif; } .bulk-copy { margin: -8px 0 0; color: #697086; font-size: 12px; }
	.upload-drop { display: grid; place-items: center; gap: 8px; min-height: 150px; border: 1.5px dashed #AAB4C8; border-radius: 12px; background: #F9FAFC; color: #697086; text-align: center; cursor: pointer; } .upload-drop:hover { border-color: #3E7BFA; background: #F3F6FF; } .upload-drop svg { color: #3E7BFA; } .upload-title { color: #12213F; font-size: 13px; font-weight: 700; } .upload-help { font-size: 11px; }
	.upload-summary { display: flex; flex-wrap: wrap; gap: 10px; } .upload-stat { display: inline-flex; align-items: center; gap: 6px; padding: 7px 9px; border-radius: 8px; background: #E4F7F4; color: #087367; font-size: 11.5px; font-weight: 700; } .upload-stat.error { background: #FDE9E7; color: #B23528; }
	.upload-preview { overflow-x: auto; } table { width: 100%; border-collapse: collapse; min-width: 560px; } th { padding: 0 10px 9px; color: #9AA1B4; font-size: 10.5px; text-align: left; text-transform: uppercase; } td { padding: 10px; border-top: 1px solid #E3E7EF; color: #12213F; font-size: 12px; } .valid { color: #0C8C6B; } .invalid { color: #C4402F; }
	.bulk-actions { display: flex; justify-content: flex-end; gap: 9px; } .bulk-actions button { border: 1px solid #E3E7EF; border-radius: 9px; padding: 9px 13px; background: #fff; color: #12213F; font-size: 12px; font-weight: 700; cursor: pointer; } .bulk-actions .primary { border-color: #12213F; background: #12213F; color: #fff; }
`;

const sampleRows = [{ id: 'SH-28510', recipient: 'Ayesha Perera', route: 'Colombo → Galle', amount: 'Rs 980', valid: true }, { id: 'SH-28511', recipient: 'Kasun Silva', route: 'Kandy → Matale', amount: 'Rs 1,240', valid: true }, { id: 'SH-28512', recipient: 'Missing address', route: '—', amount: '—', valid: false }];

export default function BulkUploadForm({ onUpload = () => {}, onSubmit = () => {} }) {
	const [fileName, setFileName] = useState('');
	const [rows, setRows] = useState([]);
	const handleFile = (event) => { const file = event.target.files?.[0]; if (!file) return; setFileName(file.name); setRows(sampleRows); onUpload(file); };
	const validCount = rows.filter((row) => row.valid).length;
	return <div className="bulk-upload"><style>{styles}</style><h2>Bulk shipment upload</h2><p className="bulk-copy">Upload a CSV file to create multiple shipment records at once.</p><label className="upload-drop"><Upload size={24} /><span className="upload-title">{fileName || 'Choose a CSV file'}</span><span className="upload-help">Required columns: recipient, address, service, COD amount</span><input type="file" accept=".csv,text/csv" hidden onChange={handleFile} /></label>{rows.length ? <><div className="upload-summary"><span className="upload-stat"><CheckCircle2 size={14} /> {validCount} valid rows</span><span className="upload-stat error"><XCircle size={14} /> {rows.length - validCount} rows need attention</span></div><div className="upload-preview"><table><thead><tr><th>Tracking</th><th>Recipient</th><th>Route</th><th>COD</th><th>Validation</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.recipient}</td><td>{row.route}</td><td>{row.amount}</td><td className={row.valid ? 'valid' : 'invalid'}>{row.valid ? 'Ready' : 'Missing address'}</td></tr>)}</tbody></table></div><div className="bulk-actions"><button type="button" onClick={() => { setRows([]); setFileName(''); }}>Clear</button><button type="button" className="primary" onClick={() => onSubmit(rows.filter((row) => row.valid))}><FileSpreadsheet size={14} /> Import {validCount} shipments</button></div></> : null}</div>;
}
