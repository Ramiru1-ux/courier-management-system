import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertOctagon, ArrowLeft, CalendarClock, CheckCircle2, PackageX, Printer, RotateCcw, Truck, Undo2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ShipmentQrCode from '../../components/common/ShipmentQrCode';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { STATUS_FLOW, statusLabel, statusTone, flowIndex, isTerminal, isRto, formatLKR, formatDateTime, FAILURE_REASONS, failureReasonLabel } from '../../utils/shipmentStatus';
import { printWaybill } from '../../utils/barcode';

export default function ShipmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    shipments, drivers, assignDriver, updateShipmentStatus, reportDamage, markLost,
    markDeliveryFailed, retryDelivery, rescheduleDelivery, initiateRto, setRtoInTransit, completeRto,
  } = useStore();
  const [assignOpen, setAssignOpen] = useState(false);
  const [driverChoice, setDriverChoice] = useState('');
  const [failOpen, setFailOpen] = useState(false);
  const [failReason, setFailReason] = useState(FAILURE_REASONS[0]);
  const [failNotes, setFailNotes] = useState('');
  const [rtoOpen, setRtoOpen] = useState(false);
  const [rtoReason, setRtoReason] = useState('Maximum delivery attempts reached');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const shipment = shipments.find((s) => s.id === id);

  if (!shipment) {
    return (
      <PortalLayout>
        <EmptyState title="Shipment not found" description="This shipment may have been removed or the ID is incorrect." actionLabel="Back to shipments" onAction={() => navigate('/shipments')} />
      </PortalLayout>
    );
  }

  const driver = drivers.find((d) => d.id === shipment.driverId);
  const canDispatch = user?.role === 'dispatcher' || user?.role === 'admin';
  const availableDrivers = drivers.filter((d) => d.status !== 'Delivering' && d.status !== 'Offline');
  const stepIndex = flowIndex(shipment.status);

  const handleAssign = () => {
    if (!driverChoice) return;
    assignDriver(shipment.id, driverChoice);
    toast.success('Driver assigned and shipment marked out for delivery');
    setAssignOpen(false);
    setDriverChoice('');
  };

  const handleDelivered = () => {
    updateShipmentStatus(shipment.id, 'DELIVERED', 'Delivered to recipient');
    toast.success('Shipment marked delivered');
  };

  const handleConfirmFailed = () => {
    markDeliveryFailed(shipment.id, failReason, failNotes);
    toast.error('Delivery marked as failed');
    setFailNotes('');
    setFailOpen(false);
  };

  const handleRetry = () => {
    retryDelivery(shipment.id);
    toast.success('Delivery retried');
  };

  const handleReschedule = () => {
    rescheduleDelivery(shipment.id, rescheduleDate);
    toast.success(rescheduleDate ? `Delivery rescheduled for ${rescheduleDate}` : 'Delivery rescheduled');
    setRescheduleOpen(false);
  };

  const handleInitiateRto = () => {
    initiateRto(shipment.id, rtoReason);
    toast.success('RTO initiated - the parcel will be returned to the sender');
    setRtoOpen(false);
  };

  const handleRtoInTransit = () => {
    setRtoInTransit(shipment.id);
    toast.success('Marked as returning to sender');
  };

  const handleRtoCompleted = () => {
    completeRto(shipment.id);
    toast.success('RTO completed - parcel is back with the sender');
  };

  const handleDamage = () => {
    reportDamage(shipment.id);
    toast.error('Shipment reported as damaged');
  };

  const handleLost = () => {
    markLost(shipment.id);
    toast.error('Shipment reported as lost - under investigation');
  };

  const handlePrint = async () => {
    const opened = await printWaybill(shipment);
    if (!opened) toast.error('Please allow pop-ups to print the waybill');
  };

  return (
    <PortalLayout>
      <button type="button" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', color: '#697086', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Shipments / <b style={{ color: '#697086' }}>{shipment.trackingNumber}</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: '#12213F', margin: 0 }}>{shipment.trackingNumber}</h1>
          <div style={{ marginTop: 8 }}><StatusBadge status={statusLabel(shipment.status)} tone={statusTone(shipment.status)} showIcon /></div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print waybill</Button>

          {canDispatch && !isTerminal(shipment.status) && (
            <>
              {!shipment.driverId && <Button variant="accent" icon={Truck} onClick={() => setAssignOpen(true)}>Assign driver</Button>}
              {shipment.status === 'OUT_FOR_DELIVERY' && (
                <>
                  <Button variant="primary" icon={CheckCircle2} onClick={handleDelivered}>Mark delivered</Button>
                  <Button variant="danger" icon={PackageX} onClick={() => setFailOpen(true)}>Mark failed</Button>
                </>
              )}
              <Button variant="secondary" icon={AlertOctagon} onClick={handleDamage}>Report damage</Button>
              <Button variant="secondary" icon={AlertOctagon} onClick={handleLost}>Mark lost</Button>
            </>
          )}

          {/* The failed / RTO workflow. A failed delivery is not the end of
              the line: dispatch can send it out again, park it for a later
              date, or start the return journey. */}
          {canDispatch && shipment.status === 'DELIVERY_FAILED' && (
            <>
              <Button variant="primary" icon={RotateCcw} onClick={handleRetry}>Retry delivery</Button>
              <Button variant="secondary" icon={CalendarClock} onClick={() => setRescheduleOpen(true)}>Reschedule</Button>
              <Button variant="danger" icon={Undo2} onClick={() => setRtoOpen(true)}>Initiate RTO</Button>
            </>
          )}
          {canDispatch && ['RTO_INITIATED', 'RTO'].includes(shipment.status) && (
            <Button variant="primary" icon={Truck} onClick={handleRtoInTransit}>Mark RTO in transit</Button>
          )}
          {canDispatch && shipment.status === 'RTO_IN_TRANSIT' && (
            <Button variant="primary" icon={CheckCircle2} onClick={handleRtoCompleted}>Mark RTO completed</Button>
          )}
        </div>
      </div>

      {/* Shown only when the shipment has actually failed or is being
          returned - a healthy shipment shows nothing here at all. */}
      {(shipment.failureReason || isRto(shipment.status)) && (
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderLeft: '4px solid #B23528', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 12 }}>
            {isRto(shipment.status) ? 'Return to sender' : 'Failed delivery'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, fontSize: 12.5 }}>
            {shipment.failureReason && (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>Failure reason</div>
                <div style={{ fontWeight: 700, color: '#B23528' }}>{failureReasonLabel(shipment.failureReason)}</div>
                {shipment.failureNotes ? <div style={{ color: '#697086', marginTop: 2 }}>{shipment.failureNotes}</div> : null}
              </div>
            )}
            {shipment.deliveryAttempts ? (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>Delivery attempts</div>
                <div style={{ fontWeight: 700, color: '#12213F' }}>{shipment.deliveryAttempts}</div>
              </div>
            ) : null}
            {shipment.failedAt && (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>Attempted on</div>
                <div style={{ fontWeight: 600, color: '#12213F' }}>{formatDateTime(shipment.failedAt)}</div>
              </div>
            )}
            {(shipment.failedByName || shipment.failedBy) && (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>Attempted by</div>
                <div style={{ fontWeight: 600, color: '#12213F' }}>{shipment.failedByName || shipment.failedBy}</div>
              </div>
            )}
            {shipment.rescheduledFor ? (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>Rescheduled for</div>
                <div style={{ fontWeight: 600, color: '#12213F' }}>{shipment.rescheduledFor}</div>
              </div>
            ) : null}
            {shipment.rtoReason && (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>RTO reason</div>
                <div style={{ fontWeight: 600, color: '#12213F' }}>{shipment.rtoReason}</div>
              </div>
            )}
            {shipment.rtoInitiatedAt && (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>RTO initiated</div>
                <div style={{ fontWeight: 600, color: '#12213F' }}>{formatDateTime(shipment.rtoInitiatedAt)}</div>
              </div>
            )}
            {shipment.rtoCompletedAt && (
              <div>
                <div style={{ color: '#9AA1B4', fontSize: 11, marginBottom: 3 }}>RTO completed</div>
                <div style={{ fontWeight: 600, color: '#0C8C6B' }}>{formatDateTime(shipment.rtoCompletedAt)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14 }}>Delivery progress</div>

          {!isTerminal(shipment.status) ? (
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {STATUS_FLOW.map((step, index) => (
                <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: index <= stepIndex ? '#0EA394' : '#E3E7EF', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 10.5, color: index === stepIndex ? '#12213F' : '#9AA1B4', fontWeight: index === stepIndex ? 700 : 500 }}>{statusLabel(step)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: 18 }}><StatusBadge status={statusLabel(shipment.status)} tone={statusTone(shipment.status)} showIcon /></div>
          )}

          <div style={{ position: 'relative', paddingLeft: 22 }}>
            {shipment.history.slice().reverse().map((event, index) => (
              <div key={index} style={{ position: 'relative', paddingBottom: 18, borderLeft: index === shipment.history.length - 1 ? 'none' : '2px solid #E3E7EF', marginLeft: -1, paddingLeft: 18 }}>
                <div style={{ position: 'absolute', left: -6, top: 2, width: 12, height: 12, borderRadius: '50%', background: '#0EA394', border: '2.5px solid #fff', boxShadow: '0 0 0 2px #0EA394' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#12213F' }}>{event.label}</div>
                <div style={{ fontSize: 11.5, color: '#9AA1B4', marginTop: 2 }}>{event.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 14 }}>Shipment details</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ShipmentQrCode trackingNumber={shipment.trackingNumber} size={130} />
          </div>
          {[
            ['Sender', shipment.senderName],
            ['Sender phone', shipment.senderPhone],
            ['Origin address', shipment.senderAddress],
            ['Recipient', shipment.recipientName],
            ['Recipient phone', shipment.recipientPhone],
            ['Destination', `${shipment.recipientAddress}, ${shipment.recipientCity}`],
            ['Branch', shipment.branch],
            ['Service type', shipment.serviceType],
            ['Weight', `${shipment.weight} kg`],
            ['COD amount', shipment.codAmount ? formatLKR(shipment.codAmount) : 'Prepaid'],
            ['Assigned driver', driver ? driver.name : 'Unassigned'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, borderBottom: '1px solid #F0F2F6', padding: '9px 0' }}>
              <span style={{ color: '#697086', fontSize: 12 }}>{label}</span>
              <span style={{ color: '#12213F', fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign a driver"
        description={`Choose an available driver for ${shipment.trackingNumber}.`}
        footer={<><Button variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleAssign} disabled={!driverChoice}>Assign & dispatch</Button></>}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          {availableDrivers.length === 0 && <div style={{ color: '#697086', fontSize: 13 }}>No drivers are currently available.</div>}
          {availableDrivers.map((d) => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1.5px solid ${driverChoice === d.id ? '#F5A524' : '#E3E7EF'}`, borderRadius: 10, cursor: 'pointer' }}>
              <input type="radio" name="driver" value={d.id} checked={driverChoice === d.id} onChange={() => setDriverChoice(d.id)} />
              <span>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#12213F' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: '#9AA1B4' }}>{d.branch} · {d.vehicle} · {d.status}</div>
              </span>
            </label>
          ))}
        </div>
      </Modal>

      <Modal
        open={failOpen}
        onClose={() => setFailOpen(false)}
        title="Record failed delivery"
        description="A reason is required for every failed delivery attempt."
        footer={<><Button variant="secondary" onClick={() => setFailOpen(false)}>Cancel</Button><Button variant="danger" onClick={handleConfirmFailed}>Confirm failure</Button></>}
      >
        <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Failure reason</label>
        <select value={failReason} onChange={(e) => setFailReason(e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
          {FAILURE_REASONS.map((reason) => <option key={reason} value={reason}>{failureReasonLabel(reason)}</option>)}
        </select>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', margin: '12px 0 6px' }}>Notes (optional)</label>
        <input
          value={failNotes}
          onChange={(e) => setFailNotes(e.target.value)}
          placeholder="Anything the dispatcher should know"
          style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}
        />
      </Modal>

      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule delivery"
        description="The shipment goes back to the branch and waits for the new date."
        footer={<><Button variant="secondary" onClick={() => setRescheduleOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleReschedule}>Reschedule</Button></>}
      >
        <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>New delivery date</label>
        <input
          type="date"
          value={rescheduleDate}
          onChange={(e) => setRescheduleDate(e.target.value)}
          style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}
        />
      </Modal>

      <Modal
        open={rtoOpen}
        onClose={() => setRtoOpen(false)}
        title="Initiate RTO"
        description="The parcel stops being delivered and starts its journey back to the sender."
        footer={<><Button variant="secondary" onClick={() => setRtoOpen(false)}>Cancel</Button><Button variant="danger" onClick={handleInitiateRto}>Initiate RTO</Button></>}
      >
        <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Reason for return</label>
        <input
          value={rtoReason}
          onChange={(e) => setRtoReason(e.target.value)}
          placeholder="Why is this going back?"
          style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}
        />
      </Modal>
    </PortalLayout>
  );
}
