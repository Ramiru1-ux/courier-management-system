import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Truck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import { statusLabel } from '../../utils/shipmentStatus';

export default function AssignDriverPage() {
  const { shipments, drivers, assignDriver } = useStore();
  const [shipmentId, setShipmentId] = useState('');
  const [driverId, setDriverId] = useState('');

  const assignable = useMemo(() => shipments.filter((s) => !s.driverId && ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH'].includes(s.status)), [shipments]);
  const availableDrivers = useMemo(() => drivers.filter((d) => d.status !== 'Delivering' && d.status !== 'Offline'), [drivers]);

  const selectedShipment = shipments.find((s) => s.id === shipmentId);
  const selectedDriver = drivers.find((d) => d.id === driverId);

  const handleAssign = (event) => {
    event.preventDefault();
    if (!shipmentId || !driverId) return;
    assignDriver(shipmentId, driverId);
    toast.success(`${selectedDriver?.name} assigned to ${selectedShipment?.trackingNumber}`);
    setShipmentId('');
    setDriverId('');
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Assign driver</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Assign driver</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Manually pair a shipment with an available driver.</div>
      </div>

      <form onSubmit={handleAssign} style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 24, maxWidth: 560 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Shipment</label>
          <select value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
            <option value="">Select an unassigned shipment</option>
            {assignable.map((s) => <option key={s.id} value={s.id}>{s.trackingNumber} · {s.recipientName} · {s.recipientCity} ({statusLabel(s.status)})</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Driver</label>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
            <option value="">Select an available driver</option>
            {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.branch} · {d.vehicle} ({d.status})</option>)}
          </select>
        </div>

        {assignable.length === 0 && <div style={{ fontSize: 12.5, color: '#697086', marginBottom: 16 }}>All shipments are currently assigned.</div>}

        <Button type="submit" variant="accent" icon={Truck} disabled={!shipmentId || !driverId}>Assign & dispatch</Button>
      </form>
    </PortalLayout>
  );
}
