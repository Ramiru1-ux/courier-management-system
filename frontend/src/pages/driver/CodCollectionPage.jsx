import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { WalletCards } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { formatLKR } from '../../utils/shipmentStatus';

export default function CodCollectionPage() {
  const { user } = useAuth();
  const { shipments } = useStore();
  const driverId = user?.driverId || 'DRV-01';

  const collected = useMemo(() => shipments.filter((s) => s.driverId === driverId && s.status === 'DELIVERED' && s.codAmount > 0), [shipments, driverId]);
  const total = collected.reduce((sum, s) => sum + s.codAmount, 0);

  const handleSubmitSettlement = () => {
    toast.success(`Daily COD settlement of ${formatLKR(total)} submitted to Finance`);
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Driver / <b style={{ color: '#697086' }}>COD collection</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Daily COD collection</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Cash collected on delivered shipments, ready to submit to Finance.</div>
      </div>

      {collected.length === 0 ? (
        <EmptyState icon={WalletCards} title="Nothing collected yet" description="Delivered shipments with a COD amount will appear here." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
            {collected.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F9FAFC', borderRadius: 10 }}>
                <div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 12.5 }}>{s.trackingNumber}</div>
                  <div style={{ fontSize: 11.5, color: '#697086' }}>{s.recipientName}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#0C8C6B' }}>{formatLKR(s.codAmount)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E3E7EF', paddingTop: 16 }}>
            <div>
              <div style={{ fontSize: 11.5, color: '#697086' }}>Total to submit</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 20, color: '#12213F' }}>{formatLKR(total)}</div>
            </div>
            <Button variant="accent" icon={WalletCards} onClick={handleSubmitSettlement}>Submit settlement</Button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
