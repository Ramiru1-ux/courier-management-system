import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }} aria-label={`${n} star`}>
          <Star size={22} fill={n <= value ? '#F5A524' : 'none'} color={n <= value ? '#F5A524' : '#CBD3E2'} />
        </button>
      ))}
    </div>
  );
}

export default function CustomerShipmentHistoryPage() {
  const { user } = useAuth();
  const { shipments, ratings, addRating } = useStore();
  // A customer is the recipient of a shipment, not its sender (customers
  // cannot create shipments at all - see AppRoutes.jsx).
  const mine = useMemo(() => shipments.filter((s) => s.recipientName === user?.name), [shipments, user]);
  const [rateTarget, setRateTarget] = useState(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  const hasRating = (shipmentId) => ratings.some((r) => r.shipmentId === shipmentId);

  const handleSubmitRating = () => {
    if (!rateTarget) return;
    addRating(rateTarget.id, rateTarget.driverId, stars, comment);
    toast.success('Thanks for your feedback!');
    setRateTarget(null);
    setComment('');
    setStars(5);
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Customer / <b style={{ color: '#697086' }}>Shipment history</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Shipment history</h1>
      </div>

      <Table
        columns={[{ key: 'tracking', label: 'Tracking' }, { key: 'recipient', label: 'Recipient' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]}
        data={mine}
        rowKey="id"
        emptyMessage="You haven't sent any shipments yet."
        renderRow={(s) => (
          <tr key={s.id}>
            <td><Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F' }}>{s.trackingNumber}</Link></td>
            <td>{s.recipientName}<div style={{ fontSize: 11, color: '#9AA1B4' }}>{s.recipientCity}</div></td>
            <td><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
            <td style={{ textAlign: 'right' }}>
              {s.status === 'DELIVERED' && !hasRating(s.id) && (
                <Button size="small" variant="secondary" icon={Star} onClick={() => setRateTarget(s)}>Rate delivery</Button>
              )}
              {s.status === 'DELIVERED' && hasRating(s.id) && <span style={{ fontSize: 11.5, color: '#9AA1B4' }}>Rated</span>}
            </td>
          </tr>
        )}
      />

      <Modal
        open={Boolean(rateTarget)}
        onClose={() => setRateTarget(null)}
        title="Rate your delivery"
        description={rateTarget ? `How was your experience with ${rateTarget.trackingNumber}?` : ''}
        footer={<><Button variant="secondary" onClick={() => setRateTarget(null)}>Cancel</Button><Button variant="primary" onClick={handleSubmitRating}>Submit rating</Button></>}
      >
        <div style={{ marginBottom: 16 }}><StarPicker value={stars} onChange={setStars} /></div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Comment (optional)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit' }} />
      </Modal>
    </PortalLayout>
  );
}
