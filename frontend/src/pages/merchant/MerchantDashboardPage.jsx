import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PackageOpen, Plus, Upload, WalletCards } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone, formatLKR } from '../../utils/shipmentStatus';

export default function MerchantDashboardPage() {
  const { user } = useAuth();
  const { shipments, settlements } = useStore();
  const merchantName = user?.merchantName || 'Urban Mart';

  const mine = useMemo(() => shipments.filter((s) => s.senderName === merchantName), [shipments, merchantName]);
  const delivered = mine.filter((s) => s.status === 'DELIVERED').length;
  const inTransit = mine.filter((s) => ['PICKED_UP', 'AT_ORIGIN_BRANCH', 'OUT_FOR_DELIVERY'].includes(s.status)).length;
  const failed = mine.filter((s) => ['DELIVERY_FAILED', 'RTO'].includes(s.status)).length;
  const codPending = settlements.filter((s) => s.merchant === merchantName && s.status !== 'Cleared').reduce((sum, s) => sum + (s.expected - s.collected), 0);

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Overview</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>{merchantName}</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{mine.length} shipments with EgoTECHWORLD.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/merchant/bulk-upload"><Button variant="secondary" icon={Upload}>Bulk upload</Button></Link>
          <Link to="/shipments/new"><Button variant="accent" icon={Plus}>Create shipment</Button></Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Shipments" value={mine.length} delta={`${inTransit} in transit`} icon={PackageOpen} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Delivered" value={delivered} delta="Successfully completed" icon={CheckCircle2} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <KpiCard label="Failed / RTO" value={failed} delta="Needs attention" icon={PackageOpen} iconBg="#FDE9E7" iconColor="#B23528" />
        <KpiCard label="COD pending" value={formatLKR(codPending)} delta="Awaiting settlement" icon={WalletCards} iconBg="#FCEFD6" iconColor="#8A5A05" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Recent shipments</div>
          <Link to="/merchant/shipments" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>View all</Link>
        </div>
        {mine.length === 0 ? (
          <div style={{ color: '#697086', fontSize: 12.5 }}>No shipments yet - create your first one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Tracking', 'Recipient', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#9AA1B4', fontWeight: 700, padding: '0 12px 10px', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>
              {mine.slice(0, 6).map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F', fontSize: 12.5 }}>{s.trackingNumber}</Link></td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.recipientName}</td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalLayout>
  );
}
