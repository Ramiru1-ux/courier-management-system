// Real, scannable QR code generation for the printable waybill (the
// `qrcode` npm package - MIT licensed, actively maintained). This used to
// render a fake "barcode" here: a deterministic SVG bar pattern derived
// from the tracking number that its own comment admitted was "not a real
// scannable symbology" - it looked like a barcode but decoded to nothing.
// The QR code below encodes an actual link to the public tracking page and
// can be scanned by any real phone camera or QR reader.
import QRCode from 'qrcode';

export async function buildWaybillHtml(shipment) {
  const trackingUrl = `${window.location.origin}/track?tn=${encodeURIComponent(shipment.trackingNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(trackingUrl, { width: 130, margin: 1, color: { dark: '#12213F', light: '#FFFFFF' } });
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Waybill ${shipment.trackingNumber}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 28px; color: #12213F; }
  .label { max-width: 420px; margin: 0 auto; border: 2px solid #12213F; border-radius: 10px; padding: 20px; }
  .brand { font-weight: 800; font-size: 16px; letter-spacing: .04em; }
  .tag { font-size: 11px; color: #697086; margin-bottom: 14px; }
  .tracking { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 700; margin: 10px 0; text-align: center; }
  .qr-row { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 10px 0 16px; }
  .qr-row img { width: 110px; height: 110px; }
  .qr-hint { font-size: 10px; color: #9AA1B4; max-width: 140px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  td { padding: 6px 0; vertical-align: top; }
  td.label-cell { color: #697086; width: 40%; }
  .section { border-top: 1px dashed #C7CEDA; margin-top: 14px; padding-top: 14px; }
  .cod { text-align: center; font-size: 15px; font-weight: 700; margin-top: 10px; padding: 8px; background: #FCEFD6; border-radius: 8px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body onload="window.print()">
  <div class="label">
    <div class="brand">EgoTECHWORLD Courier</div>
    <div class="tag">${shipment.serviceType} · ${shipment.branch}</div>
    <div class="tracking">${shipment.trackingNumber}</div>
    <div class="qr-row">
      <img src="${qrDataUrl}" alt="Scan to track this shipment" />
      <div class="qr-hint">Scan to track this shipment online</div>
    </div>
    <table>
      <tr><td class="label-cell">From</td><td>${shipment.senderName}<br/>${shipment.senderAddress}<br/>${shipment.senderPhone}</td></tr>
      <tr><td class="label-cell">To</td><td>${shipment.recipientName}<br/>${shipment.recipientAddress}, ${shipment.recipientCity}<br/>${shipment.recipientPhone}</td></tr>
    </table>
    <div class="section">
      <table>
        <tr><td class="label-cell">Weight</td><td>${shipment.weight} kg</td></tr>
        <tr><td class="label-cell">Service</td><td>${shipment.serviceType}</td></tr>
      </table>
    </div>
    ${shipment.codAmount ? `<div class="cod">COD to collect: Rs ${Number(shipment.codAmount).toLocaleString('en-US')}</div>` : ''}
  </div>
</body>
</html>`;
}

export async function printWaybill(shipment) {
  const win = window.open('', '_blank', 'width=480,height=720');
  if (!win) return false;
  const html = await buildWaybillHtml(shipment);
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}
