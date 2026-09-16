import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';

export default function CustomerSupportPage() {
  const { user } = useAuth();
  const { shipments, supportTickets, addSupportTicket } = useStore();
  const mine = useMemo(() => supportTickets.filter((t) => t.customer === user?.name), [supportTickets, user]);
  // A customer is the recipient of a shipment, not its sender.
  const myShipments = useMemo(() => shipments.filter((s) => s.recipientName === user?.name), [shipments, user]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ reference: myShipments[0]?.trackingNumber || '', subject: '', priority: 'Medium', category: 'General question' });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.subject) return;
    addSupportTicket({ ...form, customer: user?.name });
    toast.success('Support ticket created');
    setForm({ reference: myShipments[0]?.trackingNumber || '', subject: '', priority: 'Medium', category: 'General question' });
    setOpen(false);
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Customer / <b style={{ color: '#697086' }}>Support</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Contact support</h1>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>New ticket</Button>
      </div>

      <Table
        columns={[{ key: 'id', label: 'Ticket' }, { key: 'subject', label: 'Subject' }, { key: 'priority', label: 'Priority' }, { key: 'status', label: 'Status' }]}
        data={mine}
        rowKey="id"
        emptyMessage="You have no support tickets."
        renderRow={(t) => (
          <tr key={t.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{t.id}</td>
            <td>{t.subject || t.category}</td>
            <td><StatusBadge status={t.priority} tone={t.priority === 'High' ? 'coral' : t.priority === 'Medium' ? 'amber' : 'neutral'} /></td>
            <td><StatusBadge status={t.status.replace(/_/g, ' ')} tone={t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'teal' : t.status === 'OPEN' ? 'coral' : 'amber'} /></td>
          </tr>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="New support ticket" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleSubmit}>Submit ticket</Button></>}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Related shipment (optional)</label>
            <select value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option value="">None</option>
              {myShipments.map((s) => <option key={s.id} value={s.trackingNumber}>{s.trackingNumber}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Subject</label><input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Briefly describe your issue" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Priority</label>
            <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
