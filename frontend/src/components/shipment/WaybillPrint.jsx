import React from 'react';
import { Barcode, Download, Printer, QrCode } from 'lucide-react';

const styles = `
	.waybill-shell { display: grid; gap: 14px; }
	.waybill-actions { display: flex; justify-content: flex-end; gap: 8px; }
	.waybill-action { display: inline-flex; align-items: center; gap: 7px; border: 1px solid #E3E7EF; border-radius: 9px; padding: 9px 12px; background: #fff; color: #12213F; font-size: 12px; font-weight: 700; cursor: pointer; }
	.waybill-action.primary { border-color: #12213F; background: #12213F; color: #fff; }
	.waybill-sheet { width: 100%; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #D8DDE8; border-radius: 12px; background: #fff; box-shadow: 0 10px 24px rgba(18,33,63,.08); color: #12213F; }
	.waybill-brand { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 14px; border-bottom: 2px solid #12213F; }
	.waybill-brand-name { font: 800 16px 'Sora', sans-serif; } .waybill-brand-meta { color: #697086; font-size: 10px; font-weight: 700; text-transform: uppercase; }
	.waybill-id { margin-top: 18px; font: 800 20px 'IBM Plex Mono', monospace; }
	.waybill-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 18px; }
	.waybill-field { padding-top: 10px; border-top: 1px solid #E3E7EF; } .waybill-label { color: #9AA1B4; font-size: 10px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; } .waybill-value { margin-top: 4px; font-size: 12.5px; font-weight: 700; }
	.waybill-code { display: flex; align-items: flex-end; justify-content: center; gap: 2px; height: 64px; margin: 22px 0 14px; } .waybill-bar { background: #12213F; }
	.waybill-footer { display: flex; align-items: center; gap: 10px; padding-top: 14px; border-top: 1px solid #E3E7EF; color: #697086; font-size: 10.5px; line-height: 1.4; } .waybill-footer svg { color: #12213F; flex-shrink: 0; }
	@media print { .waybill-actions { display: none; } .waybill-sheet { max-width: none; border: 0; box-shadow: none; } }
	@media (max-width: 520px) { .waybill-sheet { padding: 18px; } .waybill-grid { grid-template-columns: 1fr; } }
`;

const bars = [18, 9, 26, 12, 6, 22, 14, 8, 24, 10, 18, 7, 28, 12, 5, 20, 9, 25, 14, 7, 22, 11, 27, 8, 18, 6, 24, 13, 9, 21];

const defaultShipment = { id: 'SH-28491', sender: 'Urban Mart', recipient: 'Pasan Perera', phone: '077 123 4567', from: 'Colombo 07', to: 'Kandy City', service: 'Standard domestic', weight: '2.4 kg', cod: 'Rs 1,250' };

export default function WaybillPrint({ shipment = defaultShipment, onDownload = () => {} }) {
	return <div className="waybill-shell"><style>{styles}</style><div className="waybill-actions"><button type="button" className="waybill-action" onClick={() => onDownload(shipment)}><Download size={14} /> Download</button><button type="button" className="waybill-action primary" onClick={() => window.print()}><Printer size={14} /> Print waybill</button></div><section className="waybill-sheet"><div className="waybill-brand"><span className="waybill-brand-name">EGOTECH COURIER</span><span className="waybill-brand-meta">Shipment waybill</span></div><div className="waybill-id">{shipment.id}</div><div className="waybill-grid"><div className="waybill-field"><div className="waybill-label">From</div><div className="waybill-value">{shipment.from}</div></div><div className="waybill-field"><div className="waybill-label">To</div><div className="waybill-value">{shipment.to}</div></div><div className="waybill-field"><div className="waybill-label">Sender</div><div className="waybill-value">{shipment.sender}</div></div><div className="waybill-field"><div className="waybill-label">Recipient</div><div className="waybill-value">{shipment.recipient}</div></div><div className="waybill-field"><div className="waybill-label">Phone</div><div className="waybill-value">{shipment.phone}</div></div><div className="waybill-field"><div className="waybill-label">Service / weight</div><div className="waybill-value">{shipment.service} · {shipment.weight}</div></div><div className="waybill-field"><div className="waybill-label">COD amount</div><div className="waybill-value">{shipment.cod}</div></div></div><div className="waybill-code" aria-label={`Barcode for ${shipment.id}`}>{bars.map((height, index) => <span className="waybill-bar" key={index} style={{ width: index % 4 === 0 ? 3 : 2, height }} />)}</div><div className="waybill-footer"><QrCode size={38} /><span>Scan to view live tracking<br />egotech.com/track/{shipment.id}</span><Barcode size={24} style={{ marginLeft: 'auto' }} /></div></section></div>;
}
