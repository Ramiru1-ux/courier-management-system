import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PackageOpen, Plus, Upload, WalletCards } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone, formatLKR, needsAttention } from '../../utils/shipmentStatus';
import { getFailedRtoShipments } from '../../api/appDataApi';

export default function MerchantDashboardPage() {
  const { user } = useAuth();
  const { shipments, settlements } = useStore();
  const merchantName = user?.merchantName || 'Urban Mart';

  const mine = useMemo(() => shipments.filter((s) => s.senderName === merchantName), [shipments, merchantName]);
  const delivered = mine.filter((s) => s.status === 'DELIVERED').length;
  const inTransit = mine.filter((s) => ['PICKED_UP', 'AT_ORIGIN_BRANCH', 'OUT_FOR_DELIVERY'].includes(s.status)).length;
  // Counted by MongoDB, not from the rows loaded in this browser: the card
  // has to describe the real database state. needsAttention() covers
  // DELIVERY_FAILED and every unfinished RTO stage, and deliberately leaves
  // out RTO_COMPLETED - that parcel is already back with the merchant.
  const localFailed = mine.filter((s) => needsAttention(s.status)).length;
  const [failedCount, setFailedCount] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getFailedRtoShipments()
      .then((response) => { if (!cancelled) setFailedCount(response?.needsAttention ?? null); })
      // The scoped shipment list already in the store is an accurate
      // fallback if the count request itself fails; it is the same data,
      // just counted client-side.
      .catch(() => { if (!cancelled) setFailedCount(null); });
    return () => { cancelled = true; };
  }, [merchantName]);
  const failed = failedCount === null ? localFailed : failedCount;
  /**
   * COD money that is not yet in the merchant's hands. Two different things
   * make it up, and the card used to count only the first, which is why it
   * read Rs 0 while COD was plainly still owed on undelivered parcels:
   *
   *   - awaiting settlement: collected from the customer, not yet paid out
   *     (an uncleared settlement row);
   *   - still in transit: the parcel has not been delivered yet, so the cash
   *     has not even been collected.
   *
   * Cancelled parcels and completed returns are excluded - no COD will ever
   * be collected on those. Settlements here are already scoped to this
   * merchant by the server (scopeSnapshotForRead in
   * backend/utils/roleScope.js), so this is their own money only.
   */
  const myShipments = mine;
  const mySettlements = settlements.filter((s) => s.merchant === merchantName);

  const codAwaitingSettlement = mySettlements
    .filter((s) => s.status !== 'Cleared')
    .reduce((sum, s) => sum + ((Number(s.expected) || 0) - (Number(s.collected) || 0)), 0);

  const NO_COD_EXPECTED = ['DELIVERED', 'CANCELLED', 'RTO_COMPLETED', 'RTO_IN_TRANSIT', 'RTO_INITIATED', 'RTO', 'LOST'];
  const codInTransit = myShipments
    .filter((s) => !NO_COD_EXPECTED.includes(s.status))
    .reduce((sum, s) => sum + (Number(s.codAmount) || 0), 0);

  const codSettled = mySettlements
    .filter((s) => s.status === 'Cleared')
    .reduce((sum, s) => sum + (Number(s.collected) || 0), 0);

  const codPending = codAwaitingSettlement + codInTransit;

  // Says what the number is actually made of, instead of always claiming
  // "Awaiting settlement" even when nothing is.
  const codDetail = codPending > 0
    ? [
      codAwaitingSettlement > 0 ? `${formatLKR(codAwaitingSettlement)} awaiting settlement` : null,
      codInTransit > 0 ? `${formatLKR(codInTransit)} still in transit` : null,
    ].filter(Boolean).join(' · ')
    : codSettled > 0 ? `All settled - ${formatLKR(codSettled)} paid out` : 'No COD on your shipments yet';

  // Likewise: when nothing needs attention, say what that means rather than
  // leaving a bare 0 with no context.
  const closedReturns = myShipments.filter((s) => s.status === 'RTO_COMPLETED').length;
  const failedDetail = failed > 0
    ? 'Needs attention - view'
    : closedReturns > 0
      ? `No open issues - ${closedReturns} return(s) closed`
      : 'No failed deliveries';

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Overview</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>{merchantName}</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{mine.length} shipments with EgoTECHWORLD.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/merchant/bulk-upload"><Button variant="secondary" icon={Upload}>Bulk upload</Button></Link>
          <Link to="/shipments/new"><Button variant="accent" icon={Plus}>Create shipment</Button></Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Shipments" value={mine.length} delta={`${inTransit} in transit`} icon={PackageOpen} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Delivered" value={delivered} delta="Successfully completed" icon={CheckCircle2} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <Link to="/merchant/failed-rto" style={{ textDecoration: 'none' }}>
          <KpiCard label="Failed / RTO" value={failed} delta={failedDetail} icon={PackageOpen} iconBg="#FDE9E7" iconColor="#B23528" />
        </Link>
        <Link to="/merchant/settlements" style={{ textDecoration: 'none' }}>
          <KpiCard label="COD pending" value={formatLKR(codPending)} delta={codDetail} icon={WalletCards} iconBg="#FCEFD6" iconColor="#8A5A05" />
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Recent shipments</div>
          <Link to="/merchant/shipments" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>View all</Link>
        </div>
        {mine.length === 0 ? (
          <div style={{ color: '#697086', fontSize: 12.5 }}>No shipments yet - create your first one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Tracking', 'Recipient', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#9AA1B4', fontWeight: 700, padding: '0 12px 10px', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>
              {mine.slice(0, 6).map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F', fontSize: 12.5 }}>{s.trackingNumber}</Link></td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF', fontSize: 12.5 }}>{s.recipientName}</td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #E3E7EF' }}><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalLayout>
  );
}
