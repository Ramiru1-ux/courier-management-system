import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Send } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';

const AVAILABLE_EVENTS = ['shipment.created', 'shipment.picked_up', 'shipment.in_transit', 'shipment.out_for_delivery', 'shipment.delivered', 'shipment.failed', 'shipment.returned', 'payment.completed'];

export default function WebhooksPage() {
  const { webhooks, addWebhook, toggleWebhookStatus, testWebhook } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ url: '', events: [] });
  const [testing, setTesting] = useState('');

  const toggleEvent = (evt) => {
    setForm((prev) => ({ ...prev, events: prev.events.includes(evt) ? prev.events.filter((e) => e !== evt) : [...prev.events, evt] }));
  };

  const handleAdd = (event) => {
    event.preventDefault();
    if (!form.url || form.events.length === 0) return;
    addWebhook(form);
    toast.success('Webhook endpoint added');
    setForm({ url: '', events: [] });
    setOpen(false);
  };

  const handleTest = async (webhook) => {
    setTesting(webhook.id);
    const result = await testWebhook(webhook.id);
    setTesting('');
    if (result.status === 'Delivered') toast.success(`Test event delivered (${result.responseCode})`);
    else toast.error(`Test event failed (${result.responseCode})`);
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Webhooks</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Webhook endpoints</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Push shipment/payment events to external systems (FR-55). No real server is called - "Send test" simulates a delivery attempt.</div>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Add endpoint</Button>
      </div>

      <Table
        columns={[{ key: 'url', label: 'Endpoint' }, { key: 'events', label: 'Events' }, { key: 'status', label: 'Status' }, { key: 'last', label: 'Last delivery' }, { key: 'actions', label: '' }]}
        data={webhooks}
        rowKey="id"
        emptyMessage="No webhook endpoints configured."
        renderRow={(w) => (
          <tr key={w.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{w.url}</td>
            <td style={{ fontSize: 11.5, color: '#697086' }}>{w.events.join(', ')}</td>
            <td><StatusBadge status={w.status} tone={w.status === 'Active' ? 'teal' : 'neutral'} /></td>
            <td>{w.lastDelivery ? <StatusBadge status={`${w.lastDelivery.status} (${w.lastDelivery.responseCode})`} tone={w.lastDelivery.status === 'Delivered' ? 'teal' : 'coral'} /> : <span style={{ fontSize: 11.5, color: '#9AA1B4' }}>Never tested</span>}</td>
            <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <Button size="small" variant="secondary" icon={Send} loading={testing === w.id} onClick={() => handleTest(w)}>Send test</Button>
              <Button size="small" variant="secondary" onClick={() => toggleWebhookStatus(w.id)}>{w.status === 'Active' ? 'Disable' : 'Enable'}</Button>
            </td>
          </tr>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add webhook endpoint" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleAdd} disabled={form.events.length === 0}>Add endpoint</Button></>}>
        <form onSubmit={handleAdd}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Endpoint URL</label>
          <input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://example.com/webhooks/egotechworld" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, marginBottom: 16 }} />
          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 8 }}>Events</label>
          <div style={{ display: 'grid', gap: 6 }}>
            {AVAILABLE_EVENTS.map((evt) => (
              <label key={evt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                <input type="checkbox" checked={form.events.includes(evt)} onChange={() => toggleEvent(evt)} />
                <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{evt}</span>
              </label>
            ))}
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
