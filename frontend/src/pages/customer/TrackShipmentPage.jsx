import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../../hooks/useStore';
import { formatDateTime, statusLabel } from '../../utils/shipmentStatus';

const MILESTONES = [
  { status: 'CREATED', title: 'Shipment created' },
  { status: 'PICKED_UP', title: 'Picked up' },
  { status: 'AT_ORIGIN_BRANCH', title: 'At origin branch' },
  { status: 'OUT_FOR_DELIVERY', title: 'Out for delivery' },
  { status: 'DELIVERED', title: 'Delivered' },
];

function buildTimeline(shipment) {
  const currentIndex = MILESTONES.findIndex((milestone) => milestone.status === shipment.status);
  const progressIndex = currentIndex >= 0 ? currentIndex : 0;
  return MILESTONES.map((milestone, index) => ({
    title: milestone.title,
    detail: index <= progressIndex ? formatDateTime(shipment.createdAt) : 'Awaiting next milestone',
    location: index === 0 ? shipment.branch : index === 3 ? `${shipment.recipientCity} · courier route` : '',
    state: index < progressIndex ? 'done' : index === progressIndex ? 'current' : 'pending',
  }));
}

function estimateFor(shipment) {
  if (shipment.status === 'DELIVERED') return 'Delivered successfully';
  if (shipment.status === 'OUT_FOR_DELIVERY') return 'Expected today';
  if (['DELIVERY_FAILED', 'RTO', 'CANCELLED'].includes(shipment.status)) return statusLabel(shipment.status);
  return 'Delivery date will be confirmed soon';
}

