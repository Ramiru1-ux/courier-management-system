import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PackageX } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { FAILURE_REASONS, failureReasonLabel } from '../../utils/shipmentStatus';

export default function FailedDeliveryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shipments, updateShipmentStatus } = useStore();
  const driverId = user?.driverId || 'DRV-01';

  const pending = useMemo(() => shipments.filter((s) => s.driverId === driverId && s.status === 'OUT_FOR_DELIVERY'), [shipments, driverId]);
  const [shipmentId, setShipmentId] = useState(pending[0]?.id || '');
  const [reason, setReason] = useState(FAILURE_REASONS[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!shipmentId) return;
    const shipment = shipments.find((s) => s.id === shipmentId);
    updateShipmentStatus(shipmentId, 'DELIVERY_FAILED', `Delivery failed - ${failureReasonLabel(reason)}${notes ? `: ${notes}` : ''}`);
    toast.error(`${shipment?.trackingNumber} marked as failed delivery`);
    navigate('/driver/deliveries');
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Driver / <b style={{ color: '#697086' }}>Failed delivery</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Report a failed delivery</h1>
      </div>

      {pending.length === 0 ? (
        <EmptyState title="Nothing out for delivery" description="You have no active deliveries to report as failed." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 24, maxWidth: 520 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Shipment</label>
          <select value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, marginBottom: 16 }}>
            {pending.map((s) => <option key={s.id} value={s.id}>{s.trackingNumber} · {s.recipientName}</option>)}
          </select>

          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Reason</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, marginBottom: 16 }}>
            {FAILURE_REASONS.map((r) => <option key={r} value={r}>{failureReasonLabel(r)}</option>)}
          </select>

          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, marginBottom: 18, fontFamily: 'inherit' }} />

          <Button variant="danger" icon={PackageX} onClick={handleSubmit}>Confirm failed delivery</Button>
        </div>
      )}
    </PortalLayout>
  );
}
