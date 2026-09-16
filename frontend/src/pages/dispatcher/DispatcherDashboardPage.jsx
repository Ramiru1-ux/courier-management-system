import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PackageOpen, Truck, Users } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';

export default function DispatcherDashboardPage() {
  const { shipments, drivers } = useStore();

  const pending = shipments.filter((s) => !s.driverId && ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH'].includes(s.status));
  const outForDelivery = shipments.filter((s) => s.status === 'OUT_FOR_DELIVERY');
  const deliveredToday = shipments.filter((s) => s.status === 'DELIVERED').length;
  const availableDrivers = drivers.filter((d) => d.status === 'Available').length;

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Overview</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Dispatcher dashboard</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Assign drivers, monitor active deliveries and plan routes.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Pending assignment" value={pending.length} delta="Needs a driver" icon={PackageOpen} iconBg="#FCEFD6" iconColor="#8A5A05" />
        <KpiCard label="Out for delivery" value={outForDelivery.length} delta="In progress now" icon={Truck} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Available drivers" value={availableDrivers} delta={`${drivers.length} total`} icon={Users} iconBg="#EFEBFD" iconColor="#5445D6" />
        <KpiCard label="Delivered" value={deliveredToday} delta="Completed" icon={CheckCircle2} iconBg="#E4F7F4" iconColor="#0C8C6B" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Awaiting assignment</div>
          <Link to="/dispatcher/pending" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>Assign now</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Tracking', 'Recipient', 'Destination', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#9AA1B4', fontWeight: 700, padding: '0 12px 10px', textTransform: 'uppercase' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {pending.slice(0, 6).map((s) => (
              <tr key={s.id}>
                <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F', fontSize: 12.5 }}>{s.trackingNumber}</Link></td>
                <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.recipientName}</td>
                <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.recipientCity}</td>
                <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '20px 12px', textAlign: 'center', color: '#697086', fontSize: 12.5 }}>Nothing waiting on a driver right now.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
