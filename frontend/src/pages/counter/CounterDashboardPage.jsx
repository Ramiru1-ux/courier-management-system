import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PackagePlus, PackageSearch, ScanLine, Search } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ShipmentScanner from '../../components/common/ShipmentScanner';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';

/** A QR code from ShipmentQrCode.jsx encodes a full tracking URL
 * (.../track?tn=XYZ); an older printed label might just have the bare
 * tracking number. Handles both without assuming which one was scanned. */
function extractTrackingNumber(decodedText) {
  try {
    const url = new URL(decodedText);
    const tn = url.searchParams.get('tn');
    if (tn) return tn;
  } catch (error) {
    // Not a URL - fall through and treat the raw text as the tracking number.
  }
  return decodedText.trim();
}

/**
 * Real counter-staff dashboard. Counter staff share the same branch-scoped
 * shipments view as Branch Manager (see SCOPED_OWNERSHIP.shipments in
 * roleScope.js - both are scoped by user.branchName), but get none of the
 * driver-visibility or reporting a branch manager has - their job is
 * intake and front-desk processing: creating new shipments (the existing,
 * already-real shipments/CreateShipmentPage.jsx, now also reachable by this
 * role) and looking up/processing what is already at the counter.
 */
export default function CounterDashboardPage() {
  const { user } = useAuth();
  const { shipments } = useStore();
  const navigate = useNavigate();
  const [scannerOpen, setScannerOpen] = useState(false);
  const lastScanRef = useRef({ text: '', at: 0 });

  const awaitingProcessing = shipments.filter((s) => s.status === 'CREATED');
  const atBranch = shipments.filter((s) => s.status === 'AT_ORIGIN_BRANCH');

  // Real backend-validated lookup: `shipments` here is already the
  // counter's own branch-scoped, server-verified list (see
  // SCOPED_OWNERSHIP.shipments in roleScope.js) - a scanned code for a
  // shipment at a DIFFERENT branch simply will not be in this array, which
  // naturally handles "wrong branch" the same way as "invalid/unknown
  // code" (both correctly report not found, never a fabricated match).
  const handleDecode = (decodedText) => {
    const now = Date.now();
    // html5-qrcode fires its success callback repeatedly while the same
    // code stays in frame (several times per second) - ignore repeats of
    // the identical value within 3s so one physical scan doesn't fire
    // this handler (and the toast/navigation it causes) a dozen times.
    if (decodedText === lastScanRef.current.text && now - lastScanRef.current.at < 3000) return;
    lastScanRef.current = { text: decodedText, at: now };

    const trackingNumber = extractTrackingNumber(decodedText);
    const match = shipments.find((s) => s.trackingNumber === trackingNumber);
    if (!match) {
      toast.error(`No shipment "${trackingNumber}" found at this branch.`);
      return;
    }
    setScannerOpen(false);
    toast.success(`Found ${match.trackingNumber}`);
    navigate(`/shipments/${match.id}`);
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Counter / <b style={{ color: '#697086' }}>Dashboard</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>{user?.branch || 'Counter'}</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Front-desk intake and processing for this branch.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Awaiting processing" value={awaitingProcessing.length} delta="Just created" icon={PackageSearch} iconBg="#FCEFD6" iconColor="#8A5A05" />
        <KpiCard label="At this branch" value={atBranch.length} delta="Ready for the next step" icon={PackageSearch} iconBg="#E8EFFE" iconColor="#2453B8" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/shipments/new"><Button variant="accent" icon={PackagePlus}>Create shipment</Button></Link>
        <Link to="/shipments"><Button variant="secondary" icon={Search}>Look up / process a shipment</Button></Link>
        <Button variant="secondary" icon={ScanLine} onClick={() => setScannerOpen(true)}>Scan shipment QR code</Button>
      </div>

      <Modal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Scan a shipment label"
        description="Point the camera at a shipment's QR code to open it."
      >
        {scannerOpen && <ShipmentScanner onDecode={handleDecode} />}
      </Modal>
    </PortalLayout>
  );
}
