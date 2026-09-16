import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PackageCheck, PackageSearch, Truck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';

const EXCEPTION_STATUSES = ['DAMAGED', 'LOST', 'RTO', 'DELIVERY_FAILED'];

/**
 * Real branch-manager dashboard - the dead version of this file rendered
 * fixed numbers (428 inbound, 96 ready, a hardcoded 7-row table) via its
 * own BranchShell component. This reads only what the backend already
 * scopes to this branch (item.branch === user.branchName - see
 * SCOPED_OWNERSHIP.shipments in backend/utils/roleScope.js), the same
 * pattern every other real dashboard in this app uses.
 */
export default function BranchDashboardPage() {
  const { user } = useAuth();
  const { shipments, drivers } = useStore();

  const inboundToday = shipments.filter((s) => ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH'].includes(s.status));
  const outForDelivery = shipments.filter((s) => s.status === 'OUT_FOR_DELIVERY');
  const delivered = shipments.filter((s) => s.status === 'DELIVERED');
  const exceptions = shipments.filter((s) => EXCEPTION_STATUSES.includes(s.status));
  const recent = [...shipments].slice(0, 6);

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Branch / <b style={{ color: '#697086' }}>Dashboard</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>{user?.branch || 'Your branch'}</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{shipments.length} shipment(s) currently at this branch.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Inbound / processing" value={inboundToday.length} delta="At this branch" icon={PackageSearch} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Out for delivery" value={outForDelivery.length} delta={`${drivers.length} driver(s) here`} icon={Truck} iconBg="#FCEFD6" iconColor="#8A5A05" />
        <KpiCard label="Delivered" value={delivered.length} delta="All time, this branch" icon={PackageCheck} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <KpiCard label="Exceptions" value={exceptions.length} delta="Damaged / lost / RTO / failed" icon={AlertTriangle} iconBg="#FDE9E7" iconColor="#B23528" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Recent shipment activity</div>
          <Link to="/branch/shipments" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>View all</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ color: '#697086', fontSize: 12.5 }}>No shipments at this branch yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {recent.map((s) => (
              <Link key={s.id} to={`/shipments/${s.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F9FAFC', borderRadius: 10, textDecoration: 'none' }}>
                <div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 12.5, color: '#12213F' }}>{s.trackingNumber}</div>
                  <div style={{ fontSize: 11.5, color: '#697086' }}>{s.recipientName} · {s.recipientCity}</div>
                </div>
                <StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
