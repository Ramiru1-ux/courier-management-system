import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * Real QR code generation (the `qrcode` npm package - MIT licensed,
 * actively maintained, no runtime dependencies) for one shipment's public
 * tracking link. Deliberately encodes a link to the PUBLIC tracking page
 * with the tracking number, never the shipment's internal MongoDB _id or
 * blob `id` - the exact same safe field the public /api/tracking endpoint
 * already exposes, so a QR code can never leak anything the public
 * tracking page itself wouldn't already show.
 */
export default function ShipmentQrCode({ trackingNumber, size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !trackingNumber) return;
    const url = `${window.location.origin}/track?tn=${encodeURIComponent(trackingNumber)}`;
    QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 1, color: { dark: '#12213F', light: '#FFFFFF' } }, () => {});
  }, [trackingNumber, size]);

  if (!trackingNumber) return null;
  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 8, border: '1px solid #E3E7EF' }} />;
}
