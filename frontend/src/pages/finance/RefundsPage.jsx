import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Plus, X } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

const REASONS = [
  'Parcel lost in transit',
  'Parcel damaged in transit',
  'Overcharged delivery fee',
  'Duplicate payment',
  'Goodwill credit',
];

const emptyForm = { shipmentId: '', amount: '', reason: REASONS[0] };

export default function RefundsPage() {
  const { refunds, shipments, decideRefund, addRefund } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const selected = shipments.find((s) => s.id === form.shipmentId);

  const handleDecision = (refund, decision) => {
    decideRefund(refund.id, decision);
    toast[decision === 'Approved' ? 'success' : 'error'](`${refund.id} ${decision.toLowerCase()}`);
  };

  // Picking the shipment fills in its COD amount, which is what a refund is
  // for in almost every case - still editable for a part refund.
  const chooseShipment = (shipmentId) => {
    const shipment = shipments.find((s) => s.id === shipmentId);
    setForm((prev) => ({
      ...prev,
      shipmentId,
      amount: shipment?.codAmount ? String(shipment.codAmount) : '',
    }));
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!selected || !(amount > 0) || !form.reason.trim()) return;
    addRefund({
      reference: selected.trackingNumber,
      customer: selected.recipientName || 'Unknown recipient',
      amount,
      reason: form.reason.trim(),
    });
    toast.success(`Refund raised for ${selected.trackingNumber}`);
    setForm(emptyForm);
    setOpen(false);
  };

  const columns = [
    { key: 'id', label: 'Refund' },
    { key: 'reference', label: 'Shipment' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Finance / <b style={{ color: '#697086' }}>Refunds</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Refunds &amp; adjustments</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>
            {refunds.filter((r) => r.status === 'Pending').length} awaiting a decision. Lost and damaged parcels raise a refund on their own.
          </div>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)} disabled={shipments.length === 0}>Raise refund</Button>
      </div>

      <Table
        columns={columns}
        data={refunds}
        rowKey="id"
        emptyMessage="No refund requests yet - raise one above, or mark a parcel lost or damaged."
        renderRow={(refund) => (
          <tr key={refund.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{refund.id}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{refund.reference}</td>
            <td>{refund.customer}</td>
            <td>{formatLKR(refund.amount)}</td>
            <td style={{ color: '#697086', fontSize: 12 }}>{refund.reason}</td>
            <td><StatusBadge status={refund.status} tone={refund.status === 'Approved' ? 'teal' : refund.status === 'Rejected' ? 'coral' : 'amber'} /></td>
            <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {refund.status === 'Pending' && (
                <>
                  <Button size="small" variant="primary" icon={Check} onClick={() => handleDecision(refund, 'Approved')}>Approve</Button>
                  <Button size="small" variant="danger" icon={X} onClick={() => handleDecision(refund, 'Rejected')}>Reject</Button>
                </>
              )}
            </td>
          </tr>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Raise refund"
        description="Record money owed back to a customer. It is added as Pending for approval."
        footer={(
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="refund-form" disabled={!selected || !(Number(form.amount) > 0)}>Raise refund</Button>
          </>
        )}
      >
        <form id="refund-form" onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label htmlFor="refund-shipment" style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>Shipment</label>
            <select
              id="refund-shipment"
              value={form.shipmentId}
              onChange={(event) => chooseShipment(event.target.value)}
              required
              style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}
            >
              <option value="">Select a shipment</option>
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>{s.trackingNumber} — {s.recipientName || 'No recipient'}</option>
              ))}
            </select>
            {selected && (
              <div style={{ marginTop: 5, fontSize: 11, color: '#9AA1B4' }}>
                COD on this shipment: {selected.codAmount ? formatLKR(selected.codAmount) : 'none'}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="refund-amount" style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>Refund amount (Rs)</label>
            <input
              id="refund-amount"
              type="number"
              min="1"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="0"
              required
              style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}
            />
            <div style={{ marginTop: 5, fontSize: 11, color: '#9AA1B4' }}>Filled in from the shipment - change it for a part refund.</div>
          </div>

          <div>
            <label htmlFor="refund-reason" style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>Reason</label>
            <input
              id="refund-reason"
              list="refund-reasons"
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Why is this being refunded?"
              required
              style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}
            />
            <datalist id="refund-reasons">
              {REASONS.map((reason) => <option key={reason} value={reason} />)}
            </datalist>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
