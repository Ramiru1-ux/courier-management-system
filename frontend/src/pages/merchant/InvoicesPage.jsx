import React, { useMemo } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { formatLKR } from '../../utils/shipmentStatus';
import { Download } from 'lucide-react';

export default function MerchantInvoicesPage() {
  const { user } = useAuth();
  const { invoices } = useStore();
  const merchantName = user?.merchantName || 'Urban Mart';
  const mine = useMemo(() => invoices.filter((i) => i.merchant === merchantName), [invoices, merchantName]);

  const handleDownload = (invoice) => {
    const text = `Invoice ${invoice.id}\nMerchant: ${invoice.merchant}\nAmount: ${formatLKR(invoice.amount)}\nDate: ${invoice.date}\nDue: ${invoice.dueDate}\nStatus: ${invoice.status}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Invoices</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Invoices</h1>
      </div>

      <Table
        columns={[{ key: 'id', label: 'Invoice' }, { key: 'amount', label: 'Amount' }, { key: 'date', label: 'Issued' }, { key: 'due', label: 'Due' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]}
        data={mine}
        rowKey="id"
        emptyMessage="No invoices yet."
        renderRow={(invoice) => (
          <tr key={invoice.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{invoice.id}</td>
            <td>{formatLKR(invoice.amount)}</td>
            <td>{invoice.date}</td>
            <td>{invoice.dueDate}</td>
            <td><StatusBadge status={invoice.status} tone={invoice.status === 'Paid' ? 'teal' : invoice.status === 'Overdue' ? 'coral' : 'amber'} /></td>
            <td style={{ textAlign: 'right' }}><Button size="small" variant="secondary" icon={Download} onClick={() => handleDownload(invoice)} /></td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
