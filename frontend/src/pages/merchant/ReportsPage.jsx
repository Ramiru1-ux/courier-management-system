import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CircleDollarSign, Download, PackageCheck, TrendingUp, Undo2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { formatLKR, statusLabel } from '../../utils/shipmentStatus';

// The dead frontend/src/pages/merchant/ReportsPage.jsx this file replaces
// rendered fixed literals (96.8%, Rs 559K, a hardcoded bar-height array) via
// the unrouted MerchantShell component - none of it read real data. This
// version reads only what the backend already scopes to this merchant
// (senderName === user.merchantName - see roleScope.js), the same pattern
// finance/FinancialReportsPage.jsx already uses for its own real numbers.
export default function MerchantReportsPage() {
  const { user } = useAuth();
  const { shipments, settlements } = useStore();

  const mine = useMemo(() => shipments.filter((s) => s.senderName === user?.merchantName), [shipments, user]);
  const myCod = useMemo(() => settlements.filter((s) => s.merchant === user?.merchantName), [settlements, user]);

  const delivered = mine.filter((s) => s.status === 'DELIVERED').length;
  const rto = mine.filter((s) => ['RTO', 'DELIVERY_FAILED'].includes(s.status)).length;
  const successRate = mine.length ? Math.round((delivered / mine.length) * 100) : 0;
  const codCollected = myCod.reduce((sum, s) => sum + (s.collected || 0), 0);

  const statusChartData = useMemo(() => {
    const counts = {};
    mine.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status: statusLabel(status), count }));
  }, [mine]);

  const cityChartData = useMemo(() => {
    const counts = {};
    mine.forEach((s) => { counts[s.recipientCity || 'Unknown'] = (counts[s.recipientCity || 'Unknown'] || 0) + 1; });
    return Object.entries(counts).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [mine]);

  const handleExport = () => {
    const rows = ['Tracking Number,Status,Recipient City,COD Amount'].concat(
      mine.map((s) => `${s.trackingNumber},${statusLabel(s.status)},${s.recipientCity || ''},${s.codAmount || 0}`)
    );
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merchant-shipment-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Reports</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Shipment reports</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Live performance for {user?.merchantName || 'your account'} - {mine.length} shipment(s) total.</div>
        </div>
        <Button variant="secondary" icon={Download} onClick={handleExport}>Export CSV</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total shipments" value={mine.length} delta={`${delivered} delivered`} icon={PackageCheck} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Delivery success" value={`${successRate}%`} delta={`${delivered} of ${mine.length}`} icon={TrendingUp} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <KpiCard label="RTO / failed" value={rto} delta={mine.length ? `${Math.round((rto / mine.length) * 100)}% of total` : 'No shipments yet'} icon={Undo2} iconBg="#FDE9E7" iconColor="#B23528" />
        <KpiCard label="COD collected" value={formatLKR(codCollected)} delta={`${myCod.length} settlement(s)`} icon={CircleDollarSign} iconBg="#FCEFD6" iconColor="#8A5A05" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14 }}>Shipments by status</div>
          <div style={{ width: '100%', height: 260 }}>
            {statusChartData.length === 0 ? (
              <div style={{ color: '#9AA1B4', fontSize: 12.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No shipments yet.</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E7EF" />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3E7BFA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14 }}>Top destinations</div>
          {cityChartData.length === 0 ? (
            <div style={{ color: '#9AA1B4', fontSize: 12.5 }}>No shipments yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 2 }}>
              {cityChartData.map((row) => (
                <div key={row.city} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>
                  <span style={{ color: '#697086' }}>{row.city}</span>
                  <strong style={{ color: '#12213F' }}>{row.count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
