import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import SignaturePad from '../../components/pod/SignaturePad';
import PhotoCapture from '../../components/pod/PhotoCapture';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { uploadPodPhoto } from '../../api/uploadsApi';
import { getPodFileError } from '../../utils/uploadValidation';

export default function PodCapturePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shipments, capturePOD } = useStore();
  const driverId = user?.driverId || 'DRV-01';

  const pending = useMemo(() => shipments.filter((s) => s.driverId === driverId && s.status === 'OUT_FOR_DELIVERY'), [shipments, driverId]);
  const [shipmentId, setShipmentId] = useState('');
  const [signature, setSignature] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!shipmentId && pending.length) setShipmentId(pending[0].id);
  }, [pending, shipmentId]);

  const shipment = shipments.find((s) => s.id === shipmentId);

  const handleSubmit = async () => {
    if (!shipment) return;
    if (!signature) {
      toast.error('Recipient signature is required');
      return;
    }
    // PhotoCapture refuses anything that breaks the rules before it ever
    // reaches this state, so this is the safety net for a file that got in
    // another way (a restored form state, a programmatic change) - the
    // server checks it again regardless.
    const fileError = getPodFileError(photoFile);
    if (fileError) {
      toast.error(fileError);
      return;
    }
    setSubmitting(true);
    try {
      // Uploads the actual photo file to the backend (real disk storage,
      // see backend/routes/uploadsRoutes.js) and stores its server URL -
      // previously this only saved photoFile.name (a filename string),
      // never the real image data.
      const photoDataUrl = photoFile ? (await uploadPodPhoto(photoFile)).url : null;
      capturePOD(shipment.id, {
        signatureDataUrl: signature,
        photoDataUrl,
        recipientName: shipment.recipientName,
        notes,
      });
      toast.success(`${shipment.trackingNumber} marked delivered with proof of delivery`);
      navigate('/driver/deliveries');
    } catch (error) {
      toast.error(error.message || 'Could not upload the delivery photo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Driver / <b style={{ color: '#697086' }}>Proof of delivery</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Capture proof of delivery</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Signature and photo for the current delivery.</div>
      </div>

      {pending.length === 0 ? (
        <EmptyState title="No deliveries ready for POD" description="You have no shipments currently out for delivery." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 24, maxWidth: 640 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Shipment</label>
          <select value={shipmentId} onChange={(e) => { setShipmentId(e.target.value); setSignature(''); setPhotoFile(null); }} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, marginBottom: 18 }}>
            {pending.map((s) => <option key={s.id} value={s.id}>{s.trackingNumber} · {s.recipientName}</option>)}
          </select>

          {shipment && (
            <>
              <div style={{ fontSize: 12.5, color: '#697086', marginBottom: 18 }}>
                Delivering to <b style={{ color: '#12213F' }}>{shipment.recipientName}</b> at {shipment.recipientAddress}, {shipment.recipientCity}
                {shipment.codAmount ? <> · COD due: <b style={{ color: '#12213F' }}>Rs {shipment.codAmount.toLocaleString('en-US')}</b></> : null}
              </div>

              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Recipient signature</label>
              <div style={{ marginBottom: 18 }}><SignaturePad onChange={setSignature} /></div>

              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Delivery photograph <span style={{ fontWeight: 500, color: '#9AA1B4' }}>- JPEG, PNG or PDF, up to 10MB</span></label>
              <div style={{ marginBottom: 18, maxWidth: 280 }}><PhotoCapture onChange={setPhotoFile} onError={(message) => toast.error(message)} /></div>

              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Delivery notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, marginBottom: 18, fontFamily: 'inherit' }} />

              <Button variant="accent" icon={CheckCircle2} onClick={handleSubmit} disabled={submitting}>{submitting ? 'Uploading proof of delivery...' : 'Confirm delivery'}</Button>
            </>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
