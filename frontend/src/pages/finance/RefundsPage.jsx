import React from 'react';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

export default function RefundsPage() {
  const { refunds, decideRefund } = useStore();

  const handleDecision = (refund, decision) => {
    decideRefund(refund.id, decision);
    toast[decision === 'Approved' ? 'success' : 'error'](`${refund.id} ${decision.toLowerCase()}`);
  };

  const columns = [
    { key: 'id', label: 'Refund' },
    { key: 'reference', label: 'Shipment' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Refunds</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Refunds & adjustments</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Review and decide on customer refund requests.</div>
      </div>

      <Table
        columns={columns}
        data={refunds}
        rowKey="id"
        emptyMessage="No refund requests."
        renderRow={(refund) => (
          <tr key={refund.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{refund.id}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{refund.reference}</td>
            <td>{refund.customer}</td>
            <td>{formatLKR(refund.amount)}</td>
            <td style={{ color: '#697086', fontSize: 12 }}>{refund.reason}</td>
            <td><StatusBadge status={refund.status} tone={refund.status === 'Approved' ? 'teal' : refund.status === 'Rejected' ? 'coral' : 'amber'} /></td>
            <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {refund.status === 'Pending' && (
                <>
                  <Button size="small" variant="primary" icon={Check} onClick={() => handleDecision(refund, 'Approved')}>Approve</Button>
                  <Button size="small" variant="danger" icon={X} onClick={() => handleDecision(refund, 'Rejected')}>Reject</Button>
                </>
              )}
            </td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
