import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, TriangleAlert } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

export default function DriverReconciliationPage() {
  const { driverReconciliation, reconcileDriverEntry } = useStore();

  const handleReconcile = (entry) => {
    reconcileDriverEntry(entry.id, 'Reconciled');
    toast.success(`${entry.driver} reconciled`);
  };

  const handleDispute = (entry) => {
    reconcileDriverEntry(entry.id, 'Disputed');
    toast.error(`${entry.driver} flagged for dispute`);
  };

  const columns = [
    { key: 'driver', label: 'Driver' },
    { key: 'date', label: 'Date' },
    { key: 'expected', label: 'Expected' },
    { key: 'collected', label: 'Collected' },
    { key: 'diff', label: 'Difference' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Driver reconciliation</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Driver cash reconciliation</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Compare expected COD collections against what each driver has handed in.</div>
      </div>

      <Table
        columns={columns}
        data={driverReconciliation}
        rowKey="id"
        emptyMessage="No reconciliation entries."
        renderRow={(entry) => {
          const diff = entry.expected - entry.collected;
          return (
            <tr key={entry.id}>
              <td style={{ fontWeight: 600 }}>{entry.driver}</td>
              <td>{entry.date}</td>
              <td>{formatLKR(entry.expected)}</td>
              <td>{formatLKR(entry.collected)}</td>
              <td style={{ color: diff === 0 ? '#0C8C6B' : '#C4402F', fontWeight: 700 }}>{diff === 0 ? 'Rs 0' : formatLKR(diff)}</td>
              <td><StatusBadge status={entry.status} tone={entry.status === 'Reconciled' ? 'teal' : entry.status === 'Disputed' ? 'coral' : 'amber'} /></td>
              <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {entry.status === 'Pending' && (
                  <>
                    <Button size="small" variant="primary" icon={CheckCircle2} onClick={() => handleReconcile(entry)}>Reconcile</Button>
                    {diff !== 0 && <Button size="small" variant="danger" icon={TriangleAlert} onClick={() => handleDispute(entry)}>Dispute</Button>}
                  </>
                )}
              </td>
            </tr>
          );
        }}
      />
    </PortalLayout>
  );
}
