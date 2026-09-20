import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import useStore from '../../hooks/useStore';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';

export default function PendingDeliveriesPage() {
  const { shipments, removeShipment } = useStore();
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const pending = useMemo(() => {
    const list = shipments.filter((s) => !s.driverId && ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH'].includes(s.status));
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) => [s.trackingNumber, s.recipientName, s.recipientCity].join(' ').toLowerCase().includes(term));
  }, [shipments, query]);

  const handleDelete = () => {
    if (!pendingDelete) return;
    removeShipment(pendingDelete.id);
    toast.success(`${pendingDelete.trackingNumber} deleted`);
    setPendingDelete(null);
  };

  const columns = [
    { key: 'tracking', label: 'Tracking' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'destination', label: 'Destination' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Pending deliveries</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Pending deliveries</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Prepare unassigned shipments for the next delivery run.</div>
      </div>

      <div style={{ maxWidth: 380, marginBottom: 16 }}>
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search shipment or recipient..." />
      </div>

      {pending.length === 0 ? (
        <EmptyState title="Nothing pending" description="All shipments have been assigned a driver." />
      ) : (
        <Table
          columns={columns}
          data={pending}
          rowKey="id"
          renderRow={(s) => (
            <tr key={s.id}>
              <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{s.trackingNumber}</td>
              <td>{s.recipientName}</td>
              <td>{s.recipientCity}</td>
              <td><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
              <td style={{ textAlign: 'right' }}>
                <Button size="small" variant="danger" icon={Trash2} onClick={() => setPendingDelete(s)}>Delete</Button>
              </td>
            </tr>
          )}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete shipment"
        message={pendingDelete ? `Delete ${pendingDelete.trackingNumber} for ${pendingDelete.recipientName}? The shipment is removed permanently and stops being tracked.` : ''}
        confirmLabel="Delete shipment"
        danger
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </PortalLayout>
  );
}
