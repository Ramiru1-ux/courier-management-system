import React from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Clock3, FileText, WalletCards } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

export default function FinanceDashboardPage() {
  const { settlements, invoices, refunds, driverReconciliation } = useStore();

  const grossCod = settlements.reduce((sum, s) => sum + s.expected, 0);
  const pending = settlements.filter((s) => s.status !== 'Cleared').reduce((sum, s) => sum + (s.expected - s.collected), 0);
  const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid').length;
  const pendingRefunds = refunds.filter((r) => r.status === 'Pending').length;

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Overview</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Finance dashboard</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>COD collection, settlements, invoicing and refunds at a glance.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Gross COD" value={formatLKR(grossCod)} delta={`${settlements.length} settlements`} icon={CircleDollarSign} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <KpiCard label="Pending payouts" value={formatLKR(pending)} delta="Awaiting reconciliation" icon={Clock3} iconBg="#FCEFD6" iconColor="#8A5A05" />
        <KpiCard label="Unpaid invoices" value={unpaidInvoices} delta={`${invoices.length} total`} icon={FileText} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Pending refunds" value={pendingRefunds} delta={`${refunds.length} total`} icon={WalletCards} iconBg="#FDE9E7" iconColor="#B23528" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Settlement queue</div>
            <Link to="/finance/settlements" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>View all</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Merchant', 'Due', 'Amount', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#9AA1B4', fontWeight: 700, padding: '0 12px 10px', textTransform: 'uppercase' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {settlements.slice(0, 6).map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.merchant}</td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.due}</td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{formatLKR(s.expected)}</td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}>
                    <StatusBadge status={s.status} tone={s.status === 'Cleared' ? 'teal' : s.status === 'Review required' ? 'coral' : 'amber'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Driver reconciliation</div>
            <Link to="/finance/reconciliation" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>Review</Link>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {driverReconciliation.slice(0, 5).map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F2F6', paddingBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12213F' }}>{r.driver}</div>
                  <div style={{ fontSize: 11, color: '#9AA1B4' }}>{r.date} · {formatLKR(r.collected)} of {formatLKR(r.expected)}</div>
                </div>
                <StatusBadge status={r.status} tone={r.status === 'Reconciled' ? 'teal' : 'amber'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
