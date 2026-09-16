import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone, formatLKR } from '../../utils/shipmentStatus';

export default function MerchantShipmentsPage() {
  const { user } = useAuth();
  const { shipments } = useStore();
  const merchantName = user?.merchantName || 'Urban Mart';
  const [query, setQuery] = useState('');

  const mine = useMemo(() => {
    const base = shipments.filter((s) => s.senderName === merchantName);
    const term = query.trim().toLowerCase();
    if (!term) return base;
    return base.filter((s) => [s.trackingNumber, s.recipientName, s.recipientCity].join(' ').toLowerCase().includes(term));
  }, [shipments, merchantName, query]);

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Shipments</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Track shipments</h1>
      </div>

      <div style={{ maxWidth: 380, marginBottom: 16 }}>
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracking number or recipient..." />
      </div>

      <Table
        columns={[{ key: 'tracking', label: 'Tracking' }, { key: 'recipient', label: 'Recipient' }, { key: 'cod', label: 'COD' }, { key: 'status', label: 'Status' }]}
        data={mine}
        rowKey="id"
        emptyMessage="No shipments match your search."
        renderRow={(s) => (
          <tr key={s.id}>
            <td><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F' }}>{s.trackingNumber}</Link></td>
            <td>{s.recipientName}<div style={{ fontSize: 11, color: '#9AA1B4' }}>{s.recipientCity}</div></td>
            <td>{s.codAmount ? formatLKR(s.codAmount) : '—'}</td>
            <td><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
