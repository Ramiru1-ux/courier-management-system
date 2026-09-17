import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle2, MapPin, Truck, WalletCards } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { updateDriverLocation, updateDriverAvailability } from '../../api/appDataApi';
import { statusLabel, statusTone, formatLKR } from '../../utils/shipmentStatus';

// A minimum gap between real device GPS updates sent to the backend - a
// real phone's watchPosition can fire every second or two, and the server
// only ever keeps the single latest point anyway (see
// updateDriverLocation() in appDataController.js), so there is nothing to
// gain from sending every callback and it needlessly spends the endpoint's
// own rate limit (30/min - see routes/appDataRoutes.js).
const MIN_LOCATION_SEND_INTERVAL_MS = 15000;

const AVAILABILITY_OPTIONS = [
  { value: 'Available', label: 'AVAILABLE' },
  { value: 'Delivering', label: 'DELIVERY' },
  { value: 'Offline', label: 'OFFLINE' },
];

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const { shipments, drivers, reloadStore, storeStatus } = useStore();
  // A driver's login record does not reliably point at their record in the
  // drivers list: only the original seed accounts carry a `driverId` at all,
  // and those stored ids can be stale (pointing at a driver record that was
  // since replaced), which is exactly why the server resolves the record by
  // id FIRST and then falls back to a case-insensitive email match - see
  // resolveDriverBlobId() in backend/utils/roleScope.js. Matching on
  // `user.driverId` alone (with a hardcoded 'DRV-01' fallback) therefore left
  // `driver` undefined for those accounts, and every availability click below
  // then hit the `if (!driver?.id) return` guard and silently did nothing.
  // Resolved the same three ways the server does - and because the driver
  // scope returns exactly one driver record, their own
  // (scopeSnapshotForRead() in roleScope.js), a single-record list is itself a
  // reliable last resort.
  const driver = useMemo(() => {
    const byId = user?.driverId && drivers.find((d) => d.id === user.driverId);
    if (byId) return byId;
    const email = String(user?.email || '').toLowerCase();
    const byEmail = email && drivers.find((d) => String(d.email || '').toLowerCase() === email);
    if (byEmail) return byEmail;
    return drivers.length === 1 ? drivers[0] : null;
  }, [drivers, user]);
  const driverId = driver?.id || user?.driverId || 'DRV-01';
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Real browser Geolocation API (FR-24 previously had no real GPS
  // ingestion path at all - see dispatcher/LiveTrackingPage.jsx, which only
  // ever rendered a random-walk simulation). This requires an actual
  // browser prompting for and granting location permission on a real
  // device to verify end to end - that part cannot be exercised in this
  // environment (no browser automation available), but the code path
  // itself is real: a genuine navigator.geolocation.watchPosition() feed,
  // sent to a real, authenticated, ownership-checked backend endpoint.
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const watchIdRef = useRef(null);
  const lastSentAtRef = useRef(0);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    setSharingLocation(false);
  }, []);

  useEffect(() => () => stopSharing(), [stopSharing]);

  const startSharing = () => {
    if (!driver?.id) {
      setLocationError('Your driver record could not be identified - ask an admin to link your account.');
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('This browser does not support location sharing.');
      return;
    }
    setLocationError('');
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        if (now - lastSentAtRef.current < MIN_LOCATION_SEND_INTERVAL_MS) return;
        lastSentAtRef.current = now;
        try {
          await updateDriverLocation(driver.id, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        } catch (error) {
          setLocationError(error.message || 'Could not share your location.');
        }
      },
      (error) => {
        setLocationError(error.message || 'Location permission was denied.');
        stopSharing();
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    setSharingLocation(true);
    toast.success('Sharing your live location with dispatch');
  };

  const mine = useMemo(() => shipments.filter((s) => s.driverId === driverId), [shipments, driverId]);
  const active = mine.filter((s) => s.status === 'OUT_FOR_DELIVERY');
  const deliveredToday = mine.filter((s) => s.status === 'DELIVERED').length;
  const codTotal = active.reduce((sum, s) => sum + (s.codAmount || 0), 0);

  // All three states are the driver's own to set. The system still keeps
  // "Delivering" up to date on its own from the real active-shipment count
  // (reconcileDriverAvailability() in appDataController.js, assignDriver() /
  // capturePOD() in StoreContext.js), but a state the driver picks here now
  // wins over that until their delivery list actually changes - previously
  // "Delivering" was not selectable at all and the server refused (409) any
  // manual Available/Offline while a delivery was open, so with any active
  // work every button on this card was disabled at once.
  const hasActiveWork = active.length > 0;
  const currentStatus = driver?.status || 'Offline';
  // A driver login can exist with no driver record behind it at all: the
  // record it pointed at was deleted, or the account predates the linkage
  // admin/DriversPage.jsx now sets up on creation. The server then scopes
  // this driver to an empty drivers list, so there is nothing whose
  // availability could be changed - said plainly on the card below rather
  // than only as a toast once they click, since the fix is an admin action,
  // not something the driver can do from here. Only once the store has
  // actually loaded, so it never flashes up during the initial fetch.
  const missingDriverRecord = !driver && storeStatus !== 'loading';
  const handleSetAvailability = async (value) => {
    if (!driver?.id) {
      toast.error('Your driver record could not be identified - ask an admin to link your account.');
      return;
    }
    if (savingAvailability || value === currentStatus) return;
    setSavingAvailability(true);
    try {
      await updateDriverAvailability(driver.id, value);
      await reloadStore();
      toast.success(`You are now ${value}`);
    } catch (error) {
      toast.error(error.data?.message || error.message || 'Could not update availability.');
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Driver / <b style={{ color: '#697086' }}>Dashboard</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Good day, {driver?.name || user?.name}</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{driver?.vehicle} · {driver?.branch}</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={18} color={sharingLocation ? '#0C8C6B' : '#9AA1B4'} />
          <div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13.5, color: '#12213F' }}>Live location sharing</div>
            <div style={{ fontSize: 11.5, color: '#697086', marginTop: 2 }}>
              {sharingLocation ? 'Dispatch can see your real position while this is on.' : 'Off - dispatch sees a simulated position until you turn this on.'}
              {locationError && <span style={{ color: '#B23528', display: 'block', marginTop: 2 }}>{locationError}</span>}
            </div>
          </div>
        </div>
        <Button size="small" variant={sharingLocation ? 'secondary' : 'accent'} onClick={sharingLocation ? stopSharing : startSharing}>
          {sharingLocation ? 'Stop sharing' : 'Share my location'}
        </Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 4 }}>My availability</div>
        {missingDriverRecord ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#FDE9E7', border: '1px solid #F7C9C3', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
            <AlertTriangle size={15} color="#B23528" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11.5, color: '#B23528', lineHeight: 1.5 }}>
              <b>This account is not linked to a driver record.</b> Your deliveries and availability cannot load until an admin links it - ask them to add you under Admin / Drivers{user?.email ? ` with ${user.email}` : ''}.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: '#697086', marginBottom: 14 }}>
            {hasActiveWork
              ? `You have ${active.length} active ${active.length === 1 ? 'delivery' : 'deliveries'} - you can still set your own state here, and it stays until your delivery list changes.`
              : 'Let dispatch know whether you can take new deliveries right now.'}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {AVAILABILITY_OPTIONS.map((option) => {
            // Nothing is marked "(current)" until the driver's real record is
            // known - `currentStatus` falls back to 'Offline', which would
            // otherwise highlight OFFLINE for an unlinked account as though
            // that were a state it had actually been set to.
            const isCurrent = Boolean(driver) && currentStatus === option.value;
            const disabled = savingAvailability || missingDriverRecord;
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => handleSetAvailability(option.value)}
                style={{
                  flex: '1 1 140px',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: isCurrent ? '2px solid #F5A524' : '1.5px solid #E3E7EF',
                  background: isCurrent ? '#FCEFD6' : '#fff',
                  color: isCurrent ? '#8A5A05' : '#12213F',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  fontSize: 12.5,
                  letterSpacing: '.03em',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled && !isCurrent ? 0.5 : 1,
                }}
              >
                {option.label}{isCurrent ? ' (current)' : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14 }}>My driver details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))', gap: 14 }}>
          {[
            ['Full name', driver?.name || user?.name],
            ['Email', driver?.email || user?.email],
            ['Phone', driver?.phone || 'Not provided'],
            ['Branch', driver?.branch || 'Not assigned'],
            ['Vehicle', driver?.vehicle || 'Not assigned'],
            ['Vehicle type', driver?.vehicleType || 'Not provided'],
            ['Capacity', driver?.vehicleCapacity || 'Not provided'],
            ['Insurance expiry', driver?.insuranceExpiry || 'Not provided'],
            ['Account status', driver?.accountStatus || 'Active'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: '#9AA1B4', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#12213F', wordBreak: 'break-word' }}>{value || 'Not provided'}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Out for delivery" value={active.length} delta="Assigned to you now" icon={Truck} iconBg="#E8EFFE" iconColor="#2453B8" />
        <KpiCard label="Delivered" value={deliveredToday} delta="This session" icon={CheckCircle2} iconBg="#E4F7F4" iconColor="#0C8C6B" />
        <KpiCard label="COD to collect" value={formatLKR(codTotal)} delta={`${active.length} stop(s)`} icon={WalletCards} iconBg="#FCEFD6" iconColor="#8A5A05" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F' }}>Today's route</div>
          <Link to="/driver/deliveries" style={{ fontSize: 12, fontWeight: 600, color: '#3E7BFA' }}>View all</Link>
        </div>
        {active.length === 0 ? (
          <div style={{ color: '#697086', fontSize: 12.5 }}>No active deliveries right now.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {active.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F9FAFC', borderRadius: 10 }}>
                <div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 12.5 }}>{s.trackingNumber}</div>
                  <div style={{ fontSize: 11.5, color: '#697086' }}>{s.recipientName} · {s.recipientAddress}, {s.recipientCity}</div>
                </div>
                <StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Link to="/driver/pod" style={{ padding: '10px 16px', borderRadius: 10, background: '#F5A524', color: '#211200', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13 }}>Capture POD</Link>
          <Link to="/driver/failed" style={{ padding: '10px 16px', borderRadius: 10, background: '#fff', border: '1.5px solid #E3E7EF', color: '#12213F', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13 }}>Report failed delivery</Link>
        </div>
      </div>
    </PortalLayout>
  );
}
