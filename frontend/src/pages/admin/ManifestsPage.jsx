import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Truck, Check } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';

export default function ManifestsPage() {
  const { manifests, shipments, branches, vehicles, createManifest, advanceManifest } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ originBranch: branches[0]?.name || '', destinationBranch: branches[1]?.name || '', vehicle: '', driver: '', shipmentIds: [] });

  const eligibleShipments = shipments.filter((s) => ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH'].includes(s.status));

  const toggleShipment = (trackingNumber) => {
    setForm((prev) => ({
      ...prev,
      shipmentIds: prev.shipmentIds.includes(trackingNumber)
        ? prev.shipmentIds.filter((id) => id !== trackingNumber)
        : [...prev.shipmentIds, trackingNumber],
    }));
  };

  const handleCreate = (event) => {
    event.preventDefault();
    if (!form.originBranch || !form.destinationBranch || form.shipmentIds.length === 0) return;
    createManifest(form);
    toast.success(`Manifest created with ${form.shipmentIds.length} shipment(s)`);
    setForm({ originBranch: branches[0]?.name || '', destinationBranch: branches[1]?.name || '', vehicle: '', driver: '', shipmentIds: [] });
    setOpen(false);
  };

  const handleAdvance = (manifest) => {
    const next = manifest.status === 'Preparing' ? 'In Transit' : manifest.status === 'In Transit' ? 'Arrived' : 'Arrived';
    advanceManifest(manifest.id, next);
    toast.success(`${manifest.id} marked ${next}`);
  };

  const columns = [
    { key: 'id', label: 'Manifest' },
    { key: 'route', label: 'Route' },
    { key: 'vehicle', label: 'Vehicle / Driver' },
    { key: 'shipments', label: 'Shipments' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Manifests</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Branch transfer manifests</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Group shipments moving between branches into one manifest.</div>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Create manifest</Button>
      </div>

      <Table
        columns={columns}
        data={manifests}
        rowKey="id"
        emptyMessage="No manifests yet."
        renderRow={(manifest) => (
          <tr key={manifest.id}>
            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{manifest.id}</td>
            <td>{manifest.originBranch} → {manifest.destinationBranch}</td>
            <td>{manifest.vehicle} · {manifest.driver}</td>
            <td>{manifest.shipmentIds.length}</td>
            <td><StatusBadge status={manifest.status} tone={manifest.status === 'Arrived' ? 'teal' : manifest.status === 'In Transit' ? 'amber' : 'neutral'} /></td>
            <td style={{ textAlign: 'right' }}>
              {manifest.status !== 'Arrived' && (
                <Button size="small" variant="primary" icon={manifest.status === 'Preparing' ? Truck : Check} onClick={() => handleAdvance(manifest)}>
                  {manifest.status === 'Preparing' ? 'Depart' : 'Mark arrived'}
                </Button>
              )}
            </td>
          </tr>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create manifest"
        description="Group shipments for transfer between branches."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleCreate} disabled={form.shipmentIds.length === 0}>Create manifest</Button></>}
      >
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Origin branch</label>
              <select value={form.originBranch} onChange={(e) => setForm((p) => ({ ...p, originBranch: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
                {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Destination branch</label>
              <select value={form.destinationBranch} onChange={(e) => setForm((p) => ({ ...p, destinationBranch: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
                {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Vehicle</label>
            <select value={form.vehicle} onChange={(e) => setForm((p) => ({ ...p, vehicle: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option value="">Select vehicle</option>
              {vehicles.filter((v) => v.status === 'Active').map((v) => <option key={v.id} value={v.registrationNumber}>{v.registrationNumber} ({v.model})</option>)}
            </select>
          </div>

          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Driver</label><input value={form.driver} onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))} placeholder="Driver name" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Shipments to include</label>
            <div style={{ display: 'grid', gap: 6, maxHeight: 180, overflowY: 'auto', border: '1px solid #E3E7EF', borderRadius: 9, padding: 8 }}>
              {eligibleShipments.length === 0 && <div style={{ color: '#697086', fontSize: 12.5 }}>No shipments available to manifest right now.</div>}
              {eligibleShipments.map((s) => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, padding: '6px 8px', borderRadius: 7, background: form.shipmentIds.includes(s.trackingNumber) ? '#FCEFD6' : 'transparent' }}>
                  <input type="checkbox" checked={form.shipmentIds.includes(s.trackingNumber)} onChange={() => toggleShipment(s.trackingNumber)} />
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{s.trackingNumber}</span>
                  <span style={{ color: '#697086' }}>{s.recipientCity}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
