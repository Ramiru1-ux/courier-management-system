import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Download } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

export default function InvoicesPage() {
  const { invoices, payInvoice } = useStore();

  const handlePay = (invoice) => {
    payInvoice(invoice.id);
    toast.success(`${invoice.id} marked paid`);
  };

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

  const columns = [
    { key: 'id', label: 'Invoice' },
    { key: 'merchant', label: 'Merchant' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Issued' },
    { key: 'dueDate', label: 'Due' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Invoices</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Invoices</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Merchant billing for courier service charges.</div>
      </div>

      <Table
        columns={columns}
        data={invoices}
        rowKey="id"
        emptyMessage="No invoices yet."
        renderRow={(invoice) => (
          <tr key={invoice.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{invoice.id}</td>
            <td>{invoice.merchant}</td>
            <td>{formatLKR(invoice.amount)}</td>
            <td>{invoice.date}</td>
            <td>{invoice.dueDate}</td>
            <td><StatusBadge status={invoice.status} tone={invoice.status === 'Paid' ? 'teal' : invoice.status === 'Overdue' ? 'coral' : 'amber'} /></td>
            <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button size="small" variant="secondary" icon={Download} onClick={() => handleDownload(invoice)} />
              {invoice.status !== 'Paid' && <Button size="small" variant="primary" icon={CheckCircle2} onClick={() => handlePay(invoice)}>Mark paid</Button>}
            </td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
