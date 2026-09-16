import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, CheckCircle2, PackageOpen, Plus, ShieldCheck, Truck, Users } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import { statusLabel, statusTone, formatLKR } from '../../utils/shipmentStatus';

export default function AdminDashboardPage() {
  const { shipments, drivers, branches, users, auditLogs } = useStore();

  const delivered = shipments.filter((s) => s.status === 'DELIVERED').length;
  const activeDrivers = drivers.filter((d) => d.status !== 'Offline').length;
  const activeBranches = branches.filter((b) => b.status === 'Active').length;
  const codOutstanding = shipments.filter((s) => s.status !== 'DELIVERED' && s.status !== 'CANCELLED').reduce((sum, s) => sum + (s.codAmount || 0), 0);

  return (
    <PortalLayout>
      <style>{`.admin-dashboard-kpis{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:14px;margin-bottom:20px}.admin-dashboard-panels{display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-bottom:16px}.admin-dashboard-panels>div{min-width:0}.admin-dashboard-table-wrap{width:100%;overflow-x:auto}@media(max-width:1000px){.admin-dashboard-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-dashboard-panels{grid-template-columns:1fr}}@media(max-width:520px){.admin-dashboard-kpis{grid-template-columns:1fr}.admin-dashboard-table-wrap{margin:0 -20px;padding:0 20px;width:calc(100% + 40px)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Overview</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Administrator dashboard</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>System-wide view across branches, users and shipments.</div>
        </div>
        <Link to="/shipments/new"><Button variant="accent" icon={Plus}>Create shipment</Button></Link>
      </div>

      <div className="admin-dashboard-kpis">
        <KpiCard label="Total shipments" value={shipments.length} delta={`${delivered} delivered`} icon={PackageOpen} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Active drivers" value={activeDrivers} delta={`${drivers.length} total`} icon={Truck} iconBg="#EFEBFD" iconColor="#5445D6" />
        <KpiCard label="Active branches" value={activeBranches} delta={`${branches.length} total`} icon={BriefcaseBusiness} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <KpiCard label="System users" value={users.length} delta={`${users.filter((u) => u.status === 'Active').length} active`} icon={Users} iconBg="#FCEFD6" iconColor="#8A5A05" />
        <KpiCard label="COD outstanding" value={formatLKR(codOutstanding)} delta="Across open shipments" icon={CheckCircle2} iconBg="#FDE9E7" iconColor="#B23528" />
      </div>

      <div className="admin-dashboard-panels">
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Recent shipments</div>
            <Link to="/shipments" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>View all</Link>
          </div>
          <div className="admin-dashboard-table-wrap"><table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tracking', 'Recipient', 'Branch', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#9AA1B4', fontWeight: 700, padding: '0 12px 10px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 6).map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}>
                    <Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F', fontSize: 12.5 }}>{s.trackingNumber}</Link>
                  </td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.recipientName}</td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.branch}</td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Recent activity</div>
            <Link to="/admin/audit-logs" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>Audit log</Link>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {auditLogs.slice(0, 6).map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: '#E8EFFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={13} color="#2453B8" />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12213F' }}>{log.action}</div>
                  <div style={{ fontSize: 11, color: '#9AA1B4' }}>{log.detail} · {log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
