/**
 * Per-role data scoping for the shared /api/app-data snapshot.
 *
 * Why this exists: every list in the frontend's store (shipments, drivers,
 * settlements, API keys, ...) lives in one shared blob, and until now every
 * authenticated role received the exact same full snapshot - a merchant
 * could read every other merchant's shipments and settlements, a driver
 * every other driver's contact details, and a customer every other
 * customer's complaints, on top of admin-only configuration (users, API
 * keys, webhooks, organizations) that no non-staff page even displays.
 *
 * Staff roles (admin, finance, dispatcher) keep full, unrestricted access -
 * they are trusted internal accounts, their write access to the most
 * sensitive config lists is already separately restricted in
 * appDataController.js, and every one of their routed pages legitimately
 * spans multiple lists (a dispatcher assigning drivers needs to see every
 * shipment and every driver, not just some of them).
 *
 * Merchant, driver and customer are external-facing roles whose pages
 * (audited directly against frontend/src/pages/{merchant,driver,customer}/*)
 * only ever read their OWN data. Ownership is determined the same way the
 * frontend's own (pre-existing) client-side filters already did it -
 * matching on merchantName / driverId / recipientName - so this mirrors
 * intended behaviour rather than inventing a new model.
 */

const STAFF_ROLES = new Set(["admin", "finance", "dispatcher"]);

/**
 * A driver's real login (the `users`/User collection) does not reliably
 * carry a `driverId` pointing at their record in `cms_drivers` - only the
 * five accounts created by the original seed script have it set; any
 * driver created later through the admin UI ends up with an empty
 * `driverId` (see DriversPage.jsx, fixed alongside this to set it going
 * forward). To make scoping correct for both old and new accounts, the
 * driver's blob record is resolved by `driverId` first, falling back to a
 * case-insensitive email match against `cms_drivers` (every driver record
 * carries the same email used for their real login).
 */
function resolveDriverBlobId(drivers, user) {
  const byId = user?.driverId && (drivers || []).find((d) => d.id === user.driverId);
  if (byId) return byId.id;
  const email = String(user?.email || "").toLowerCase();
  if (!email) return null;
  const byEmail = (drivers || []).find((d) => String(d.email || "").toLowerCase() === email);
  return byEmail ? byEmail.id : null;
}

/**
 * Builds the per-request scoping context. Returns null for staff roles
 * (meaning: no scoping, full access) so every call site can treat "scope is
 * null" as the full-trust path.
 *
 * `drivers` and `shipments` are the CURRENT, authoritative lists from
 * MongoDB (never the client's own payload) - ownership must never be
 * decided from data the requester controls.
 */
function buildScopeContext(req, { drivers = [], shipments = [] } = {}) {
  const role = String(req.user?.role || "").toLowerCase();
  if (STAFF_ROLES.has(role)) return null;

  const user = req.user || {};

  if (role === "merchant") {
    return { role, merchantName: user.merchantName || "" };
  }

  if (role === "driver") {
    return { role, driverBlobId: resolveDriverBlobId(drivers, user) };
  }

  if (role === "customer") {
    const customerName = user.name || "";
    const owned = shipments.filter((s) => s.recipientName === customerName);
    return {
      role,
      customerName,
      ownedShipmentIds: new Set(owned.map((s) => s.id)),
      ownedTrackingNumbers: new Set(owned.map((s) => s.trackingNumber)),
    };
  }

  // Branch manager and counter staff are both scoped to ONE physical
  // branch (the existing, previously-unused User.branchName field - see
  // models/User.js) rather than to something they personally created, since
  // their whole job is operating on whatever shipment physically passes
  // through their branch, not just ones they authored. Both are
  // deliberately NOT in STAFF_ROLES: unlike dispatcher/finance, they must
  // never see or touch another branch's data, and Branch Manager
  // specifically must never reach admin-level config (ADMIN_ONLY_WRITE_KEYS
  // still blocks them from users/webhooks/pricing/etc. as a non-admin).
  if (role === "branch" || role === "counter") {
    return { role, branchName: user.branchName || "" };
  }

  // Unknown/legacy role: safest default is "no access" rather than "full access".
  return { role, merchantName: "__none__", driverBlobId: null, customerName: "__none__", ownedShipmentIds: new Set(), ownedTrackingNumbers: new Set() };
}

