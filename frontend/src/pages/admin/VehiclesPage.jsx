import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Wrench } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useStore from '../../hooks/useStore';

const emptyForm = { registrationNumber: '', type: 'Motorbike', model: '', capacity: '', fuelType: 'Petrol', insuranceExpiry: '', driver: '' };

export default function VehiclesPage() {
  const { vehicles, drivers, addVehicle, setVehicleStatus, removeVehicle } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleCreate = (event) => {
    event.preventDefault();
    if (!form.registrationNumber || !form.model) return;
    addVehicle(form);
    toast.success(`Vehicle ${form.registrationNumber} added`);
    setForm(emptyForm);
    setOpen(false);
  };

  const handleToggleMaintenance = (vehicle) => {
    const next = vehicle.status === 'Maintenance' ? 'Active' : 'Maintenance';
    setVehicleStatus(vehicle.id, next);
    toast.success(`${vehicle.registrationNumber} set to ${next.toLowerCase()}`);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    removeVehicle(pendingDelete.id);
    toast.success(`${pendingDelete.registrationNumber} deleted`);
    setPendingDelete(null);
  };

  const columns = [
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'model', label: 'Model' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'driver', label: 'Assigned driver' },
    { key: 'insurance', label: 'Insurance expiry' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Vehicles</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Fleet management</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{vehicles.length} vehicles across all branches.</div>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Add vehicle</Button>
      </div>

      <Table
        columns={columns}
        data={vehicles}
        rowKey="id"
        emptyMessage="No vehicles registered."
        renderRow={(vehicle) => (
          <tr key={vehicle.id}>
            <td>
              <div style={{ fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', color: '#12213F' }}>{vehicle.registrationNumber}</div>
              <div style={{ fontSize: 11, color: '#9AA1B4' }}>{vehicle.type} · {vehicle.fuelType}</div>
            </td>
            <td>{vehicle.model}</td>
            <td>{vehicle.capacity}</td>
            <td>{vehicle.driver || drivers.find((driver) => driver.vehicle === vehicle.registrationNumber)?.name || 'Unassigned'}</td>
            <td>{vehicle.insuranceExpiry}</td>
            <td><StatusBadge status={vehicle.status} tone={vehicle.status === 'Active' ? 'teal' : vehicle.status === 'Maintenance' ? 'amber' : 'neutral'} /></td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button size="small" variant="secondary" icon={Wrench} onClick={() => handleToggleMaintenance(vehicle)}>
                  {vehicle.status === 'Maintenance' ? 'Return to service' : 'Send for service'}
                </Button>
                <Button size="small" variant="danger" icon={Trash2} aria-label={`Delete ${vehicle.registrationNumber}`} onClick={() => setPendingDelete(vehicle)} />
              </div>
            </td>
          </tr>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add vehicle"
        description="Register a new vehicle to the fleet."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleCreate}>Add vehicle</Button></>}
      >
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Registration number</label><input value={form.registrationNumber} onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value }))} placeholder="LK-6612" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Type</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option>Motorbike</option>
              <option>Three-wheeler</option>
              <option>Van</option>
              <option>Truck</option>
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Model</label><input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} placeholder="Honda Dio" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Capacity</label><input value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} placeholder="20 kg" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Insurance expiry</label><input value={form.insuranceExpiry} onChange={(e) => setForm((p) => ({ ...p, insuranceExpiry: e.target.value }))} placeholder="15 Dec 2026" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Assigned driver (optional)</label><input value={form.driver} onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))} placeholder="Driver name" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete vehicle"
        message={pendingDelete ? `Delete ${pendingDelete.registrationNumber}? The vehicle will be removed from fleet records and unassigned from its driver.` : ''}
        confirmLabel="Delete vehicle"
        danger
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </PortalLayout>
  );
}
