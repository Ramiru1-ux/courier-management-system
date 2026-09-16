import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, MapPin, PackageCheck, Search, Truck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { shipments } = useStore();
  // "Mine" for a customer means shipments addressed TO them, not shipments
  // they sent - customers can never create a shipment (see AppRoutes.jsx,
  // /shipments/new is admin/finance/dispatcher/merchant only), so matching
  // on senderName here always returned nothing for a real account.
  const mine = useMemo(() => shipments.filter((s) => s.recipientName === user?.name), [shipments, user]);
  const active = mine.filter((s) => !['DELIVERED', 'CANCELLED', 'RTO'].includes(s.status));
  const delivered = mine.filter((s) => s.status === 'DELIVERED').length;
  const [trackingNumber, setTrackingNumber] = useState(mine[0]?.trackingNumber || '');
  const [selectedShipment, setSelectedShipment] = useState(mine[0] || null);
  const [searchMessage, setSearchMessage] = useState('');

  const searchShipment = (event) => {
    event.preventDefault();
    const result = mine.find((shipment) => shipment.trackingNumber.toLowerCase() === trackingNumber.trim().toLowerCase());
    setSelectedShipment(result || null);
    setSearchMessage(result ? '' : 'No shipment matched that tracking number.');
  };

  const progress = selectedShipment?.status === 'DELIVERED' ? 100 : selectedShipment?.status === 'OUT_FOR_DELIVERY' ? 78 : selectedShipment ? 42 : 0;

  return (
    <PortalLayout>
      <style>{customerDashboardStyles}</style>
      <div className="customer-board">
        <div className="customer-board-intro"><div><div className="customer-kicker">Customer / Overview</div><h1>Your delivery desk</h1><p>Welcome back, {user?.name}. Keep every parcel in sight.</p></div><div className="customer-count"><strong>{active.length}</strong><span>active<br />shipments</span></div></div>

        <section className="customer-track-panel">
          <div className="customer-track-copy"><span className="customer-kicker">Shipment finder</span><h2>Follow a parcel<br /><em>from pickup to door.</em></h2><p>Search one of your tracking numbers to see its latest milestone.</p></div>
          <form className="customer-track-form" onSubmit={searchShipment}><label htmlFor="customer-tracking">Tracking number</label><div><Search size={17} /><input id="customer-tracking" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="EGW-2026-00001245" /><button type="submit" aria-label="Find shipment"><ArrowRight size={18} /></button></div>{searchMessage && <small>{searchMessage}</small>}</form>
          <div className="customer-track-mark"><PackageCheck size={34} /><span>LIVE<br />ROUTE</span></div>
        </section>

        <div className="customer-board-grid">
          <section className="customer-result-card">
            <div className="customer-section-head"><div><span className="customer-kicker">Selected shipment</span><h2>{selectedShipment ? selectedShipment.trackingNumber : 'No shipment selected'}</h2></div>{selectedShipment && <StatusBadge status={statusLabel(selectedShipment.status)} tone={statusTone(selectedShipment.status)} />}</div>
            {selectedShipment ? <><div className="customer-route"><div><span>FROM</span><strong>{selectedShipment.branch}</strong></div><ArrowRight size={18} /><div><span>TO</span><strong>{selectedShipment.recipientCity}</strong></div></div><div className="customer-progress"><div><span>Delivery progress</span><strong>{progress}%</strong></div><div className="customer-progress-track"><i style={{ width: `${progress}%` }} /></div><small>{selectedShipment.status === 'DELIVERED' ? 'Delivered successfully' : selectedShipment.status === 'OUT_FOR_DELIVERY' ? 'Courier is on the way' : 'Shipment is being prepared'}</small></div><Link className="customer-detail-link" to={`/shipments/${selectedShipment.id}`}>Open shipment details <ArrowRight size={14} /></Link></> : <div className="customer-empty">Your shipment details will appear here after you search.</div>}
          </section>

          <aside className="customer-stats-card"><div className="customer-section-head"><div><span className="customer-kicker">Your activity</span><h2>At a glance</h2></div><Clock3 size={18} /></div><div className="customer-stat"><CheckCircle2 size={18} /><div><strong>{delivered}</strong><span>delivered all time</span></div></div><div className="customer-stat"><Truck size={18} /><div><strong>{active.length}</strong><span>still in motion</span></div></div><Link className="customer-history-link" to="/customer/history">View shipment history <ArrowRight size={14} /></Link></aside>
        </div>

        <section className="customer-recent"><div className="customer-section-head"><div><span className="customer-kicker">Your parcels</span><h2>Recent activity</h2></div><MapPin size={18} /></div>{mine.length === 0 ? <div className="customer-empty">You have no shipments yet.</div> : <div className="customer-recent-list">{mine.slice(0, 4).map((shipment) => <button type="button" className={selectedShipment?.id === shipment.id ? 'customer-recent-item selected' : 'customer-recent-item'} key={shipment.id} onClick={() => { setSelectedShipment(shipment); setTrackingNumber(shipment.trackingNumber); setSearchMessage(''); }}><span className="customer-recent-dot" /><span><strong>{shipment.trackingNumber}</strong><small>{shipment.recipientName} · {shipment.recipientCity}</small></span><StatusBadge status={statusLabel(shipment.status)} tone={statusTone(shipment.status)} /></button>)}</div>}</section>
      </div>
    </PortalLayout>
  );
}

