import React from 'react';
import { ClipboardPlus } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import PickupRequestForm from '../../components/pickup/PickupRequestForm';

const styles = `.counter-pickup-page{display:grid;gap:20px;padding:24px}.counter-pickup-head{display:flex;align-items:center;gap:12px}.counter-pickup-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:#FCEFD6;color:#8A5A05}.eyebrow{margin:0 0 5px;color:#9AA1B4;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.page-title{margin:0;color:#12213F;font:700 22px 'Sora',sans-serif}.page-subtitle{margin:8px 0 0;color:#697086;font-size:13px}.pickup-wrap{max-width:1040px}@media(max-width:700px){.counter-pickup-page{padding:16px}}`;

export default function PickupRequestPage() { return <PortalLayout><div className="counter-pickup-page"><style>{styles}</style><div className="counter-pickup-head"><div className="counter-pickup-icon"><ClipboardPlus size={18}/></div><div><p className="eyebrow">Counter operations / Pickup</p><h1 className="page-title">Create pickup request</h1><p className="page-subtitle">Capture the collection details and schedule a courier pickup at the counter.</p></div></div><div className="pickup-wrap"><PickupRequestForm /></div></div></PortalLayout>; }
