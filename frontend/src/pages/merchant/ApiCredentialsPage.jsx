import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';

export default function MerchantApiCredentialsPage() {
  const { user } = useAuth();
  const { apiKeys, generateApiKey, revokeApiKey } = useStore();
  const [reveal, setReveal] = useState({});

  const handleGenerate = () => {
    generateApiKey(`${user?.merchantName || 'Merchant'} - API key`, user?.merchantName);
    toast.success('New API key generated');
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
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>API credentials</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>API credentials</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Use these keys to create shipments from your own store or ERP (FR-54).</div>
        </div>
        <Button variant="accent" icon={KeyRound} onClick={handleGenerate}>Generate new key</Button>
      </div>

      <Table
        columns={[{ key: 'label', label: 'Label' }, { key: 'key', label: 'Key' }, { key: 'status', label: 'Status' }, { key: 'created', label: 'Created' }, { key: 'actions', label: '' }]}
        data={apiKeys}
        rowKey="id"
        emptyMessage="No API keys yet."
        renderRow={(key) => (
          <tr key={key.id}>
            <td>{key.label}</td>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>
              {reveal[key.id] ? key.keyFull : key.keyMasked}
            </td>
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
    </PortalLayout>
  );
}
