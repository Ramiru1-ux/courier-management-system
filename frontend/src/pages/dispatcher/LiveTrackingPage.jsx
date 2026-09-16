import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinned } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import useStore from '../../hooks/useStore';
import { BRANCH_COORDS, SRI_LANKA_CENTER } from '../../utils/branchCoords';

const PIN_COLORS = ['#0EA394', '#3E7BFA', '#EF5B4E', '#F5A524', '#7C6CF0'];

function driverIcon(color, initial) {
  return L.divIcon({
    className: 'driver-marker',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 3px 8px rgba(18,33,63,.35);color:#fff;font-family:Sora,sans-serif;font-weight:700;font-size:12px;">${initial}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

// Leaflet computes its tile grid from the container's pixel size at the
// moment it initializes. When that container sits inside a CSS Grid
// column (like the dispatcher layout here), the column width can still
// be settling on the very first paint, so Leaflet sometimes grabs a
// stale/incorrect size and the tiles render offset or clipped. A
// ResizeObserver on the container keeps calling invalidateSize()
// whenever its real size actually changes, which is more reliable than
// guessing a fixed delay.
function MapSizeFix() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

// FR-24: real GPS ingestion now exists (driver/DriverDashboardPage.jsx's
// "Share my location" toggle sends genuine navigator.geolocation
// coordinates to PUT /api/app-data/drivers/:id/location, persisted onto
// that driver's own cms_drivers document as `liveLocation`). A driver whose
// browser has shared a point in the last 5 minutes shows that REAL
// position; every other active driver still falls back to a bounded random
// walk anchored to their branch, exactly as before - there is no fleet of
// physical devices in this environment to guarantee every driver has one,
// so the fallback stays and each marker is honestly labelled which kind it is.
const LIVE_LOCATION_MAX_AGE_MS = 5 * 60 * 1000;

function realPositionFor(driver) {
  const loc = driver.liveLocation;
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return null;
  const age = Date.now() - new Date(loc.updatedAt || 0).getTime();
  if (!Number.isFinite(age) || age > LIVE_LOCATION_MAX_AGE_MS) return null;
  return [loc.lat, loc.lng];
}

export default function LiveTrackingPage() {
  const { drivers, shipments } = useStore();
  const activeDrivers = useMemo(() => drivers.filter((d) => d.status === 'Delivering'), [drivers]);
  const [positions, setPositions] = useState({});
  const positionsRef = useRef({});

  useEffect(() => {
    setPositions((prev) => {
      const next = { ...prev };
      activeDrivers.forEach((d) => {
        const real = realPositionFor(d);
        if (real) {
          next[d.id] = real;
          return;
        }
        if (!next[d.id]) {
          const base = BRANCH_COORDS[d.branch] || SRI_LANKA_CENTER;
          const jitter = () => (Math.random() - 0.5) * 0.04;
          next[d.id] = [base[0] + jitter(), base[1] + jitter()];
        }
      });
      positionsRef.current = next;
      return next;
    });
  }, [activeDrivers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) => {
        const next = {};
        Object.entries(prev).forEach(([id, [lat, lng]]) => {
          const driver = activeDrivers.find((d) => d.id === id);
          const real = driver && realPositionFor(driver);
          if (real) {
            next[id] = real;
            return;
          }
          const step = 0.003;
          next[id] = [lat + (Math.random() - 0.5) * step, lng + (Math.random() - 0.5) * step];
        });
        positionsRef.current = next;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeDrivers]);

  const activeCount = (driverId) => shipments.filter((s) => s.driverId === driverId).length;
  const mapCenter = activeDrivers.length && positions[activeDrivers[0].id]
    ? positions[activeDrivers[0].id]
    : SRI_LANKA_CENTER;

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Live tracking</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Live driver tracking</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{activeDrivers.length} driver(s) active. A driver marked <b style={{ color: '#0C8C6B' }}>LIVE</b> has shared their real device GPS in the last 5 minutes; everyone else shows a simulated position.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 18 }}>
          <div style={{ height: 460, borderRadius: 12, overflow: 'hidden', border: '1px solid #E3E7EF', position: 'relative' }}>
            <MapContainer center={mapCenter} zoom={activeDrivers.length ? 12 : 8} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapSizeFix />
              {activeDrivers.map((d, index) => {
                const pos = positions[d.id];
                if (!pos) return null;
                const color = PIN_COLORS[index % PIN_COLORS.length];
                const isLive = Boolean(realPositionFor(d));
                return (
                  <Marker key={d.id} position={pos} icon={driverIcon(color, d.name.charAt(0))}>
                    <Popup>
                      <b>{d.name}</b> {isLive ? <span style={{ color: '#0C8C6B', fontWeight: 700 }}>LIVE</span> : <span style={{ color: '#9AA1B4' }}>Simulated</span>}<br />
                      {d.vehicle} &middot; {activeCount(d.id)} active shipment(s)
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            {activeDrivers.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA1B4', fontSize: 13, background: 'rgba(255,255,255,0.85)', pointerEvents: 'none' }}>
                No drivers currently out for delivery.
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPinned size={16} /> Active drivers
          </div>
          {activeDrivers.length === 0 ? (
            <div style={{ color: '#697086', fontSize: 12.5 }}>Nobody is out for delivery right now.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {activeDrivers.map((d, index) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: '#F9FAFC', borderRadius: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIN_COLORS[index % PIN_COLORS.length], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12213F' }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: '#9AA1B4' }}>{d.vehicle} · {d.branch} · {activeCount(d.id)} active shipment(s)</div>
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em', padding: '3px 7px', borderRadius: 99, color: realPositionFor(d) ? '#0C8C6B' : '#9AA1B4', background: realPositionFor(d) ? '#E4F7F4' : '#F0F1F5' }}>{realPositionFor(d) ? 'LIVE' : 'SIMULATED'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
