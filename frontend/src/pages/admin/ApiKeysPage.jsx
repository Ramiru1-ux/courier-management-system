import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';

export default function ApiKeysPage() {
  const { apiKeys, generateApiKey, revokeApiKey } = useStore();
  const [reveal, setReveal] = useState({});
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');

  const handleGenerate = (event) => {
    event.preventDefault();
    if (!label) return;
    generateApiKey(label);
    toast.success('API key generated');
    setLabel('');
    setOpen(false);
  };

  const handleCopy = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Could not copy - copy it manually');
    }
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>API keys</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>API keys</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>System-wide API credentials issued to merchants and integrations (FR-54, FR-57).</div>
        </div>
        <Button variant="accent" icon={KeyRound} onClick={() => setOpen(true)}>Generate key</Button>
      </div>

      <Table
        columns={[{ key: 'label', label: 'Label' }, { key: 'key', label: 'Key' }, { key: 'status', label: 'Status' }, { key: 'created', label: 'Created' }, { key: 'actions', label: '' }]}
        data={apiKeys}
        rowKey="id"
        emptyMessage="No API keys yet."
        renderRow={(key) => (
          <tr key={key.id}>
            <td>{key.label}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{reveal[key.id] ? key.keyFull : key.keyMasked}</td>
            <td><StatusBadge status={key.status} tone={key.status === 'Active' ? 'teal' : 'neutral'} /></td>
            <td>{key.createdAt}</td>
            <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <Button size="small" variant="secondary" icon={reveal[key.id] ? EyeOff : Eye} onClick={() => setReveal((r) => ({ ...r, [key.id]: !r[key.id] }))} />
              <Button size="small" variant="secondary" icon={Copy} onClick={() => handleCopy(key.keyFull)} />
              {key.status === 'Active' && <Button size="small" variant="danger" icon={Trash2} onClick={() => { revokeApiKey(key.id); toast.success('API key revoked'); }} />}
            </td>
          </tr>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Generate API key" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleGenerate}>Generate</Button></>}>
        <form onSubmit={handleGenerate}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. FreshCart - production" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
        </form>
      </Modal>
    </PortalLayout>
  );
}
