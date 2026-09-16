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

const CATEGORIES = ['Late delivery', 'Lost package', 'Damaged package', 'Wrong delivery', 'Missing COD', 'Incorrect charge', 'Driver behavior', 'Address issue'];

export default function CustomerComplaintsPage() {
  const { user } = useAuth();
  const { shipments, complaints, addComplaint } = useStore();
  const mine = useMemo(() => complaints.filter((c) => c.customer === user?.name), [complaints, user]);
  // A customer is the recipient of a shipment, not its sender.
  const myShipments = useMemo(() => shipments.filter((s) => s.recipientName === user?.name), [shipments, user]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ reference: myShipments[0]?.trackingNumber || '', category: CATEGORIES[0], description: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.description) return;
    addComplaint({ ...form, customer: user?.name });
    toast.success('Complaint submitted');
    setForm({ reference: myShipments[0]?.trackingNumber || '', category: CATEGORIES[0], description: '' });
    setOpen(false);
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Customer / <b style={{ color: '#697086' }}>Complaints</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>My complaints</h1>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>File a complaint</Button>
      </div>

      <Table
        columns={[{ key: 'id', label: 'Complaint' }, { key: 'reference', label: 'Shipment' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' }]}
        data={mine}
        rowKey="id"
        emptyMessage="You have no complaints on file."
        renderRow={(c) => (
          <tr key={c.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{c.id}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{c.reference}</td>
            <td>{c.category}</td>
            <td><StatusBadge status={c.status} tone={c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'teal' : c.status === 'OPEN' ? 'coral' : 'amber'} /></td>
          </tr>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="File a complaint" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleSubmit}>Submit</Button></>}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Related shipment</label>
            <select value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              {myShipments.map((s) => <option key={s.id} value={s.trackingNumber}>{s.trackingNumber}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit' }} />
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
