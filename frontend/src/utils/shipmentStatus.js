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
  RTO: { label: 'Returned to Origin', tone: 'violet' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  DAMAGED: { label: 'Damaged', tone: 'coral' },
  LOST: { label: 'Lost', tone: 'coral' },
  ON_HOLD: { label: 'On Hold', tone: 'amber' },
};

export const FAILURE_REASONS = [
  'CUSTOMER_UNAVAILABLE',
  'WRONG_ADDRESS',
  'PHONE_UNREACHABLE',
  'CUSTOMER_REFUSED',
  'PAYMENT_NOT_AVAILABLE',
  'ADDRESS_NOT_FOUND',
  'DAMAGED_PACKAGE',
  'OTHER',
];

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

export function isTerminal(status) {
  return status === 'DELIVERED' || status === 'DELIVERY_FAILED' || status === 'RTO' || status === 'CANCELLED';
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
