import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone, formatLKR } from '../../utils/shipmentStatus';

export default function MyDeliveriesPage() {
  const { user } = useAuth();
  const { shipments } = useStore();
  const driverId = user?.driverId || 'DRV-01';

  const mine = useMemo(() => shipments.filter((s) => s.driverId === driverId), [shipments, driverId]);

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Driver / <b style={{ color: '#697086' }}>My deliveries</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>My deliveries</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Shipments currently assigned to you.</div>
      </div>

      {mine.length === 0 ? (
        <EmptyState title="Nothing assigned" description="You have no shipments assigned right now." />
      ) : (
        <Table
          columns={[{ key: 'tracking', label: 'Tracking' }, { key: 'recipient', label: 'Recipient' }, { key: 'address', label: 'Address' }, { key: 'cod', label: 'COD' }, { key: 'status', label: 'Status' }]}
          data={mine}
          rowKey="id"
          renderRow={(s) => (
            <tr key={s.id}>
              <td><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F' }}>{s.trackingNumber}</Link></td>
              <td>{s.recipientName}<div style={{ fontSize: 11, color: '#9AA1B4' }}>{s.recipientPhone}</div></td>
              <td>{s.recipientAddress}, {s.recipientCity}</td>
              <td>{s.codAmount ? formatLKR(s.codAmount) : '—'}</td>
              <td><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
            </tr>
          )}
        />
      )}
    </PortalLayout>
  );
}
