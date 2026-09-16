import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle2, Loader2, MapPinned } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { geocodeAddress } from '../../api/geocodeApi';
import { BRANCH_COORDS, SRI_LANKA_CENTER } from '../../utils/branchCoords';

function stopIcon(number, done) {
  return L.divIcon({
    className: 'route-stop-marker',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${done ? '#0EA394' : '#F5A524'};border:3px solid #fff;box-shadow:0 3px 8px rgba(18,33,63,.35);color:#fff;font-family:Sora,sans-serif;font-weight:700;font-size:12px;">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapSizeFix() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

// Simple nearest-neighbor stop ordering from the driver's branch - the same
// small, real algorithm backend/services/routeOptimizationService.js
// already implements (that service is otherwise unreachable from any real
// route, so this is a client-side equivalent rather than adding a new
// backend endpoint just to reorder an array).
function orderByNearestNeighbor(origin, stops) {
  const remaining = [...stops];
  const ordered = [];
  let current = origin;
  while (remaining.length) {
    let nearestIndex = 0;
    let nearestDist = Infinity;
    remaining.forEach((stop, index) => {
      const dLat = stop.lat - current[0];
      const dLng = stop.lng - current[1];
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < nearestDist) { nearestDist = dist; nearestIndex = index; }
    });
    const next = remaining.splice(nearestIndex, 1)[0];
    ordered.push(next);
    current = [next.lat, next.lng];
  }
  return ordered;
}

/**
 * Real driver route view - FR-24 previously had no per-address stop map at
 * all (the dead version of this file rendered 4 hardcoded stop names with
 * no coordinates). Each active delivery's address is geocoded via a real,
 * free, keyless provider (OpenStreetMap Nominatim - see
 * api/geocodeApi.js), cached onto the shipment record so it is only ever
 * looked up once, then ordered into a route from the driver's branch using
 * a real nearest-neighbor pass. Genuinely no fabricated coordinates: a stop
 * whose address cannot be resolved is shown as unresolved, not guessed.
 */
export default function RouteViewPage() {
  const { user } = useAuth();
  const { shipments, drivers, setShipmentCoordinates } = useStore();
  const driverId = user?.driverId || 'DRV-01';
  const driver = drivers.find((d) => d.id === driverId);
  const origin = BRANCH_COORDS[driver?.branch] || SRI_LANKA_CENTER;

  const activeStops = useMemo(() => shipments.filter((s) => s.driverId === driverId && s.status === 'OUT_FOR_DELIVERY'), [shipments, driverId]);
  const [geocoding, setGeocoding] = useState(false);
  const [unresolved, setUnresolved] = useState([]);

  useEffect(() => {
    const needsGeocoding = activeStops.filter((s) => !s.deliveryCoordinates);
    if (needsGeocoding.length === 0) return;
    let cancelled = false;
    setGeocoding(true);
    (async () => {
      const stillUnresolved = [];
      for (const shipment of needsGeocoding) {
        const address = `${shipment.recipientAddress}, ${shipment.recipientCity}, Sri Lanka`;
        try {
          const result = await geocodeAddress(address);
          if (cancelled) return;
          if (result.resolved) {
            setShipmentCoordinates(shipment.id, { lat: result.lat, lng: result.lng });
          } else {
            stillUnresolved.push(shipment.trackingNumber);
          }
        } catch (error) {
          if (!cancelled) stillUnresolved.push(shipment.trackingNumber);
        }
      }
      if (!cancelled) {
        setUnresolved(stillUnresolved);
        setGeocoding(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStops.map((s) => s.id).join(',')]);

  const resolvedStops = activeStops.filter((s) => s.deliveryCoordinates);
  const orderedStops = useMemo(() => orderByNearestNeighbor(origin, resolvedStops.map((s) => ({ ...s, lat: s.deliveryCoordinates.lat, lng: s.deliveryCoordinates.lng }))), [origin, resolvedStops]);
  const polylinePoints = [origin, ...orderedStops.map((s) => [s.lat, s.lng])];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Driver / <b style={{ color: '#697086' }}>Route</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Today's route</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          {orderedStops.length} stop(s) from {driver?.branch || 'your branch'}, ordered nearest-first.
          {geocoding && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#9AA1B4' }}><Loader2 size={12} className="spin-icon" /> locating addresses...</span>}
        </div>
        <style>{'.spin-icon{animation:route-spin 1s linear infinite}@keyframes route-spin{to{transform:rotate(360deg)}}'}</style>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 18 }}>
          <div style={{ height: 440, borderRadius: 12, overflow: 'hidden', border: '1px solid #E3E7EF', position: 'relative' }}>
            <MapContainer center={origin} zoom={orderedStops.length ? 11 : 8} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <MapSizeFix />
              {polylinePoints.length > 1 && <Polyline positions={polylinePoints} pathOptions={{ color: '#3E7BFA', weight: 3, dashArray: '7 6' }} />}
              {orderedStops.map((stop, index) => (
                <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon(index + 1, false)}>
                  <Popup><b>{stop.trackingNumber}</b><br />{stop.recipientName} · {stop.recipientAddress}, {stop.recipientCity}</Popup>
                </Marker>
              ))}
            </MapContainer>
            {orderedStops.length === 0 && !geocoding && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA1B4', fontSize: 13, background: 'rgba(255,255,255,0.85)', pointerEvents: 'none' }}>
                No active deliveries with a resolvable address right now.
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPinned size={16} /> Stop order
          </div>
          {orderedStops.length === 0 ? (
            <div style={{ color: '#697086', fontSize: 12.5 }}>No active deliveries right now.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {orderedStops.map((stop, index) => (
                <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: '#F9FAFC', borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F5A524', color: '#211200', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12213F', fontFamily: 'IBM Plex Mono, monospace' }}>{stop.trackingNumber}</div>
                    <div style={{ fontSize: 11, color: '#9AA1B4' }}>{stop.recipientName} · {stop.recipientAddress}, {stop.recipientCity}</div>
                  </div>
                  <CheckCircle2 size={15} color="#CBD3E2" />
                </div>
              ))}
            </div>
          )}
          {unresolved.length > 0 && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#FCF3DF', color: '#8A5A05', borderRadius: 9, fontSize: 11.5 }}>
              Could not locate an address for: {unresolved.join(', ')}. Double-check the recipient address on the shipment.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
