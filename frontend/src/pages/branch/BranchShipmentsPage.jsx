import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';

const STATUS_OPTIONS = ['All', 'CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RTO'];

/**
 * Real branch shipment list, scoped server-side to this branch manager's
 * own branch (see SCOPED_OWNERSHIP.shipments in roleScope.js) - the dead
 * version of this file rendered 4 hardcoded rows via its own BranchShell
 * component and a "Scan" button with no onClick handler at all.
 */
export default function BranchShipmentsPage() {
  const { shipments, drivers } = useStore();
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

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Branch / <b style={{ color: '#697086' }}>Shipments</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Branch shipments</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{shipments.length} shipment(s) at this branch.</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracking number, sender, recipient..." />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ minHeight: 42, padding: '9px 12px', border: '1px solid #E3E7EF', borderRadius: 10, background: '#fff', color: '#12213F', fontSize: 13 }}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'All' ? 'All statuses' : statusLabel(s)}</option>)}
        </select>
      </div>

      <Table
        columns={[{ key: 'tracking', label: 'Tracking' }, { key: 'sender', label: 'Sender' }, { key: 'recipient', label: 'Destination' }, { key: 'driver', label: 'Driver' }, { key: 'status', label: 'Status' }]}
        data={filtered}
        rowKey="id"
        emptyMessage="No shipments match your filters."
        renderRow={(s) => (
          <tr key={s.id}>
            <td><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F' }}>{s.trackingNumber}</Link></td>
            <td>{s.senderName}</td>
            <td>{s.recipientCity}</td>
            <td>{driverName(s.driverId)}</td>
            <td><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
