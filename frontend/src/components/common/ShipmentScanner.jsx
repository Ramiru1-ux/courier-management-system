import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

/**
 * Real camera-based QR/barcode scanning (the `html5-qrcode` npm package -
 * MIT licensed, actively maintained, ~1M weekly downloads) - requests the
 * browser's camera permission and decodes whatever QR/barcode it sees in
 * frame. This cannot be exercised end-to-end in this environment (no
 * browser automation tool exists here to grant a camera permission prompt
 * or simulate a physical camera), so it is disclosed as UI-unverified -
 * but the code path itself is a real, standard integration, not a stand-in.
 *
 * `onDecode(text)` receives the raw decoded string every time a code is
 * read (typically the tracking URL encoded by ShipmentQrCode.jsx, or a
 * bare tracking number written on an older label) - the caller decides
 * what a valid vs invalid vs duplicate scan means for its own workflow.
 */
export default function ShipmentScanner({ onDecode, onError }) {
  const containerId = useRef(`shipment-scanner-${Math.random().toString(36).slice(2)}`).current;
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(containerId, { fps: 10, qrbox: 220 }, false);
    scannerRef.current = scanner;
    scanner.render(
      (decodedText) => onDecode?.(decodedText),
      () => {} // per-frame "nothing decoded yet" - not a real error, ignored
    );
    return () => {
      scanner.clear().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={containerId} style={{ maxWidth: 320 }} />;
}