const customerDashboardStyles = `
  .customer-board { max-width: 1080px; margin: 0 auto; color: #172b2b; }
  .customer-board-intro { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:22px; }
  .customer-kicker { color:#718181; font-size:10px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; }
  .customer-board h1 { margin:7px 0 5px; color:#173b3a; font:700 28px 'Sora', sans-serif; letter-spacing:0; }
  .customer-board p { margin:0; color:#718181; font-size:13px; }
  .customer-count { display:flex; align-items:center; gap:10px; padding:10px 14px; border-left:3px solid #ec8c50; color:#718181; font-size:11px; line-height:1.25; text-transform:uppercase; letter-spacing:.06em; }
  .customer-count strong { color:#173b3a; font:700 28px 'IBM Plex Mono', monospace; }
  .customer-track-panel { position:relative; display:grid; grid-template-columns:1.1fr 1fr auto; align-items:center; gap:25px; min-height:190px; overflow:hidden; margin-bottom:20px; padding:27px 31px; border-radius:18px; background:#173b3a; box-shadow:0 15px 30px rgba(23,59,58,.14); }
  .customer-track-panel:after { content:''; position:absolute; width:210px; height:210px; right:60px; top:-105px; border:1px solid rgba(244,190,129,.28); border-radius:50%; box-shadow:0 0 0 24px rgba(244,190,129,.05), 0 0 0 48px rgba(244,190,129,.04); }
  .customer-track-copy, .customer-track-form, .customer-track-mark { position:relative; z-index:1; }
  .customer-track-copy .customer-kicker { color:#c7d7cf; }.customer-track-copy h2 { margin:8px 0 7px; color:#fff; font:700 22px 'Sora', sans-serif; line-height:1.16; }.customer-track-copy h2 em { color:#f4be81; font-style:normal; }.customer-track-copy p { max-width:290px; color:#b6cbc1; line-height:1.45; font-size:12px; }
  .customer-track-form { padding:15px; border-radius:13px; background:#f7f2e8; }.customer-track-form label { display:block; margin-bottom:8px; color:#60726b; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }.customer-track-form div { display:flex; align-items:center; gap:8px; color:#a2aaa1; }.customer-track-form input { min-width:0; flex:1; border:0; outline:0; background:transparent; color:#173b3a; font:600 12px 'IBM Plex Mono',monospace; }.customer-track-form button { display:grid; place-items:center; width:34px; height:34px; border:0; border-radius:9px; background:#ec8c50; color:#fff; cursor:pointer; }.customer-track-form small { display:block; margin-top:8px; color:#b34c36; font-size:10px; }.customer-track-mark { display:grid; place-items:center; gap:6px; color:#f4be81; font:800 9px 'IBM Plex Mono',monospace; letter-spacing:.13em; text-align:center; }
  .customer-board-grid { display:grid; grid-template-columns:1.45fr .8fr; gap:20px; margin-bottom:20px; }.customer-result-card, .customer-stats-card, .customer-recent { border:1px solid #dfe6df; border-radius:16px; background:#fff; }.customer-result-card, .customer-stats-card { padding:22px; }.customer-section-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }.customer-section-head h2 { margin:6px 0 0; color:#173b3a; font:700 15px 'Sora',sans-serif; }.customer-section-head > svg { color:#ec8c50; }.customer-result-card .status-badge { margin-top:2px; }.customer-route { display:flex; align-items:center; gap:16px; margin:24px 0; padding:14px; border-radius:11px; background:#f5f8f4; }.customer-route > svg { color:#ec8c50; }.customer-route div { flex:1; }.customer-route span { display:block; margin-bottom:5px; color:#9aa89f; font-size:9px; font-weight:800; letter-spacing:.1em; }.customer-route strong { color:#173b3a; font-size:12px; }.customer-progress > div:first-child { display:flex; justify-content:space-between; color:#718181; font-size:11px; }.customer-progress strong { color:#173b3a; font-family:'IBM Plex Mono',monospace; }.customer-progress-track { height:8px; margin:9px 0 7px; overflow:hidden; border-radius:9px; background:#e5ece5; }.customer-progress-track i { display:block; height:100%; border-radius:9px; background:#ec8c50; }.customer-progress small { color:#9aa89f; font-size:10px; }.customer-detail-link, .customer-history-link { display:inline-flex; align-items:center; gap:6px; margin-top:19px; color:#d56d3d; font-size:11px; font-weight:800; }.customer-empty { padding:28px 0; color:#718181; font-size:12px; }.customer-stat { display:flex; align-items:center; gap:12px; margin-top:22px; padding-bottom:17px; border-bottom:1px solid #e3ebe3; color:#ec8c50; }.customer-stat div { display:grid; gap:3px; }.customer-stat strong { color:#173b3a; font:700 22px 'IBM Plex Mono',monospace; }.customer-stat span { color:#718181; font-size:11px; }.customer-history-link { margin-top:20px; }
  .customer-recent { padding:22px; }.customer-recent-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; margin-top:17px; }.customer-recent-item { display:flex; align-items:center; gap:10px; min-width:0; padding:11px; border:1px solid transparent; border-radius:11px; background:#f7f9f6; color:#173b3a; text-align:left; cursor:pointer; }.customer-recent-item:hover, .customer-recent-item.selected { border-color:#f1b083; background:#fffaf4; }.customer-recent-dot { width:8px; height:8px; flex:0 0 auto; border-radius:50%; background:#ec8c50; }.customer-recent-item > span:nth-child(2) { min-width:0; flex:1; }.customer-recent-item strong, .customer-recent-item small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.customer-recent-item strong { font:700 11px 'IBM Plex Mono',monospace; }.customer-recent-item small { margin-top:4px; color:#718181; font-size:10px; }.customer-recent-item .status-badge { flex:0 0 auto; }
  @media (max-width:800px) { .customer-track-panel { grid-template-columns:1fr; gap:18px; }.customer-track-mark { display:none; }.customer-board-grid { grid-template-columns:1fr; } }
  @media (max-width:540px) { .customer-board-intro { align-items:flex-start; flex-direction:column; }.customer-recent-list { grid-template-columns:1fr; }.customer-track-panel { padding:23px 20px; }.customer-board h1 { font-size:24px; } }
`;
