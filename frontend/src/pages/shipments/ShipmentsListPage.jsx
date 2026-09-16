import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone, formatLKR } from '../../utils/shipmentStatus';

const STATUS_OPTIONS = ['All', 'CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RTO', 'CANCELLED'];

export default function ShipmentsListPage() {
  const { shipments, drivers } = useStore();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const driverName = (id) => (drivers.find((d) => d.id === id) || {}).name || 'Unassigned';

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return shipments.filter((s) => {
      const matchesTerm = !term || [s.trackingNumber, s.recipientName, s.recipientCity, s.senderName].join(' ').toLowerCase().includes(term);
      const matchesStatus = status === 'All' || s.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [shipments, query, status]);

  const columns = [
    { key: 'tracking', label: 'Tracking' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'driver', label: 'Driver' },
    { key: 'status', label: 'Status' },
    { key: 'cod', label: 'COD' },
  ];

  return (
    <PortalLayout>
      <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Shipments / <b style={{ color: '#697086' }}>All shipments</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Shipment management</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{shipments.length} shipments tracked in this workspace.</div>
        </div>
        {user?.role !== 'customer' && <Link to="/shipments/new"><Button variant="accent" icon={Plus}>New shipment</Button></Link>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracking number, recipient, city..." />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ minHeight: 42, padding: '9px 12px', border: '1px solid #E3E7EF', borderRadius: 10, background: '#fff', color: '#12213F', fontSize: 13 }}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'All' ? 'All statuses' : statusLabel(s)}</option>)}
        </select>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey="id"
        emptyMessage="No shipments match your filters."
        renderRow={(shipment) => (
          <tr key={shipment.id}>
            <td>
              <Link to={`/shipments/${shipment.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F' }}>{shipment.trackingNumber}</Link>
              <div style={{ fontSize: 11, color: '#9AA1B4', marginTop: 2 }}>{shipment.serviceType} · {shipment.weight} kg</div>
            </td>
            <td>
              <div>{shipment.recipientName}</div>
              <div style={{ fontSize: 11, color: '#9AA1B4' }}>{shipment.recipientCity}</div>
            </td>
            <td>{driverName(shipment.driverId)}</td>
            <td><StatusBadge status={statusLabel(shipment.status)} tone={statusTone(shipment.status)} /></td>
            <td>{shipment.codAmount ? formatLKR(shipment.codAmount) : '—'}</td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
