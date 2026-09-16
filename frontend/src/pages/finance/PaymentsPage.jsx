import React, { useMemo, useState } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

export default function PaymentsPage() {
  const { payments } = useStore();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return payments;
    return payments.filter((p) => [p.id, p.reference, p.method, p.status].join(' ').toLowerCase().includes(term));
  }, [payments, query]);

  const columns = [
    { key: 'id', label: 'Payment' },
    { key: 'reference', label: 'Shipment' },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Payments</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Payments</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Every payment captured across cash, card, bank transfer and COD.</div>
      </div>

      <div style={{ maxWidth: 380, marginBottom: 16 }}>
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payments..." />
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey="id"
        emptyMessage="No payments match your search."
        renderRow={(payment) => (
          <tr key={payment.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{payment.id}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{payment.reference}</td>
            <td>{payment.method}</td>
            <td>{formatLKR(payment.amount)}</td>
            <td>{payment.date}</td>
            <td><StatusBadge status={payment.status} tone={payment.status === 'Completed' ? 'teal' : payment.status === 'Failed' ? 'coral' : 'amber'} /></td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
