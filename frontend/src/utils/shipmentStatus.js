// Shared shipment status + formatting helpers used across admin, finance
// and dispatcher pages so every screen agrees on labels, colors and order.

export const STATUS_FLOW = ['CREATED', 'PICKED_UP', 'AT_ORIGIN_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const STATUS_META = {
  CREATED: { label: 'Created', tone: 'neutral' },
  PICKED_UP: { label: 'Picked Up', tone: 'blue' },
  AT_ORIGIN_BRANCH: { label: 'At Branch', tone: 'blue' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', tone: 'amber' },
  DELIVERED: { label: 'Delivered', tone: 'teal' },
  DELIVERY_FAILED: { label: 'Delivery Failed', tone: 'coral' },
  // The return-to-origin journey, in the three stages it really has. Plain
  // 'RTO' is kept for records created before the stages existed and is
  // treated everywhere as an initiated-but-unfinished return.
  RTO: { label: 'RTO Initiated', tone: 'violet' },
  RTO_INITIATED: { label: 'RTO Initiated', tone: 'violet' },
  RTO_IN_TRANSIT: { label: 'RTO In Transit', tone: 'violet' },
  RTO_COMPLETED: { label: 'RTO Completed', tone: 'neutral' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  DAMAGED: { label: 'Damaged', tone: 'coral' },
  LOST: { label: 'Lost', tone: 'coral' },
  ON_HOLD: { label: 'On Hold', tone: 'amber' },
};

// Kept in step with backend/config/shipmentWorkflow.js, which is what
// actually enforces them - a reason outside this list is rejected server-side.
export const FAILURE_REASONS = [
  'CUSTOMER_UNAVAILABLE',
  'CUSTOMER_REFUSED',
  'WRONG_ADDRESS',
  'PHONE_UNREACHABLE',
  'DELIVERY_RESCHEDULED',
  'PAYMENT_NOT_AVAILABLE',
  'ADDRESS_NOT_FOUND',
  'DAMAGED_PACKAGE',
  'OTHER',
];

export const RTO_STATUSES = ['RTO', 'RTO_INITIATED', 'RTO_IN_TRANSIT', 'RTO_COMPLETED'];

/**
 * Shipments still needing someone to act - what the merchant's "Failed / RTO"
 * card counts. RTO_COMPLETED is excluded on purpose: the parcel is physically
 * back with the merchant, so the return is finished.
 */
export const ACTIVE_FAILED_RTO_STATUSES = ['DELIVERY_FAILED', 'RTO', 'RTO_INITIATED', 'RTO_IN_TRANSIT'];

export function isRto(status) {
  return RTO_STATUSES.includes(status);
}

export function needsAttention(status) {
  return ACTIVE_FAILED_RTO_STATUSES.includes(status);
}

export function failureReasonLabel(reason) {
  return String(reason).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function statusLabel(status) {
  return (STATUS_META[status] && STATUS_META[status].label) || status;
}

export function statusTone(status) {
  return (STATUS_META[status] && STATUS_META[status].tone) || 'neutral';
}

export function flowIndex(status) {
  return STATUS_FLOW.indexOf(status);
}

/**
 * Truly finished - nothing further will happen to the parcel.
 *
 * DELIVERY_FAILED and an in-progress RTO used to be counted as terminal,
 * which was wrong and had a real consequence: the shipment screen hides
 * every dispatch action once a shipment is terminal, so a failed delivery
 * could never be retried, rescheduled or sent back. They are now open
 * states, and only a completed return is an ending.
 */
export function isTerminal(status) {
  return ['DELIVERED', 'RTO_COMPLETED', 'CANCELLED'].includes(status);
}

export function formatLKR(amount) {
  const num = Number(amount) || 0;
  return 'Rs ' + num.toLocaleString('en-US');
}

export function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return iso;
  }
}
