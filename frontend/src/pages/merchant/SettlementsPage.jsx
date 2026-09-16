import React, { useMemo } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { formatLKR } from '../../utils/shipmentStatus';

export default function MerchantSettlementsPage() {
  const { user } = useAuth();
  const { settlements } = useStore();
  const merchantName = user?.merchantName || 'Urban Mart';
  const mine = useMemo(() => settlements.filter((s) => s.merchant === merchantName), [settlements, merchantName]);

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Settlements</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>COD settlements</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Cash-on-delivery collected on your behalf and settled to you.</div>
      </div>

      <Table
        columns={[{ key: 'id', label: 'Settlement' }, { key: 'reference', label: 'Shipment' }, { key: 'due', label: 'Due' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }]}
        data={mine}
        rowKey="id"
        emptyMessage="No settlements yet."
        renderRow={(s) => (
          <tr key={s.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{s.id}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{s.reference}</td>
            <td>{s.due}</td>
            <td>{formatLKR(s.expected)}</td>
            <td><StatusBadge status={s.status} tone={s.status === 'Cleared' ? 'teal' : s.status === 'Review required' ? 'coral' : 'amber'} /></td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
