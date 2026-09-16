import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, ShieldCheck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { formatLKR } from '../../utils/shipmentStatus';

export default function CustomerPaymentsPage() {
  const { user } = useAuth();
  const { shipments, payments, processSandboxPayment } = useStore();
  // A customer is the recipient of a shipment, not its sender.
  const myShipmentTrackingNumbers = useMemo(() => shipments.filter((s) => s.recipientName === user?.name).map((s) => s.trackingNumber), [shipments, user]);
  const myPayments = useMemo(() => payments.filter((p) => myShipmentTrackingNumbers.includes(p.reference)), [payments, myShipmentTrackingNumbers]);
  const unpaidShipments = useMemo(
    () => shipments.filter((s) => myShipmentTrackingNumbers.includes(s.trackingNumber) && !myPayments.some((p) => p.reference === s.trackingNumber)),
    [shipments, myShipmentTrackingNumbers, myPayments],
  );

  const [payOpen, setPayOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  const openPay = (shipment) => {
    setTarget(shipment);
    setCard({ number: '', expiry: '', cvv: '' });
    setPayOpen(true);
  };

  const handlePay = async (event) => {
    event.preventDefault();
    if (!target) return;
    setProcessing(true);
    const result = await processSandboxPayment({ reference: target.trackingNumber, amount: target.codAmount || 1000, method: 'Card' });
    setProcessing(false);
    setPayOpen(false);
    if (result.approved) {
      toast.success('Payment approved (sandbox)');
    } else {
      toast.error('Payment declined by sandbox gateway - please try again');
    }
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Customer / <b style={{ color: '#697086' }}>Payments</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Payments</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Sandbox payment gateway - no real transaction is made.</div>
      </div>

      {unpaidShipments.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#12213F', marginBottom: 10 }}>Shipments awaiting payment</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {unpaidShipments.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#F9FAFC', borderRadius: 9 }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12.5, fontWeight: 700 }}>{s.trackingNumber}</span>
                <Button size="small" variant="accent" icon={CreditCard} onClick={() => openPay(s)}>Pay {formatLKR(s.codAmount || 1000)}</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Table
        columns={[{ key: 'id', label: 'Payment' }, { key: 'reference', label: 'Shipment' }, { key: 'method', label: 'Method' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }]}
        data={myPayments}
        rowKey="id"
        emptyMessage="No payments yet."
        renderRow={(p) => (
          <tr key={p.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{p.id}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{p.reference}</td>
            <td>{p.method}</td>
            <td>{formatLKR(p.amount)}</td>
            <td><StatusBadge status={p.status} tone={p.status === 'Completed' ? 'teal' : p.status === 'Failed' ? 'coral' : 'amber'} /></td>
          </tr>
        )}
      />

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Sandbox card payment"
        description={target ? `Pay for ${target.trackingNumber}` : ''}
        footer={<><Button variant="secondary" onClick={() => setPayOpen(false)}>Cancel</Button><Button variant="primary" loading={processing} onClick={handlePay}>Pay now</Button></>}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#E8EFFE', color: '#2453B8', borderRadius: 9, padding: '10px 12px', fontSize: 12, marginBottom: 16 }}>
          <ShieldCheck size={15} />
          <span>Sandbox mode - enter any card details, no real charge occurs.</span>
        </div>
        <form onSubmit={handlePay} style={{ display: 'grid', gap: 12 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Card number</label><input value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} placeholder="4242 4242 4242 4242" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Expiry</label><input value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} placeholder="MM/YY" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>CVV</label><input value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))} placeholder="123" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
