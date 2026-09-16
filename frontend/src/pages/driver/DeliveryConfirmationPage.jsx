import React, { useState } from 'react';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import DeliveryConfirmationForm from '../../components/delivery/DeliveryConfirmationForm';

const styles = `.delivery-confirmation-page { display:grid; gap:20px; max-width:900px; } .confirmation-head { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; } .confirmation-title-main { margin:0; color:#12213F; font:700 21px 'Sora',sans-serif; } .confirmation-subtitle { margin:8px 0 0; color:#697086; font-size:13px; } .back-link { display:inline-flex; align-items:center; gap:6px; color:#3E7BFA; font-size:12px; font-weight:700; text-decoration:none; } .shipment-strip { display:flex; align-items:center; gap:12px; padding:14px 16px; border:1px solid #E3E7EF; border-radius:12px; background:#F9FAFC; } .shipment-strip-icon { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:9px; background:#E4F7F4; color:#087367; } .shipment-strip-id { color:#12213F; font:700 12px 'IBM Plex Mono',monospace; } .shipment-strip-route { margin-top:3px; color:#697086; font-size:12px; }`;

export default function DeliveryConfirmationPage() {
	const [submitted, setSubmitted] = useState(false);
	const shipment = { id: 'SH-28491', route: 'Colombo → Kandy', customer: 'Pasan Perera' };
	return <PortalLayout><div className="delivery-confirmation-page"><style>{styles}</style><div className="confirmation-head"><div><Link to="/driver/deliveries" className="back-link"><ArrowLeft size={13} />Back to deliveries</Link><h1 className="confirmation-title-main">Delivery confirmation</h1><p className="confirmation-subtitle">Capture proof of delivery before closing this shipment.</p></div></div><div className="shipment-strip"><div className="shipment-strip-icon"><PackageCheck size={17} /></div><div><div className="shipment-strip-id">{shipment.id} · {shipment.customer}</div><div className="shipment-strip-route">{shipment.route}</div></div></div>{submitted ? <div className="shipment-strip"><div className="shipment-strip-icon"><PackageCheck size={17} /></div><div><div className="shipment-strip-id">Delivery confirmed</div><div className="shipment-strip-route">The proof of delivery has been recorded successfully.</div></div></div> : <DeliveryConfirmationForm shipment={shipment} onConfirm={() => setSubmitted(true)} onCancel={() => window.history.back()} />}</div></PortalLayout>;
}
