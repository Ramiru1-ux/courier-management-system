import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';
import { CircleDollarSign, FileText, TrendingUp, WalletCards } from 'lucide-react';

export default function FinancialReportsPage() {
  const { settlements, invoices, payments, refunds } = useStore();

  const grossCod = settlements.reduce((sum, s) => sum + s.expected, 0);
  const paidInvoiceTotal = invoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const completedPayments = payments.filter((p) => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const refundTotal = refunds.filter((r) => r.status === 'Approved').reduce((sum, r) => sum + r.amount, 0);

  const chartData = useMemo(() => {
    const byMerchant = {};
    settlements.forEach((s) => {
      byMerchant[s.merchant] = (byMerchant[s.merchant] || 0) + s.expected;
    });
    return Object.entries(byMerchant).map(([merchant, amount]) => ({ merchant, amount }));
  }, [settlements]);

  const handleExport = () => {
    const rows = ['Merchant,Expected COD'].concat(chartData.map((d) => `${d.merchant},${d.amount}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Reports</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Financial reports</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Revenue, COD and settlement performance overview.</div>
        </div>
        <Button variant="secondary" icon={Download} onClick={handleExport}>Export CSV</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Gross COD" value={formatLKR(grossCod)} delta={`${settlements.length} settlements`} icon={CircleDollarSign} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <KpiCard label="Invoices collected" value={formatLKR(paidInvoiceTotal)} delta={`${invoices.filter((i) => i.status === 'Paid').length} paid`} icon={FileText} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Completed payments" value={formatLKR(completedPayments)} delta={`${payments.length} recorded`} icon={TrendingUp} iconBg="#FCEFD6" iconColor="#8A5A05" />
        <KpiCard label="Refunds issued" value={formatLKR(refundTotal)} delta={`${refunds.filter((r) => r.status === 'Approved').length} approved`} icon={WalletCards} iconBg="#FDE9E7" iconColor="#B23528" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14 }}>Expected COD by merchant</div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E7EF" />
              <XAxis dataKey="merchant" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatLKR(value)} />
              <Bar dataKey="amount" fill="#3E7BFA" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PortalLayout>
  );
}
