/**
 * The shipment lifecycle: statuses, who may move between them, and which
 * states still need someone's attention.
 *
 * This is the AUTHORITATIVE copy. The frontend mirrors the same names in
 * frontend/src/utils/shipmentStatus.js for labels and colours, but the rules
 * enforced here are the ones that actually decide what is allowed - a role
 * cannot get around them by editing the shipments list it sends up, because
 * validators/shipmentDataValidator.js checks every transition against this
 * file before anything is written.
 *
 * Naming note: the failed state is DELIVERY_FAILED, not FAILED. That name
 * already existed across the codebase, the database and the status enum, and
 * it means exactly "the delivery attempt failed" - so it is reused rather
 * than renamed, which would have invalidated stored records and 14 call
 * sites for no behavioural gain.
 *
 * RTO, previously a single terminal status, is now the three-stage return
 * journey the business actually has. The old single RTO value is still
 * accepted and is treated as RTO_INITIATED so existing records keep working.
 */

const STATUSES = [
  "CREATED",
  "PICKED_UP",
  "AT_ORIGIN_BRANCH",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "RTO", // legacy: an RTO recorded before the stages below existed
  "RTO_INITIATED",
  "RTO_IN_TRANSIT",
  "RTO_COMPLETED",
  "CANCELLED",
  "DAMAGED",
  "LOST",
  "ON_HOLD",
];

/** Why a delivery attempt failed. The driver must pick one. */
const FAILURE_REASONS = [
  "CUSTOMER_UNAVAILABLE",
  "CUSTOMER_REFUSED",
  "WRONG_ADDRESS",
  "PHONE_UNREACHABLE",
  "DELIVERY_RESCHEDULED",
  "PAYMENT_NOT_AVAILABLE",
  "ADDRESS_NOT_FOUND",
  "DAMAGED_PACKAGE",
  "OTHER",
];

const RTO_STATUSES = ["RTO", "RTO_INITIATED", "RTO_IN_TRANSIT", "RTO_COMPLETED"];

/**
 * Shipments that still need someone to act. This is what the merchant's
 * "Failed / RTO" card counts.
 *
 * RTO_COMPLETED is deliberately excluded: the parcel is physically back with
 * the merchant, so the return is finished and there is nothing left to chase.
 * DELIVERED is excluded for the same reason.
 */
const ACTIVE_FAILED_RTO_STATUSES = [
  "DELIVERY_FAILED",
  "RTO",
  "RTO_INITIATED",
  "RTO_IN_TRANSIT",
];

/**
 * Legal moves, and who may make them.
 *
 * Only transitions that are part of the failed/RTO workflow are constrained
 * here. Anything not listed is left to the existing permission model exactly
 * as before, so this cannot break flows that already worked.
 */
const TRANSITIONS = {
  // A driver reports the outcome of their own attempt. Staff can too, from
  // the shipment screen, when a driver phones it in.
  DELIVERY_FAILED: {
    from: ["OUT_FOR_DELIVERY"],
    roles: ["driver", "dispatcher", "admin"],
    requires: "failureReason",
  },
  // Retry / reschedule: dispatch sends it out again, or parks it at the
  // branch for another run. The failure history is kept either way.
  OUT_FOR_DELIVERY: {
    from: ["CREATED", "PICKED_UP", "AT_ORIGIN_BRANCH", "DELIVERY_FAILED", "ON_HOLD"],
    roles: ["dispatcher", "admin", "branch", "counter"],
  },
  AT_ORIGIN_BRANCH: {
    from: ["CREATED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERY_FAILED", "ON_HOLD"],
    roles: ["dispatcher", "admin", "branch", "counter"],
  },
  // The return journey. A driver must never jump straight to completed -
  // only dispatch/admin close a return off, once the parcel is actually back.
  RTO_INITIATED: {
    from: ["DELIVERY_FAILED", "ON_HOLD", "RTO"],
    roles: ["dispatcher", "admin"],
  },
  RTO_IN_TRANSIT: {
    from: ["RTO_INITIATED", "RTO"],
    roles: ["dispatcher", "admin", "driver"],
  },
  RTO_COMPLETED: {
    from: ["RTO_IN_TRANSIT", "RTO_INITIATED", "RTO"],
    roles: ["dispatcher", "admin"],
  },
};

const isRto = (status) => RTO_STATUSES.includes(status);
const isActiveFailedOrRto = (status) => ACTIVE_FAILED_RTO_STATUSES.includes(status);

/**
 * Checks one status change. Returns null when allowed, or a reason string.
 * `from` is null for a brand-new shipment.
 */
function checkTransition(from, to, role) {
  const rule = TRANSITIONS[to];
  if (!rule) return null; // not part of this workflow - existing rules apply
  if (from === to) return null; // unchanged; a re-save, not a transition
  if (from === null || from === undefined) {
    // A brand-new shipment. Starting it part-way along the ordinary delivery
    // path is legitimate - an imported or already-collected parcel can arrive
    // as PICKED_UP or OUT_FOR_DELIVERY. What makes no sense is a shipment
    // that begins life already failed or already being returned, since there
    // was no delivery attempt to fail and nothing to send back.
    if (to === "DELIVERY_FAILED" || isRto(to)) {
      return `a new shipment cannot start in ${to}`;
    }
    return null;
  }
  if (!rule.from.includes(from)) {
    return `cannot move from ${from} to ${to}`;
  }
  if (!rule.roles.includes(String(role || "").toLowerCase())) {
    return `${role || "this role"} is not allowed to set ${to}`;
  }
  return null;
}

module.exports = {
  STATUSES,
  FAILURE_REASONS,
  RTO_STATUSES,
  ACTIVE_FAILED_RTO_STATUSES,
  TRANSITIONS,
  isRto,
  isActiveFailedOrRto,
  checkTransition,
};
