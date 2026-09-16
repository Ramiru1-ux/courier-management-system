import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Truck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import useStore from '../../hooks/useStore';
import { statusLabel, statusTone } from '../../utils/shipmentStatus';

export default function PendingDeliveriesPage() {
  const { shipments, drivers, assignDriver } = useStore();
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);
  const [driverChoice, setDriverChoice] = useState('');

  const pending = useMemo(() => {
    const list = shipments.filter((s) => !s.driverId && ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH'].includes(s.status));
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) => [s.trackingNumber, s.recipientName, s.recipientCity].join(' ').toLowerCase().includes(term));
  }, [shipments, query]);

  const availableDrivers = drivers.filter((d) => d.status !== 'Delivering');

  const openAssign = (shipment) => {
    setTarget(shipment);
    setDriverChoice('');
  };

  const handleAssign = () => {
    if (!target || !driverChoice) return;
    assignDriver(target.id, driverChoice);
    toast.success(`${target.trackingNumber} assigned and dispatched`);
    setTarget(null);
  };

  const columns = [
    { key: 'tracking', label: 'Tracking' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'destination', label: 'Destination' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Pending deliveries</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Pending deliveries</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Prepare unassigned shipments for the next delivery run.</div>
      </div>

      <div style={{ maxWidth: 380, marginBottom: 16 }}>
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search shipment or recipient..." />
      </div>

      {pending.length === 0 ? (
        <EmptyState title="Nothing pending" description="All shipments have been assigned a driver." />
      ) : (
        <Table
          columns={columns}
          data={pending}
          rowKey="id"
          renderRow={(s) => (
            <tr key={s.id}>
              <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{s.trackingNumber}</td>
              <td>{s.recipientName}</td>
              <td>{s.recipientCity}</td>
              <td><StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} /></td>
              <td style={{ textAlign: 'right' }}>
                <Button size="small" variant="accent" icon={Truck} onClick={() => openAssign(s)}>Assign</Button>
              </td>
            </tr>
          )}
        />
      )}

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Assign a driver"
        description={target ? `Choose an available driver for ${target.trackingNumber}.` : ''}
        footer={<><Button variant="secondary" onClick={() => setTarget(null)}>Cancel</Button><Button variant="primary" onClick={handleAssign} disabled={!driverChoice}>Assign & dispatch</Button></>}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          {availableDrivers.length === 0 && <div style={{ color: '#697086', fontSize: 13 }}>No drivers are currently available.</div>}
          {availableDrivers.map((d) => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1.5px solid ${driverChoice === d.id ? '#F5A524' : '#E3E7EF'}`, borderRadius: 10, cursor: 'pointer' }}>
              <input type="radio" name="driver" value={d.id} checked={driverChoice === d.id} onChange={() => setDriverChoice(d.id)} />
              <span>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#12213F' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: '#9AA1B4' }}>{d.branch} · {d.vehicle} · {d.status}</div>
              </span>
            </label>
          ))}
        </div>
      </Modal>
    </PortalLayout>
  );
}