function normalizeOrderNumber(value) {
  return String(value || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
}

export default function TrackShipmentPage() {
  const { shipments, drivers } = useStore();
  const [value, setValue] = useState('');
  const [shipment, setShipment] = useState(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    if (!value.trim()) {
      setShipment(null);
      setSearched(false);
      setMessage('Enter your tracking number to search for a shipment.');
      return;
    }
    const normalized = value.trim().toUpperCase();
    setValue(normalized);
    const comparable = normalizeOrderNumber(normalized);
    const found = shipments.find((item) => normalizeOrderNumber(item.trackingNumber) === comparable);
    if (found) {
      setShipment(found);
      setSearched(true);
      setMessage('Latest shipment status loaded.');
    } else {
      setSearched(false);
      setShipment(null);
      setMessage('We could not find that tracking number. Check the number and try again.');
    }
  };

  return (
    <div className="customer-track-page">
      <style>{trackStyles}</style>
      <header className="track-header">
        <div className="track-brand"><span className="track-brand-mark">EG</span><span><strong>EgoTECHWORLD</strong><small>Customer portal</small></span></div>
        <nav><Link className="active" to="/customer/tracking">Track</Link><Link to="/customer/support">Support</Link></nav>
      </header>

      <main className="track-content">
        <section className="track-hero"><span className="track-eyebrow">Public tracking</span><h1>Where is your package?</h1><p>Enter your order ID, which is the tracking number, to see the latest delivery milestone.</p><form className="track-search-form" onSubmit={handleSearch}><Search size={19} /><input value={value} onChange={(event) => setValue(event.target.value)} aria-label="Order ID tracking number" placeholder="" /><button type="submit">Track package <ArrowRight size={16} /></button></form><div className="track-search-hint">Enter the tracking number from your waybill or booking confirmation.</div>{message && <div className={`track-message ${searched ? 'success' : 'error'}`} role="status">{searched && <Check size={14} />}{message}</div>}</section>

        {searched && shipment && <section className="track-result">
          <div className="track-result-head"><div><span className="track-eyebrow">Shipment status</span><h2>{shipment.trackingNumber}</h2><p>{shipment.branch} <ArrowRight size={14} /> {shipment.recipientCity}</p></div><StatusPill>{statusLabel(shipment.status)}</StatusPill></div>
          <div className="track-highlight"><div className="highlight-icon"><Truck size={22} /></div><div><span>Current progress</span><strong>{estimateFor(shipment)}</strong><small>{shipment.status === 'OUT_FOR_DELIVERY' ? `Your courier ${drivers.find((driver) => driver.id === shipment.driverId)?.name || 'is'} is on the way.` : 'We will update this timeline as your shipment moves.'}</small></div><MapPin className="highlight-pin" size={22} /></div>
          <div className="track-main-grid"><div className="track-timeline"><div className="track-section-heading"><div><span className="track-eyebrow">Delivery journey</span><h3>Shipment progress</h3></div><span className="track-last-updated"><Clock3 size={13} /> Live shipment status</span></div>{buildTimeline(shipment).map((event) => <TimelineItem event={event} key={event.title} />)}</div><aside className="track-details"><div className="track-section-heading"><div><span className="track-eyebrow">At a glance</span><h3>Shipment details</h3></div></div><Detail label="Recipient" value={shipment.recipientName} /><Detail label="Delivery service" value={shipment.serviceType} /><Detail label="Payment" value={shipment.codAmount ? `COD · Rs ${shipment.codAmount.toLocaleString('en-US')}` : 'Prepaid'} /><Detail label="Destination" value={shipment.recipientCity} /><div className="track-private"><ShieldCheck size={16} /><span>Driver location is kept private. We only share delivery milestones with customers.</span></div></aside></div>
          <div className="track-help"><div className="help-icon"><Package size={18} /></div><div><strong>Need help with this shipment?</strong><p>Our support team can help with address updates, delivery questions, or failed attempts.</p></div><Link to="/customer/support">Contact support <ArrowRight size={14} /></Link></div>
        </section>}
      </main>
    </div>
  );
}

function StatusPill({ children }) { return <span className="track-status"><i />{children}</span>; }

function TimelineItem({ event }) { return <div className={`timeline-item ${event.state}`}><span className="timeline-dot">{event.state === 'done' && <Check size={11} />}</span><div><strong>{event.title}</strong><small>{event.detail}</small>{event.location && <em><MapPin size={12} /> {event.location}</em>}</div></div>; }

function Detail({ label, value }) { return <div className="track-detail"><span>{label}</span><strong>{value}</strong></div>; }

const trackStyles = `
  .customer-track-page { min-height: 100vh; background: #f4f6fa; color: #151a2e; font-family: Inter, sans-serif; } .track-header { height: 76px; padding: 0 6vw; display: flex; align-items: center; justify-content: space-between; gap: 25px; background: #fff; border-bottom: 1px solid #e3e7ef; } .track-brand { display: flex; align-items: center; gap: 10px; color: #12213f; } .track-brand > span:last-child strong, .track-brand > span:last-child small { display: block; } .track-brand strong { font: 700 14px Sora, sans-serif; } .track-brand small { margin-top: 2px; color: #9aa1b4; font-size: 10px; } .track-brand-mark { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: #f5a524; color: #211200; font: 800 13px Sora, sans-serif; } .track-header nav { display: flex; gap: 28px; color: #697086; font-size: 13px; font-weight: 600; } .track-header nav a { padding: 28px 0 25px; border-bottom: 3px solid transparent; } .track-header nav a:hover, .track-header nav .active { color: #12213f; border-color: #f5a524; } .track-account { display: flex; align-items: center; gap: 8px; color: #12213f; font-size: 12px; } .track-account span { width: 33px; height: 33px; display: grid; place-items: center; border-radius: 9px; background: #efebfd; color: #6555d8; font: 700 11px Sora, sans-serif; } .track-account svg { color: #9aa1b4; }
  .track-content { width: min(940px, calc(100% - 48px)); margin: 0 auto; padding: 38px 0 70px; } .track-back { display: inline-flex; align-items: center; gap: 6px; color: #697086; font-size: 12px; font-weight: 600; } .track-hero { max-width: 650px; margin: 33px auto 28px; text-align: center; } .track-eyebrow { color: #9aa1b4; font-size: 10px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; } .track-hero h1 { margin: 8px 0 7px; color: #12213f; font: 700 30px Sora, sans-serif; } .track-hero p { margin: 0; color: #697086; font-size: 13px; } .track-search-form { display: flex; align-items: center; gap: 10px; margin-top: 24px; padding: 5px 5px 5px 15px; border: 1px solid #d8dee9; border-radius: 11px; background: #fff; color: #9aa1b4; box-shadow: 0 10px 25px rgba(18,33,63,.05); } .track-search-form input { min-width: 0; flex: 1; border: 0; outline: 0; color: #12213f; font: 600 12px 'IBM Plex Mono', monospace; } .track-search-form button { display: inline-flex; align-items: center; gap: 7px; padding: 12px 15px; border: 0; border-radius: 8px; background: #12213f; color: #fff; cursor: pointer; font-size: 11px; font-weight: 700; white-space: nowrap; } .track-search-hint { margin-top: 9px; color: #9aa1b4; font-size: 10px; } .track-message { display: inline-flex; align-items: center; gap: 5px; margin-top: 11px; font-size: 10.5px; font-weight: 600; } .track-message.success { color: #0c8c6b; } .track-message.error { color: #b23528; }
  .track-result { overflow: hidden; border: 1px solid #e3e7ef; border-radius: 15px; background: #fff; box-shadow: 0 14px 35px rgba(18,33,63,.05); } .track-result-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 26px 28px 21px; } .track-result-head h2 { margin: 7px 0 7px; color: #12213f; font: 700 17px 'IBM Plex Mono', monospace; } .track-result-head p { display: flex; align-items: center; gap: 6px; margin: 0; color: #697086; font-size: 11px; } .track-result-head p svg { color: #9aa1b4; } .track-status { display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border-radius: 99px; background: #fcefd6; color: #8a5a05; font-size: 11px; font-weight: 700; white-space: nowrap; } .track-status i { width: 6px; height: 6px; border-radius: 50%; background: #d9860f; }
  .track-highlight { display: flex; align-items: center; gap: 12px; margin: 0 28px; padding: 15px 16px; border-radius: 11px; background: #fcefd6; } .highlight-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 9px; background: #f5a524; color: #211200; } .track-highlight span, .track-highlight strong, .track-highlight small { display: block; } .track-highlight span { color: #8a5a05; font-size: 10px; font-weight: 700; } .track-highlight strong { margin-top: 3px; color: #12213f; font: 700 14px Sora, sans-serif; } .track-highlight small { margin-top: 3px; color: #8a5a05; font-size: 10px; } .highlight-pin { margin-left: auto; color: #d9860f; }
  .track-main-grid { display: grid; grid-template-columns: 1.35fr .9fr; gap: 32px; padding: 28px; } .track-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 22px; } .track-section-heading h3 { margin: 6px 0 0; color: #12213f; font: 700 15px Sora, sans-serif; } .track-last-updated { display: inline-flex; align-items: center; gap: 4px; color: #9aa1b4; font-size: 9.5px; white-space: nowrap; }
  .timeline-item { position: relative; display: flex; gap: 13px; min-height: 67px; padding-left: 4px; } .timeline-item:not(:last-child):before { content: ''; position: absolute; top: 19px; bottom: 0; left: 12px; width: 2px; background: #e3e7ef; } .timeline-dot { position: relative; z-index: 1; width: 18px; height: 18px; flex: 0 0 auto; display: grid; place-items: center; border: 2px solid #e3e7ef; border-radius: 50%; background: #fff; color: #fff; } .timeline-item.done .timeline-dot { border-color: #0ea394; background: #0ea394; } .timeline-item.current .timeline-dot { border-color: #f5a524; background: #f5a524; box-shadow: 0 0 0 4px #fcefd6; } .timeline-item > div { padding-bottom: 16px; } .timeline-item strong, .timeline-item small, .timeline-item em { display: block; } .timeline-item strong { color: #697086; font-size: 12px; } .timeline-item.done strong, .timeline-item.current strong { color: #12213f; } .timeline-item small { margin-top: 4px; color: #9aa1b4; font-size: 10.5px; } .timeline-item em { display: flex; align-items: center; gap: 4px; margin-top: 5px; color: #697086; font-size: 10px; font-style: normal; }
  .track-details { padding-left: 26px; border-left: 1px solid #e3e7ef; } .track-detail { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e3e7ef; } .track-detail span { color: #9aa1b4; font-size: 10px; } .track-detail strong { color: #12213f; font-size: 10.5px; text-align: right; } .track-private { display: flex; gap: 7px; margin-top: 18px; padding: 11px; border-radius: 8px; background: #f4f6fa; color: #697086; font-size: 9.5px; line-height: 1.45; } .track-private svg { flex: 0 0 auto; color: #0ea394; }
  .track-help { display: flex; align-items: center; gap: 11px; margin: 0 28px 28px; padding: 15px; border-radius: 10px; background: #f4f6fa; } .help-icon { width: 32px; height: 32px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 8px; background: #e8effe; color: #3e7bfa; } .track-help div:nth-child(2) { flex: 1; } .track-help strong { color: #12213f; font-size: 11px; } .track-help p { margin: 4px 0 0; color: #697086; font-size: 10px; } .track-help a { display: inline-flex; align-items: center; gap: 4px; color: #3e7bfa; font-size: 10px; font-weight: 700; white-space: nowrap; }
  .customer-track-page { background: #f3f0e8; color: #173b3a; } .track-header { background: #173b3a; border-bottom-color: #2a5b55; } .track-brand, .track-header nav, .track-account { color: #f8f3e8; } .track-brand small { color: #b8d0c4; } .track-brand-mark { background: #ec8c50; color: #173b3a; } .track-header nav a:hover, .track-header nav .active { color: #f4be81; border-color: #ec8c50; } .track-account span { background: #356860; color: #f8f3e8; } .track-account svg { color: #b8d0c4; } .track-hero h1, .track-result-head h2, .track-section-heading h3 { color: #173b3a; } .track-search-form { border-color: #d8cdbb; background: #fffdf8; } .track-search-form button { background: #ec8c50; color: #173b3a; } .track-result { border-color: #ded6c8; box-shadow: 0 14px 35px rgba(23,59,58,.08); } .track-status { background: #fbe4d2; color: #a8522d; } .track-status i { background: #ec8c50; } .track-highlight { background: #e2eee6; } .highlight-icon { background: #2c8b7d; color: #fff; } .track-highlight span, .track-highlight small { color: #39756b; } .highlight-pin { color: #2c8b7d; } .timeline-item.done .timeline-dot { border-color: #2c8b7d; background: #2c8b7d; } .timeline-item.current .timeline-dot { border-color: #ec8c50; background: #ec8c50; box-shadow: 0 0 0 4px #fbe4d2; } .track-private, .track-help { background: #f6f3ec; } .help-icon { background: #e2eee6; color: #2c8b7d; } .track-help a { color: #c5653a; }
  @media (max-width: 760px) { .track-header { padding: 0 20px; } .track-header nav { display: none; } .track-content { width: min(100% - 32px, 620px); padding-top: 28px; } .track-main-grid { grid-template-columns: 1fr; gap: 25px; padding: 22px; } .track-details { padding: 22px 0 0; border-top: 1px solid #e3e7ef; border-left: 0; } .track-result-head, .track-highlight { margin-left: 0; margin-right: 0; } .track-result-head { padding: 22px; } .track-highlight { margin: 0 22px; } .track-help { margin: 0 22px 22px; align-items: flex-start; flex-wrap: wrap; } .track-help a { margin-left: 43px; } }
  @media (max-width: 480px) { .track-account strong, .track-account svg { display: none; } .track-content { width: calc(100% - 24px); } .track-hero h1 { font-size: 25px; } .track-search-form { flex-wrap: wrap; padding: 10px; } .track-search-form input { flex-basis: calc(100% - 32px); } .track-search-form button { width: 100%; justify-content: center; } .track-result-head { flex-direction: column; } .track-highlight { align-items: flex-start; } .highlight-pin { display: none; } .track-help a { margin-left: 0; } }
`;