/**
 * Produces the response payload for a scoped (non-staff) role. Every key
 * defaults to an empty array - the frontend now treats a missing/empty key
 * from an authenticated, non-empty response as "genuinely nothing here",
 * never as "not loaded yet" (see StoreContext.js mergeWithShape), so this
 * is safe and shows no fabricated data.
 */
function scopeSnapshotForRead(snapshot, scope) {
  if (!scope) return snapshot; // staff: unrestricted

  const scoped = {};
  for (const key of Object.keys(snapshot)) scoped[key] = [];

  // Reference data every role's shipment view needs (pickup branch names,
  // low sensitivity, no ownership concept) stays visible to everyone.
  scoped.branches = snapshot.branches || [];

  // A merchant or customer only ever sees the small subset of drivers
  // referenced by their own shipments (see below) - but their live GPS
  // coordinates (backend/controllers/appDataController.js
  // updateDriverLocation()) are a step further than that: nothing in this
  // application currently needs to show a merchant or customer their
  // driver's real-time position, so that field is stripped from both scopes
  // even though the rest of the driver record is intentionally visible to
  // them. Staff (scope === null, no scoping at all) and the driver's own
  // record always keep it.
  const withoutLiveLocation = (driver) => {
    const { liveLocation, ...rest } = driver;
    return rest;
  };

  if (scope.role === "merchant") {
    const { merchantName } = scope;
    scoped.shipments = (snapshot.shipments || []).filter((s) => s.senderName === merchantName);
    const driverIds = new Set(scoped.shipments.map((s) => s.driverId).filter(Boolean));
    scoped.drivers = (snapshot.drivers || []).filter((d) => driverIds.has(d.id)).map(withoutLiveLocation);
    scoped.addresses = (snapshot.addresses || []).filter((a) => a.merchant === merchantName);
    scoped.apiKeys = (snapshot.apiKeys || []).filter((k) => k.merchant === merchantName);
    scoped.settlements = (snapshot.settlements || []).filter((s) => s.merchant === merchantName);
    scoped.invoices = (snapshot.invoices || []).filter((i) => i.merchant === merchantName);
  } else if (scope.role === "driver") {
    const { driverBlobId } = scope;
    scoped.shipments = driverBlobId ? (snapshot.shipments || []).filter((s) => s.driverId === driverBlobId) : [];
    scoped.drivers = (snapshot.drivers || []).filter((d) => d.id === driverBlobId);
  } else if (scope.role === "customer") {
    const { customerName, ownedShipmentIds, ownedTrackingNumbers } = scope;
    scoped.shipments = (snapshot.shipments || []).filter((s) => ownedShipmentIds.has(s.id));
    const driverIds = new Set(scoped.shipments.map((s) => s.driverId).filter(Boolean));
    scoped.drivers = (snapshot.drivers || []).filter((d) => driverIds.has(d.id)).map(withoutLiveLocation);
    scoped.payments = (snapshot.payments || []).filter((p) => ownedTrackingNumbers.has(p.reference));
    scoped.ratings = (snapshot.ratings || []).filter((r) => ownedShipmentIds.has(r.shipmentId));
    scoped.supportTickets = (snapshot.supportTickets || []).filter((t) => t.customer === customerName);
    scoped.complaints = (snapshot.complaints || []).filter((c) => c.customer === customerName);
  } else if (scope.role === "branch" || scope.role === "counter") {
    const { branchName } = scope;
    scoped.shipments = (snapshot.shipments || []).filter((s) => s.branch === branchName);
    // Counter staff only handle intake/processing, not driver management -
    // a branch manager can at least see who is based at their own branch
    // (read-only: `drivers` is in STAFF_ONLY_WRITE_KEYS, so neither role can
    // write it regardless of what this read exposes).
    if (scope.role === "branch") {
      scoped.drivers = (snapshot.drivers || []).filter((d) => d.branch === branchName).map(withoutLiveLocation);
    }
  }

  return scoped;
}

/**
 * Ownership predicates for write-side reconciliation. A key not listed here
 * needs no per-record ownership check for scoped roles - it is either
 * blocked outright elsewhere (ADMIN_ONLY_WRITE_KEYS / FINANCE_WRITE_KEYS in
 * appDataController.js) or has no ownership concept at all.
 */
