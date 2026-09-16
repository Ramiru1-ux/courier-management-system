import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

export default function MerchantSettlementsPage() {
  const { settlements, markSettlementCleared } = useStore();

  const handleSettle = (settlement) => {
    markSettlementCleared(settlement.id);
    toast.success(`${settlement.merchant} settled`);
  };

  const columns = [
    { key: 'id', label: 'Settlement' },
    { key: 'merchant', label: 'Merchant' },
    { key: 'reference', label: 'Reference' },
    { key: 'due', label: 'Due' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Merchant settlements</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Merchant settlements</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>COD collected minus courier and return charges, ready for payout.</div>
      </div>

      <Table
        columns={columns}
        data={settlements}
        rowKey="id"
        emptyMessage="No settlements yet."
        renderRow={(settlement) => (
          <tr key={settlement.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{settlement.id}</td>
            <td>{settlement.merchant}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{settlement.reference}</td>
            <td>{settlement.due}</td>
            <td>{formatLKR(settlement.expected)}</td>
            <td><StatusBadge status={settlement.status} tone={settlement.status === 'Cleared' ? 'teal' : settlement.status === 'Review required' ? 'coral' : 'amber'} /></td>
            <td style={{ textAlign: 'right' }}>
              {settlement.status !== 'Cleared' && <Button size="small" variant="primary" icon={CheckCircle2} onClick={() => handleSettle(settlement)}>Settle</Button>}
            </td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
