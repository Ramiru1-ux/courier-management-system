import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPinned, Truck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useStore from '../../hooks/useStore';

export default function RouteOptimizerPage() {
  const { shipments, drivers, assignDriver } = useStore();
  const [selectedDrivers, setSelectedDrivers] = useState({});

  const groups = useMemo(() => {
    const pending = shipments.filter((s) => !s.driverId && ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH'].includes(s.status));
    const byCity = {};
    pending.forEach((s) => {
      byCity[s.recipientCity] = byCity[s.recipientCity] || [];
      byCity[s.recipientCity].push(s);
    });
    return Object.entries(byCity).map(([city, items]) => ({ city, items }));
  }, [shipments]);

  const availableDrivers = drivers.filter((d) => d.status !== 'Delivering');

  const handleDispatch = (group) => {
    const driverId = selectedDrivers[group.city];
    if (!driverId) return;
    group.items.forEach((shipment) => assignDriver(shipment.id, driverId));
    const driver = drivers.find((d) => d.id === driverId);
    toast.success(`Route to ${group.city} dispatched to ${driver?.name} (${group.items.length} stops)`);
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Route optimizer</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Route optimizer</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Unassigned shipments grouped by destination city, ready to dispatch as one route.</div>
      </div>

      {groups.length === 0 ? (
        <EmptyState title="No routes to plan" description="Every shipment already has a driver assigned." icon={MapPinned} />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {groups.map((group) => (
            <div key={group.city} style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: '#12213F' }}>{group.city}</div>
                  <div style={{ fontSize: 12, color: '#9AA1B4' }}>{group.items.length} stop{group.items.length > 1 ? 's' : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={selectedDrivers[group.city] || ''}
                    onChange={(e) => setSelectedDrivers((prev) => ({ ...prev, [group.city]: e.target.value }))}
                    style={{ border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '9px 11px', fontSize: 12.5 }}
                  >
                    <option value="">Choose driver</option>
                    {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.branch})</option>)}
                  </select>
                  <Button size="small" variant="accent" icon={Truck} onClick={() => handleDispatch(group)} disabled={!selectedDrivers[group.city]}>Dispatch route</Button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {group.items.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#F9FAFC', borderRadius: 9, fontSize: 12.5 }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{s.trackingNumber}</span>
                    <span style={{ color: '#697086' }}>{s.recipientName} · {s.recipientAddress}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
