import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import useStore from '../../hooks/useStore';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';
import { TriangleAlert } from 'lucide-react';

export default function ExceptionsPage() {
  const { shipments } = useStore();

  const exceptions = useMemo(
    () => shipments.filter((s) => ['DAMAGED', 'LOST', 'RTO', 'DELIVERY_FAILED'].includes(s.status)),
    [shipments],
  );

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Exceptions</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Exceptions</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Damaged, lost, failed and returned shipments that need investigation.</div>
      </div>

      {exceptions.length === 0 ? (
        <EmptyState icon={TriangleAlert} title="No open exceptions" description="Every shipment is progressing normally." />
      ) : (
        <Table
          columns={[{ key: 'tracking', label: 'Tracking' }, { key: 'recipient', label: 'Recipient' }, { key: 'branch', label: 'Branch' }, { key: 'status', label: 'Status' }, { key: 'last', label: 'Last update' }]}
          data={exceptions}
          rowKey="id"
          renderRow={(s) => (
            <tr key={s.id}>
              <td><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F' }}>{s.trackingNumber}</Link></td>
              <td>{s.recipientName}<div style={{ fontSize: 11, color: '#9AA1B4' }}>{s.recipientCity}</div></td>
              <td>{s.branch}</td>
              <td><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} showIcon /></td>
              <td style={{ color: '#697086', fontSize: 12 }}>{s.history[s.history.length - 1]?.label}</td>
            </tr>
          )}
        />
      )}
    </PortalLayout>
  );
}
