import React from 'react';
import { ArrowRight, Boxes, CheckCircle2, ChevronDown, CreditCard, Plus, Truck, ShieldCheck } from 'lucide-react';

const styles = `
  .ops-shell {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ops-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
  }

  .ops-breadcrumb {
    font-size: 12px;
    color: #9AA1B4;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .ops-breadcrumb b {
    color: #697086;
  }

  .ops-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 21px;
    color: #12213F;
    margin: 0;
  }

  .ops-sub {
    font-size: 13px;
    color: #697086;
    margin-top: 4px;
  }

  .ops-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ops-button {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 13.5px;
    border-radius: 10px;
    padding: 11px 20px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s ease;
    text-decoration: none;
  }

  .ops-button:hover {
    transform: translateY(-1px);
  }

  .ops-button-secondary {
    background: #fff;
    color: #12213F;
    border: 1.5px solid #E3E7EF;
  }

  .ops-button-primary {
    background: #F5A524;
    color: #211200;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(150px, 1fr));
    gap: 14px;
  }

  .kpi-card {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 17px 18px;
  }

  .kpi-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 600;
    color: #697086;
  }

  .kpi-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kpi-value {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 26px;
    color: #12213F;
    margin-top: 10px;
  }

  .kpi-delta {
    font-size: 11.5px;
    font-weight: 600;
    margin-top: 5px;
  }

  .kpi-delta.up {
    color: #0C8C6B;
  }

  .kpi-delta.down {
    color: #C4402F;
  }

  .ops-grid {
    display: grid;
    grid-template-columns: 1.55fr 1fr;
    gap: 16px;
  }

  .panel {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .panel-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .panel-link {
    font-size: 12px;
    font-weight: 600;
    color: #3E7BFA;
  }

  .map-panel {
    position: relative;
    height: 260px;
    border-radius: 12px;
    overflow: hidden;
    background:
      linear-gradient(0deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/28px 28px,
      linear-gradient(90deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/28px 28px,
      #EAF0FB;
    border: 1px solid #E3E7EF;
  }

  .map-pin {
    position: absolute;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2.5px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,.25);
  }

  .route-line {
    position: absolute;
    stroke-dasharray: 5 5;
  }

  .timeline {
    position: relative;
    padding-left: 26px;
  }

  .timeline::before {
    content: "";
    position: absolute;
    left: 6px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: #E3E7EF;
  }

  .timeline-item {
    position: relative;
    padding-bottom: 22px;
  }

  .timeline-item:last-child {
    padding-bottom: 0;
  }

  .timeline-dot {
    position: absolute;
    left: -26px;
    top: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #0EA394;
    border: 2.5px solid #fff;
    box-shadow: 0 0 0 2px #0EA394;
  }

  .timeline-item.pending .timeline-dot {
    background: #fff;
    box-shadow: 0 0 0 2px #E3E7EF;
  }

  .timeline-title {
    font-size: 13px;
    font-weight: 600;
    color: #12213F;
  }

  .timeline-meta {
    font-size: 11.5px;
    color: #9AA1B4;
    margin-top: 2px;
  }

  .filters {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 9px;
    padding: 8px 12px;
    font-size: 12.5px;
    font-weight: 500;
    color: #697086;
  }

  .filter-chip b {
    color: #151A2E;
    font-weight: 600;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .04em;
    color: #9AA1B4;
    padding: 0 14px 10px;
    text-transform: uppercase;
  }

  td {
    padding: 13px 14px;
    border-top: 1px solid #E3E7EF;
    font-size: 13px;
    vertical-align: middle;
  }

  tr.rowh:hover td {
    background: #FAFBFD;
  }

  .tracking-id {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 12.5px;
    color: #12213F;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    letter-spacing: .01em;
  }

  .status-pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-teal {
    background: #E4F7F4;
    color: #087367;
  }

  .status-teal .dot { background: #0EA394; }

  .status-amber {
    background: #FCEFD6;
    color: #8A5A05;
  }

  .status-amber .dot { background: #D9860F; }

  .status-coral {
    background: #FDE9E7;
    color: #B23528;
  }

  .status-coral .dot { background: #EF5B4E; }

  .status-sky {
    background: #E8EFFE;
    color: #2453B8;
  }

  .status-sky .dot { background: #3E7BFA; }

  @media (max-width: 1200px) {
    .kpi-grid {
      grid-template-columns: repeat(2, minmax(180px, 1fr));
    }

    .ops-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .ops-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .ops-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .kpi-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const kpis = [
  { label: 'Total shipments', value: '18,420', delta: '+12.4%', up: true, color: '#E8EFFE', icon: Boxes },
  { label: 'On-time delivery', value: '96.8%', delta: '+2.1%', up: true, color: '#E4F7F4', icon: CheckCircle2 },
  { label: 'COD pending', value: 'Rs 2.84L', delta: '-8.3%', up: false, color: '#FDE9E7', icon: CreditCard },
  { label: 'Active vehicles', value: '214', delta: '+5.9%', up: true, color: '#EFEBFD', icon: Truck },
  { label: 'Open support', value: '39', delta: '-4.2%', up: false, color: '#EEF0F4', icon: ShieldCheck },
];

const timeline = [
  { title: 'Picked up by courier', meta: '12:40 PM · Vehicle #LK-1738', status: 'done' },
  { title: 'Sorting hub scanned', meta: '1:05 PM · Central Hub, Colombo', status: 'done' },
  { title: 'Out for delivery', meta: '2:10 PM · Route 04 · Driver A. Fernando', status: 'current' },
  { title: 'Customer confirmation pending', meta: 'Expected by 4:30 PM', status: 'pending' },
];

const shipmentRows = [
  { id: 'SH-28491', route: 'Colombo → Kandy', customer: 'Pasan Perera', status: 'In transit', eta: 'Today, 4:30 PM', amount: 'Rs 1,250', type: 'Domestic' },
  { id: 'SH-28492', route: 'Galle → Matara', customer: 'Nimal Silva', status: 'Out for delivery', eta: 'Today, 2:15 PM', amount: 'Rs 980', type: 'Same-Day' },
  { id: 'SH-28495', route: 'Negombo → Kurunegala', customer: 'Sajini Fernando', status: 'Delayed', eta: 'Tomorrow', amount: 'Rs 1,420', type: 'Express' },
  { id: 'SH-28501', route: 'Jaffna → Colombo', customer: 'Kavindu Raj', status: 'Delivered', eta: 'Completed', amount: 'Rs 1,890', type: 'Priority' },
  { id: 'SH-28502', route: 'Anuradhapura → Batticaloa', customer: 'Themiya Wickram', status: 'Awaiting pickup', eta: 'Today, 7:10 PM', amount: 'Rs 1,050', type: 'Regional' },
];

function getStatusClass(status) {
  if (status === 'Delivered') return 'status-teal';
  if (status === 'Out for delivery') return 'status-amber';
  if (status === 'Delayed') return 'status-coral';
  return 'status-sky';
}

export default function OperationsDashboardPage() {
  return (
    <div className="ops-shell">
      <style>{styles}</style>

      <div className="ops-head">
        <div>
          <div className="ops-breadcrumb">Operations / <b>Overview</b></div>
          <h1 className="ops-title">Operations dashboard</h1>
          <div className="ops-sub">Live performance for the current delivery network.</div>
        </div>

        <div className="ops-actions">
          <button type="button" className="ops-button ops-button-secondary">
            <ArrowRight size={15} />
            Export report
          </button>
          <button type="button" className="ops-button ops-button-primary">
            <Plus size={15} />
            Create shipment
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map(({ label, value, delta, up, color, icon: Icon }) => (
          <div key={label} className="kpi-card">
            <div className="kpi-top">
              <div className="kpi-label">{label}</div>
              <div className="kpi-icon" style={{ background: color }}>
                <Icon size={16} color="#10213F" />
              </div>
            </div>
            <div className="kpi-value">{value}</div>
            <div className={`kpi-delta ${up ? 'up' : 'down'}`}>{delta} {up ? 'vs last week' : 'vs last week'}</div>
          </div>
        ))}
      </div>

      <div className="ops-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Regional dispatch map</div>
            <div className="panel-link">Open routes</div>
          </div>

          <div className="map-panel">
            <svg width="100%" height="100%" viewBox="0 0 600 260" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
              <path className="route-line" d="M45 200 C120 160, 150 110, 230 138 S360 190, 430 150 S520 80, 560 102" stroke="#3E7BFA" strokeWidth="2.5" fill="none" />
              <path className="route-line" d="M150 80 C190 120, 200 150, 280 170 S410 180, 520 150" stroke="#F5A524" strokeWidth="2.5" fill="none" />
            </svg>
            <div className="map-pin" style={{ left: '15%', top: '42%', background: '#0EA394' }} />
            <div className="map-pin" style={{ left: '31%', top: '17%', background: '#3E7BFA' }} />
            <div className="map-pin" style={{ left: '48%', top: '62%', background: '#EF5B4E' }} />
            <div className="map-pin" style={{ left: '68%', top: '35%', background: '#F5A524' }} />
            <div className="map-pin" style={{ left: '82%', top: '58%', background: '#7C6CF0' }} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Status overview</div>
            <div className="panel-link">Today</div>
          </div>

          <div className="timeline">
            {timeline.map((item) => (
              <div key={item.title} className={`timeline-item ${item.status === 'pending' ? 'pending' : ''}`}>
                <div className="timeline-dot" />
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-meta">{item.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Active shipments</div>
          <div className="panel-link">View all</div>
        </div>

        <div className="filters">
          <div className="filter-chip"><b>All</b> <ChevronDown size={14} /></div>
          <div className="filter-chip">Status <ChevronDown size={14} /></div>
          <div className="filter-chip">Zone <ChevronDown size={14} /></div>
          <div className="filter-chip">Date range <ChevronDown size={14} /></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Route</th>
              <th>Customer</th>
              <th>Status</th>
              <th>ETA</th>
              <th>COD</th>
            </tr>
          </thead>
          <tbody>
            {shipmentRows.map((shipment) => (
              <tr key={shipment.id} className="rowh">
                <td><div className="tracking-id">{shipment.id}</div></td>
                <td>{shipment.route}</td>
                <td>
                  <div>{shipment.customer}</div>
                  <div style={{ fontSize: 11, color: '#9AA1B4', marginTop: 2 }}>{shipment.type}</div>
                </td>
                <td>
                  <span className={`status-pill ${getStatusClass(shipment.status)}`}>
                    <span className="dot" />
                    {shipment.status}
                  </span>
                </td>
                <td>{shipment.eta}</td>
                <td>{shipment.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