const SCOPED_OWNERSHIP = {
  shipments: (item, scope) => {
    if (scope.role === "merchant") return item.senderName === scope.merchantName;
    if (scope.role === "driver") return Boolean(scope.driverBlobId) && item.driverId === scope.driverBlobId;
    if (scope.role === "branch" || scope.role === "counter") return Boolean(scope.branchName) && item.branch === scope.branchName;
    return false; // customers never create or own a shipment record
  },
  addresses: (item, scope) => scope.role === "merchant" && item.merchant === scope.merchantName,
  apiKeys: (item, scope) => scope.role === "merchant" && item.merchant === scope.merchantName,
  supportTickets: (item, scope) => scope.role === "customer" && item.customer === scope.customerName,
  complaints: (item, scope) => scope.role === "customer" && item.customer === scope.customerName,
  ratings: (item, scope) => scope.role === "customer" && scope.ownedShipmentIds?.has(item.shipmentId),
  payments: (item, scope) => scope.role === "customer" && scope.ownedTrackingNumbers?.has(item.reference),
};

/**
 * Reconciles an incoming (client-controlled, untrusted) array for a scoped
 * key against the current, authoritative database rows: records the
 * requester does not own are always preserved exactly as they are in the
 * database, no matter what the incoming payload says about them (edited,
 * reordered, or silently dropped/"deleted") - only rows the requester
 * legitimately owns (existing or newly created) are taken from their
 * payload. This is the write-side mirror of scopeSnapshotForRead(): a
 * scoped role can only ever change its own data, verified against the
 * database, never against data the client itself supplied.
 */
function reconcileScopedWrite(key, incomingItems, currentItems, scope) {
  const ownerOf = SCOPED_OWNERSHIP[key];
  if (!ownerOf || !scope) return incomingItems; // staff, or a key with no ownership concept
  if (!Array.isArray(incomingItems)) return incomingItems;

  const currentById = new Map((currentItems || []).map((item) => [String(item.id), item]));
  const incomingById = new Map(incomingItems.filter((item) => item && item.id != null).map((item) => [String(item.id), item]));

  const result = [];
  for (const [id, currentItem] of currentById) {
    if (ownerOf(currentItem, scope)) {
      if (incomingById.has(id)) result.push(incomingById.get(id)); // owner's edit
      // else: the owner removed it from their payload - a legitimate delete.
    } else {
      result.push(currentItem); // not theirs: keep the database's version, ignore the payload entirely
    }
  }
  for (const [id, incomingItem] of incomingById) {
    if (currentById.has(id)) continue; // already handled above
    if (ownerOf(incomingItem, scope)) result.push(incomingItem); // legitimate new record
    // else: attempted to inject a record outside their ownership - dropped
  }
  return result;
}

/**
 * Merge-only reconciliation for system-wide append logs that a scoped
 * (non-staff) role's local view only ever contains a partial slice of
 * (audit trail, sent-notification outbox, proof-of-delivery records: every
 * role's own actions legitimately add to these, but scopeSnapshotForRead()
 * currently returns none of the EXISTING entries to a merchant/driver/
 * customer, since no non-staff page reads them back). A scoped role's
 * incoming array can therefore only ever ADD rows with an id the database
 * does not already have - it can never edit or delete an existing one,
 * and in particular can never replace the whole collection with just the
 * handful of new rows their own session happened to generate. Staff roles
 * never go through this (their local view is already the full collection,
 * so a normal replace is correct and unchanged from before).
 */
function reconcileAppendOnlyWrite(incomingItems, currentItems) {
  if (!Array.isArray(incomingItems)) return currentItems;
  const currentIds = new Set((currentItems || []).map((item) => String(item.id)));
  const newOnes = incomingItems.filter((item) => item && item.id != null && !currentIds.has(String(item.id)));
  return [...newOnes, ...(currentItems || [])];
}

module.exports = {
  STAFF_ROLES,
  SCOPED_OWNERSHIP,
  resolveDriverBlobId,
  buildScopeContext,
  scopeSnapshotForRead,
  reconcileScopedWrite,
  reconcileAppendOnlyWrite,
};
