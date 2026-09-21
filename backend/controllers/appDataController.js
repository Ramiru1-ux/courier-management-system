const { APP_KEYS, APP_COLLECTIONS, LEGACY_COLLECTIONS, getAppModel, getLegacyModel, stripInternals } = require("../models/appData");
const { STAFF_ROLES, buildScopeContext, scopeSnapshotForRead, reconcileScopedWrite, reconcileAppendOnlyWrite, SCOPED_OWNERSHIP, resolveDriverBlobId } = require("../utils/roleScope");
const { validateShipmentsList } = require("../validators/shipmentDataValidator");
const { dispatchExternalNotification } = require("../services/notificationDispatcher");
const { hasExplicitPermission } = require("../utils/permissionMatrix");
const { ACTIVE_FAILED_RTO_STATUSES, RTO_STATUSES } = require("../config/shipmentWorkflow");

/**
 * Authoritative, server-side validation for the handful of list keys that
 * need it (currently just `shipments` - business-critical fields with real
 * validity constraints). Everything else keeps its existing loose,
 * frontend-owns-the-shape behavior (see models/appData.js) - adding
 * validation everywhere was not asked for and risks rejecting legitimate
 * existing data in lists that were never a reported problem.
 * Returns an Express error response and true if invalid, else false.
 */
const VALIDATORS = { shipments: validateShipmentsList };
function rejectIfInvalid(res, key, items, context) {
  const validate = VALIDATORS[key];
  if (!validate) return false;
  try {
    validate(items, context);
    return false;
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message, field: error.field });
    return true;
  }
}

/**
 * Builds the cross-record context a validator needs but a single list's own
 * payload cannot supply - currently just `shipments` (driver-reference
 * validity needs the CURRENT, authoritative `drivers` collection, never the
 * requester's own payload; the "not a new assignment" carve-out needs the
 * CURRENT shipment row). Always reads from the database, never from
 * `effectivePayload`, so a request cannot forge its own validation context
 * (e.g. by also sending a fabricated `drivers` list in the same payload).
 */
async function buildValidationContext(effectivePayload, req) {
  const context = {};
  if (Object.prototype.hasOwnProperty.call(effectivePayload, "shipments")) {
    const [drivers, currentShipments] = await Promise.all([loadList("drivers"), loadList("shipments")]);
    context.shipments = {
      drivers,
      currentById: new Map(currentShipments.map((s) => [String(s.id), s])),
      // Taken from the verified JWT, never from the request body, so the
      // shipment workflow's role rules cannot be talked around by a client
      // claiming to be someone else (see config/shipmentWorkflow.js).
      role: roleOf(req),
    };
  }
  return context;
}

const fail = (res, error, message) =>
  res.status(500).json({
    success: false,
    message: error?.message || message,
  });

/**
 * These lists are only ever edited from admin-only screens (Webhooks,
 * Organizations, Subscriptions, Users, Pricing & Zones, Notification
 * Templates, Branches, Vehicles, Manifests) - no finance, dispatcher,
 * merchant, driver or customer page ever calls a StoreContext mutator that
 * touches them. A non-admin token cannot persist changes to these
 * collections even if it sends them, so a compromised or malicious
 * non-admin session cannot rewrite webhook targets, billing/subscription
 * config, or staff accounts. `apiKeys` used to be here too, but
 * merchant/ApiCredentialsPage.jsx legitimately manages a merchant's own
 * keys - it is now handled by the per-record ownership check in
 * SCOPED_OWNERSHIP (utils/roleScope.js) instead of a blanket block.
 */
const ADMIN_ONLY_WRITE_KEYS = new Set([
  "webhooks",
  "organizations",
  "subscriptionPlans",
  "users",
  "pricingRules",
  "zones",
  "notificationTemplates",
  "branches",
  "vehicles",
  "manifests",
]);

/**
 * No merchant/dispatcher/driver/customer page ever creates or edits a
 * settlement, invoice, refund, or driver-reconciliation entry - those pages
 * are all read-only for non-finance roles (MerchantSettlementsPage,
 * merchant/InvoicesPage, ...). Restricting writes to admin+finance stops a
 * dispatcher or merchant session from marking their own settlement
 * "Cleared" or approving their own refund.
 */
const FINANCE_WRITE_KEYS = new Set(["settlements", "invoices", "refunds", "driverReconciliation"]);

/**
 * `apiKeys` has a per-record ownership concept (a merchant manages their
 * OWN keys - see SCOPED_OWNERSHIP in roleScope.js), which is why it was
 * deliberately left out of ADMIN_ONLY_WRITE_KEYS above. That fix only
 * covered non-staff roles though: `scope` is null for every STAFF role
 * (admin, finance, dispatcher all bypass ownership checks by design), so a
 * finance or dispatcher session - neither of which has any apiKeys page at
 * all - could still write arbitrary apiKeys entries, including one
 * impersonating a merchant it has no relationship to. Found and confirmed
 * exploitable during this round's granular-permission audit. Non-admin
 * staff now get the same hard block as everyone outside admin/the owning
 * merchant; admin (checked first, below) and a scoped merchant owner
 * (checked via SCOPED_OWNERSHIP further down) are unaffected.
 */
const ADMIN_OR_OWNER_ONLY_WRITE_KEYS = new Set(["apiKeys"]);

/**
 * `drivers` is scoped on read (a merchant/customer only ever sees the
 * handful of drivers referenced by their own shipments, a driver only ever
 * sees themself - see roleScope.js), but it has no per-record ownership
 * concept the way shipments/addresses/apiKeys do: no merchant, driver, or
 * customer page ever creates or edits a driver record (only
 * admin/DriversPage.jsx and dispatcher/ActiveDriversPage.jsx do). Because
 * every save sends the requester's ENTIRE local snapshot, a scoped role's
 * partial/empty view of `drivers` must never be allowed to overwrite the
 * real collection - it needs a hard block for merchant/driver/customer
 * while staying writable for every staff role, including dispatcher (who
 * is not "admin" but does have a legitimate driver-availability toggle).
 */
const STAFF_ONLY_WRITE_KEYS = new Set(["drivers"]);

/**
 * Finance is "staff" (STAFF_ROLES in roleScope.js), which normally means
 * full, unrestricted access bypassing ownership scoping entirely - correct
 * for the finance-specific lists in FINANCE_WRITE_KEYS above, but finance
 * is a financial-operations role, not an operations/dispatch role, and has
 * no legitimate reason to create/edit/delete shipments (assigning drivers,
 * changing delivery status, etc. - all of that lives on this one list) or
 * to write `drivers` (creating a driver, or changing one's operational
 * availability - STAFF_ONLY_WRITE_KEYS above was written to mean "any
 * staff role", which incorrectly included finance). This is a narrower,
 * role-specific carve-OUT of the "staff bypasses everything" default -
 * every other staff role (admin, dispatcher) is unaffected.
 * utils/permissionMatrix.js already documented finance's shipments access
 * as "read" and drivers as "none" - this makes the actual enforcement
 * match what was already the documented, intended design.
 */
const FINANCE_EXCLUDED_WRITE_KEYS = new Set(["shipments", "drivers"]);

/**
 * These are system-wide append logs (audit trail, sent-notification
 * outbox, proof-of-delivery records). Every role's actions legitimately
 * add to them via logAction()/pushNotification()/capturePOD(), but they
 * are not read back by any merchant/driver/customer page, so a scoped
 * role's local copy only ever holds the handful of entries their own
 * session just added - never the full log. A blanket write-block would
 * silently drop those legitimate new entries; a normal replace would wipe
 * everyone else's history. See reconcileAppendOnlyWrite() in roleScope.js.
 */
const APPEND_ONLY_FOR_SCOPED = new Set(["auditLogs", "podRecords", "notificationsOutbox"]);

/**
 * The operational availability states a driver can set for themselves from
 * the driver portal (AVAILABILITY_OPTIONS in
 * frontend/src/pages/driver/DriverDashboardPage.jsx). Distinct from
 * `accountStatus`, which is Admin's portal-access control - see
 * updateDriverAvailability() below.
 */
const DRIVER_AVAILABILITY_VALUES = ["Available", "Delivering", "Offline"];

const roleOf = (req) => String(req.user?.role || "").toLowerCase();
const isAdmin = (req) => roleOf(req) === "admin";
const isAdminOrFinance = (req) => ["admin", "finance"].includes(roleOf(req));
const isStaff = (req) => STAFF_ROLES.has(roleOf(req));

/** Load one list (already ordered the way the UI expects). */
const loadList = async (key) => {
  const Model = getAppModel(key);
  if (!Model) return [];
  const docs = await Model.find({}).sort({ __order: 1 }).lean();
  return docs.map(stripInternals);
};

/**
 * Write one list. Records the frontend still has are upserted by their `id`,
 * records it no longer has are deleted - so MongoDB always mirrors the UI.
 *
 * De-duplicates by `id` before building the bulk operations, keeping the
 * LAST occurrence of any repeated id (same "last one wins" convention used
 * everywhere else in this codebase for id-keyed lookups, e.g.
 * `new Map(items.map(i => [i.id, i]))` in roleScope.js). A real save from
 * StoreContext.js can never legitimately contain two entries with the same
 * id - every mutator either `.map()`s the existing array in place (one row
 * per id) or appends a freshly generated, collision-checked id - but
 * without this, a malformed/replayed payload with a duplicate id would hand
 * MongoDB two `replaceOne` operations targeting the same document in the
 * same unordered bulk write, whose relative execution order is not
 * guaranteed - silently discarding whichever one "lost" instead of
 * deterministically keeping the newest.
 */
const saveList = async (key, items) => {
  const Model = getAppModel(key);
  if (!Model || !Array.isArray(items)) return 0;

  const withIds = items
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({ ...item, id: String(item.id ?? `${key}-${index + 1}`) }));

  const dedupedById = new Map(withIds.map((item) => [item.id, item]));
  const rows = [...dedupedById.values()].map((row, index) => ({ ...row, __order: index }));

  const operations = rows.map((row) => ({
    replaceOne: { filter: { id: row.id }, replacement: row, upsert: true },
  }));

  const keepIds = rows.map((row) => row.id);
  operations.push({ deleteMany: { filter: { id: { $nin: keepIds } } } });

  await Model.bulkWrite(operations, { ordered: false });
  return rows.length;
};

/**
 * Clears a driver's stale "Delivering" status once they have no shipment
 * left with status OUT_FOR_DELIVERY and that driverId. This is the ONLY
 * direction this function ever moves a driver - it never sets anyone TO
 * "Delivering" (that already happens correctly via the dispatcher-driven
 * assignDriver() write path in StoreContext.js, which is staff-initiated
 * and therefore already persists fine) and it never overrides a driver who
 * has already manually chosen "Offline" (a manual choice is respected -
 * this only ever touches drivers currently sitting at "Delivering").
 * Idempotent and safe to call after every shipments save regardless of
 * what actually changed - `finalShipments` is always the complete,
 * post-save shipments state (for a scoped/non-staff save, roleScope.js's
 * reconcileScopedWrite() has already merged the requester's own edits back
 * into everyone else's untouched records before this runs, so this always
 * sees the true, final picture).
 */
async function reconcileDriverAvailability(finalShipments) {
  const activeCountById = new Map();
  for (const shipment of finalShipments || []) {
    if (!shipment || shipment.status !== "OUT_FOR_DELIVERY" || !shipment.driverId) continue;
    activeCountById.set(shipment.driverId, (activeCountById.get(shipment.driverId) || 0) + 1);
  }

  const DriverModel = getAppModel("drivers");
  const drivers = await DriverModel.find(
    {},
    { id: 1, status: 1, availabilitySetByDriver: 1, availabilitySetWithActiveCount: 1 }
  ).lean();

  const operations = [];
  for (const driver of drivers) {
    const activeCount = activeCountById.get(driver.id) || 0;

    // A state the driver picked for themselves in the driver portal (see
    // updateDriverAvailability() below) stands for as long as the workload
    // it was chosen against is unchanged - so a driver who marks themselves
    // Offline mid-round stays Offline instead of being flipped straight back
    // to "Delivering" by the next save. It expires on its own as soon as
    // their real active-delivery count moves (new assignment, POD captured,
    // delivery failed), after which the automatic rules below take over
    // again.
    if (driver.availabilitySetByDriver === true && Number(driver.availabilitySetWithActiveCount || 0) === activeCount) continue;

    const target = activeCount > 0 ? "Delivering" : driver.status === "Delivering" ? "Available" : driver.status;
    const hasExpiredChoice = driver.availabilitySetByDriver === true;
    if (target === driver.status && !hasExpiredChoice) continue;

    const update = { $set: { status: target } };
    if (hasExpiredChoice) update.$unset = { availabilitySetByDriver: "", availabilitySetWithActiveCount: "" };
    operations.push({ updateOne: { filter: { id: driver.id }, update } });
  }

  // Bulk saves no longer carry availability (see keepDriverAvailabilityFromDb
  // below), so the server now also sets "Delivering" itself for every driver
  // who has an active shipment.
  if (operations.length) await DriverModel.bulkWrite(operations, { ordered: false });
}

/**
 * Driver availability (drivers[].status) is owned by the driver and the
 * server - never by a staff member's bulk save. Every save from the
 * dispatcher/admin browser sends its whole in-memory drivers list, which is
 * often older than the database: a driver who went Offline from the driver
 * app a minute ago still shows "Available" there. Writing that list as-is
 * silently put the driver back online (and made them assignable again).
 *
 * So for every driver that already exists, the status stored in MongoDB is
 * kept. It only changes through:
 *   - PUT /api/app-data/drivers/:id/availability (the driver themselves)
 *   - reconcileDriverAvailability() (Delivering while they have active work)
 * A brand-new driver row keeps the status it was created with.
 */
async function keepDriverAvailabilityFromDb(items) {
  if (!Array.isArray(items)) return items;
  const currentDrivers = await loadList("drivers");
  const storedById = new Map(currentDrivers.map((driver) => [driver.id, driver]));
  return items.map((driver) => {
    if (!driver || !storedById.has(driver.id)) return driver;
    const stored = storedById.get(driver.id);
    const kept = { ...driver };
    if (stored.status !== undefined) kept.status = stored.status;
    // The marker for "the driver chose this themselves" belongs to the same
    // stored state as the status it was recorded with (see
    // updateDriverAvailability() below). A staff snapshot taken before that
    // choice does not carry these fields at all, and letting it drop them
    // would hand the choice straight back to reconcileDriverAvailability()
    // to overwrite, so they are restored - or cleared - from MongoDB too.
    for (const field of ["availabilitySetByDriver", "availabilitySetWithActiveCount"]) {
      if (stored[field] === undefined) delete kept[field];
      else kept[field] = stored[field];
    }
    return kept;
  });
}

/**
 * Field stamped on every shipment this server writes, holding the moment it
 * was last changed. It is deliberately NOT stripped by stripInternals(), so
 * it travels out to the clients and back again with the rest of the record -
 * but nothing in the UI reads it; only reconcileShipmentWrite() below does.
 */
const CHANGED_AT = "__updatedAt";

/** Key-order-independent comparison of two records' business content. */
const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((key) => key !== CHANGED_AT && key !== "__order" && key !== "_id")
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
};

/**
 * Protects shipment records from a stale whole-snapshot save.
 *
 * Every client keeps the entire store in memory and re-sends ALL of it on
 * every save (see StoreContext.js), and saveList() below persists that list
 * verbatim - existing rows replaced, rows missing from it deleted. For a
 * staff role (admin, dispatcher; finance for the lists it may write) nothing
 * filtered that, so a snapshot loaded minutes earlier was written back as if
 * it were current: a dispatcher marking a shipment OUT_FOR_DELIVERY, or a
 * driver's captured POD, was silently reverted to the older status the next
 * time any other staff session saved anything at all - and a shipment
 * created after that session loaded its page was deleted outright, because
 * its id was simply absent from the older list. That is what made
 * "At Branch" / "Out for Delivery" updates fail to stick for admin and
 * finance.
 *
 * The fix is a three-way merge, per record, using `asOf` - the server time
 * the requester's snapshot was read (returned by getAppData() and by every
 * save, and echoed back by the client):
 *   - a record the client has not touched is left exactly as the database
 *     has it, whoever last changed it;
 *   - a record the client genuinely changed is accepted, UNLESS the stored
 *     copy has itself changed since that client last read it, in which case
 *     the newer stored copy wins and the id is reported back so the client
 *     can reload rather than fight over it;
 *   - a record missing from the payload is deleted only if the client had
 *     actually seen it; one created or changed after their read is kept.
 *
 * With no usable `asOf` (a client that does not send one) nothing is treated
 * as newer and the previous replace-everything behaviour is unchanged.
 */
async function reconcileShipmentWrite(incoming, asOf) {
  const stored = await loadList("shipments");
  const storedById = new Map(stored.map((item) => [String(item.id), item]));
  const readAt = Date.parse(asOf || "");

  const changedSinceClientRead = (item) => {
    if (!Number.isFinite(readAt)) return false;
    const stamp = Date.parse(item?.[CHANGED_AT] || "");
    return Number.isFinite(stamp) && stamp > readAt;
  };

  const now = new Date().toISOString();
  const items = [];
  const keptFromDb = [];
  const sentIds = new Set();

  for (const item of Array.isArray(incoming) ? incoming : []) {
    if (!item || typeof item !== "object") continue;
    const id = String(item.id ?? "");
    sentIds.add(id);
    const current = storedById.get(id);

    if (!current) {
      items.push({ ...item, [CHANGED_AT]: now });
      continue;
    }
    if (stableJson(item) === stableJson(current)) {
      items.push(current);
      continue;
    }
    if (changedSinceClientRead(current)) {
      keptFromDb.push(id);
      items.push(current);
      continue;
    }
    items.push({ ...item, [CHANGED_AT]: now });
  }

  // Anything the payload left out that the client cannot have seen yet -
  // typically a shipment another session created since - is put back at the
  // front, where a newly created shipment belongs (createShipment() in
  // StoreContext.js prepends).
  const unseen = stored.filter((item) => !sentIds.has(String(item.id)) && changedSinceClientRead(item));
  unseen.forEach((item) => keptFromDb.push(String(item.id)));

  return { items: [...unseen, ...items], keptFromDb };
}

// Only "users" is still mirrored (see LEGACY_COLLECTIONS in models/appData.js
// for why), so this only ever needs to resolve that one key.
const derivedRows = (collection, data) => (collection === "users" ? data.users : null) || [];

/**
 * Mirrors the frontend's lists into the legacy/domain collections. Unlike
 * saveList() below (the primary cms_* path), this used to only upsert -
 * records the frontend deleted were never removed from the legacy
 * collection, so a shipment/settlement/etc. that was deleted through the
 * app would live on forever in `shipments`, `invoices`, `driversettlements`
 * and the rest. This now deletes stale rows the same way saveList() does,
 * so a legacy collection can never disagree with the current app state.
 */
const mirrorLegacyCollections = async (data) => {
  const mirrored = {};
  const errors = {};
  for (const [collection, sourceKey] of Object.entries(LEGACY_COLLECTIONS)) {
    try {
      const Model = getLegacyModel(collection);
      const rawRows = derivedRows(collection, data).filter((row) => row && typeof row === "object");
      const idFor = (row, index) => String(row.id ?? `${collection}-${index + 1}`);
      // Same duplicate-key hazard as saveList() above: de-dup by the exact
      // key this collection is upserted on (email for "users", id for
      // everything else) so two rows sharing that key can never race each
      // other inside one unordered bulk write - last occurrence wins.
      const dedupKey = (row, index) => (collection === "users" && row.email ? `email:${row.email.toLowerCase()}` : `id:${idFor(row, index)}`);
      const dedupedRows = [...new Map(rawRows.map((row, index) => [dedupKey(row, index), row])).values()];
      const rows = dedupedRows;
      const operations = rows.map((row, index) => {
        const id = idFor(row, index);
        const filter = collection === "users" && row.email ? { email: row.email.toLowerCase() } : { id };
        return { updateOne: { filter, update: { $set: { ...row, id, __order: index } }, upsert: true } };
      });
      // "users" also holds real login accounts created directly by
      // authController.register() that never pass through this mirror (e.g.
      // an account created before its owner appears in the frontend's users
      // list) - deleting by "not in this payload" would wipe those, so that
      // one collection stays upsert-only, same as before.
      if (collection !== "users") {
        const keepIds = rows.map((row, index) => idFor(row, index));
        operations.push({ deleteMany: { filter: { id: { $nin: keepIds } } } });
      }
      if (operations.length) await Model.bulkWrite(operations, { ordered: false });
      mirrored[collection] = rows.length;
    } catch (error) {
      // This is a best-effort compatibility mirror for the unused legacy
      // REST modules, not the source of truth (that's the cms_* save above,
      // which already completed before this runs). A handful of these
      // collection names collide with a real, differently-shaped Mongoose
      // model that enforces its own constraints the blob's rows don't
      // satisfy (e.g. ApiKey requires a unique `key` field the frontend's
      // apiKeys list doesn't have) - one such failure must never make the
      // caller think their actual save (which already succeeded) failed.
      errors[collection] = error?.message || String(error);
    }
  }
  return { mirrored, errors };
};

/**
 * GET /api/app-data - full snapshot for the React store.
 *
 * Requires authentication (see appDataRoutes.js). Staff roles (admin,
 * finance, dispatcher) receive the full, unrestricted snapshot - every one
 * of their routed pages legitimately spans multiple lists. Merchant, driver
 * and customer receive only their own data (see utils/roleScope.js for the
 * exact ownership rules, audited directly against every page each role can
 * reach). `empty`/`total` always describe the TRUE, system-wide state
 * (used to decide whether to seed a brand-new database) - they are computed
 * before scoping, so a merchant with zero shipments is never mistaken for
 * "the whole system is empty".
 */
const getAppData = async (req, res) => {
  try {
    const snapshot = {};
    let total = 0;

    await Promise.all(
      APP_KEYS.map(async (key) => {
        const list = await loadList(key);
        snapshot[key] = list;
        total += list.length;
      })
    );

    const scope = buildScopeContext(req, { drivers: snapshot.drivers, shipments: snapshot.shipments });
    const data = scopeSnapshotForRead(snapshot, scope);

    return res.status(200).json({
      success: true,
      empty: total === 0,
      total,
      // The server time this snapshot was read. The client echoes it back on
      // every save so reconcileShipmentWrite() can tell which records it has
      // actually seen - without it, a save cannot be distinguished from a
      // stale one.
      asOf: new Date().toISOString(),
      data,
    });
  } catch (error) {
    return fail(res, error, "Failed to load application data");
  }
};

/** PUT /api/app-data - save the full snapshot. */
const saveAppData = async (req, res) => {
  try {
    const payload = req.body?.data || req.body || {};
    const admin = isAdmin(req);
    const adminOrFinance = isAdminOrFinance(req);
    const saved = {};
    const rejected = [];

    // Only built (and only costs the two extra reads) for non-staff roles -
    // staff bypass ownership checks entirely, same as before.
    let scope = null;
    if (!isStaff(req)) {
      const [drivers, shipments] = await Promise.all([loadList("drivers"), loadList("shipments")]);
      scope = buildScopeContext(req, { drivers, shipments });
    }

    // Every role's client sends the full 25-list snapshot on every save
    // (StoreContext.js keeps one shared object in memory), so a non-admin
    // request routinely still carries an unchanged copy of lists it isn't
    // allowed to touch. Silently skipping/reconciling those keys re-persists
    // nothing unauthorized for them (harmless - it's the same data already
    // in MongoDB, or their own data merged back in) while guaranteeing a
    // non-privileged session can never be the one to actually change them.
    const effectivePayload = {};
    for (const key of APP_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;

      // The five static tier checks below are the role-DEFAULT decision.
      // A user with an explicit `permissions` override (utils/permissionMatrix.js
      // - unused by every seeded account today, but a real, tested
      // enforcement path for whenever an admin UI or direct DB edit sets
      // one) can override that default either way for this exact key:
      // `true` grants full, unrestricted write access to it (bypassing
      // ownership scoping too - an explicit override is a deliberate,
      // whole-permission-set replacement, not a narrow exception), `false`
      // denies it even to an otherwise-permitted role.
      const staticRejected =
        (!admin && ADMIN_ONLY_WRITE_KEYS.has(key)) ||
        (!adminOrFinance && FINANCE_WRITE_KEYS.has(key)) ||
        (!isStaff(req) && STAFF_ONLY_WRITE_KEYS.has(key)) ||
        (isStaff(req) && !admin && ADMIN_OR_OWNER_ONLY_WRITE_KEYS.has(key)) ||
        (roleOf(req) === "finance" && FINANCE_EXCLUDED_WRITE_KEYS.has(key));
      const permissionOverride = hasExplicitPermission(req.user, `${key}:write`);
      if (permissionOverride === true) {
        effectivePayload[key] = payload[key];
        continue;
      }
      if (permissionOverride === false || (permissionOverride === null && staticRejected)) {
        rejected.push(key);
        continue;
      }
      if (scope && SCOPED_OWNERSHIP[key]) {
        const currentItems = await loadList(key);
        effectivePayload[key] = reconcileScopedWrite(key, payload[key], currentItems, scope);
        continue;
      }
      if (scope && APPEND_ONLY_FOR_SCOPED.has(key)) {
        const currentItems = await loadList(key);
        effectivePayload[key] = reconcileAppendOnlyWrite(payload[key], currentItems);
        continue;
      }
      effectivePayload[key] = payload[key];
    }

    if (Object.prototype.hasOwnProperty.call(effectivePayload, "drivers")) {
      effectivePayload.drivers = await keepDriverAvailabilityFromDb(effectivePayload.drivers);
    }

    // Shipment records the requester's snapshot is too old to speak for are
    // kept as the database has them (see reconcileShipmentWrite above).
    let staleShipmentIds = [];
    if (Object.prototype.hasOwnProperty.call(effectivePayload, "shipments")) {
      const merged = await reconcileShipmentWrite(effectivePayload.shipments, req.body?.asOf);
      effectivePayload.shipments = merged.items;
      staleShipmentIds = merged.keptFromDb;
    }

    // Authoritative validation happens after ownership/permission filtering
    // (above) but before ANY write (below) - an invalid shipments list
    // rejects the whole request with nothing persisted, for this key or any
    // other key that was part of the same save.
    const validationContext = await buildValidationContext(effectivePayload, req);
    for (const key of Object.keys(effectivePayload)) {
      if (rejectIfInvalid(res, key, effectivePayload[key], validationContext[key])) return;
    }

    // Each key writes to its own independent collection, so these run
    // together rather than one after another. Sequentially this cost one full
    // network round trip per list against a remote Atlas cluster (~186ms
    // each, measured) - 25 of them on every single save, which is a large
    // part of what pushed a normal save past the client's request timeout.
    await Promise.all(
      Object.keys(effectivePayload).map(async (key) => {
        saved[key] = await saveList(key, effectivePayload[key]);
      })
    );

    // A driver's operational availability (drivers[].status: Available /
    // Delivering / Offline) must reflect their REAL active shipment count
    // regardless of who saved the shipments list or whether that caller was
    // even allowed to write `drivers` at all (drivers is staff-only-write -
    // see STAFF_ONLY_WRITE_KEYS above - so a driver's own optimistic local
    // update to their own status, made when they complete a delivery via
    // PodCapturePage.jsx, was previously silently dropped by that same
    // restriction, leaving them stuck showing "Delivering" forever after
    // their last active shipment was completed). Running this
    // unconditionally, server-side, after every shipments save fixes that
    // at the root - independent of frontend optimistic state and of which
    // role performed the save.
    if (Object.prototype.hasOwnProperty.call(effectivePayload, "shipments")) {
      await reconcileDriverAvailability(effectivePayload.shipments);
    }

    // Mirroring must never see a key this request was not allowed to
    // change. Only guarding this for "scope" (non-staff) requests was a
    // bug: a dispatcher or finance session is "staff" (scope stays null,
    // since they bypass ownership checks) but can still have specific keys
    // rejected above (a dispatcher writing `settlements`, finance writing
    // `users` or `webhooks`) - and mirrorLegacyCollections() derives
    // several legacy collections directly from those exact keys. Using the
    // raw payload for mirroring in that case let a REJECTED write still
    // reach a legacy collection - and for `users`, mirrorLegacyCollections
    // deliberately upserts-by-email into the SAME collection real login
    // accounts live in, so a rejected fake user write was able to insert a
    // password-less document there. Whenever anything was rejected
    // (always true for merchant/driver/customer, since ADMIN_ONLY_WRITE_KEYS
    // alone guarantees that; sometimes true for finance/dispatcher), the
    // mirror payload is built from the CURRENT authoritative state for
    // every key, with only this request's actually-allowed changes
    // (effectivePayload) applied on top - never the requester's raw payload
    // for a key they were just refused.
    let mirrorPayload = payload;
    if (rejected.length > 0) {
      const fullCurrent = {};
      await Promise.all(APP_KEYS.map(async (k) => { fullCurrent[k] = await loadList(k); }));
      mirrorPayload = { ...fullCurrent, ...effectivePayload };
    }
    const { mirrored, errors: mirrorErrors } = await mirrorLegacyCollections(mirrorPayload);

    return res.status(200).json({
      success: true,
      message: "Application data saved to MongoDB",
      saved,
      mirrored,
      mirrorErrors: Object.keys(mirrorErrors).length ? mirrorErrors : undefined,
      rejected: rejected.length ? rejected : undefined,
      // Shipments whose stored copy was newer than this snapshot, so the
      // database's version was kept. The client reloads when it sees these,
      // which is how a screen that had gone stale catches up.
      stale: staleShipmentIds.length ? staleShipmentIds : undefined,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    return fail(res, error, "Failed to save application data");
  }
};

/** GET /api/app-data/:entity - one list only. Not called by the frontend
 * today (it only ever uses the full-snapshot GET), kept consistent anyway
 * so a direct API request can't bypass the same-role scoping. */
const getEntity = async (req, res) => {
  try {
    const { entity } = req.params;
    if (!APP_KEYS.includes(entity)) {
      return res.status(404).json({ success: false, message: `Unknown collection "${entity}"` });
    }
    if (!isStaff(req)) {
      // scopeSnapshotForRead() cross-references shipments/drivers regardless
      // of which single entity was asked for (e.g. a merchant's visible
      // `drivers` subset is derived from their own shipments), so both are
      // loaded here even though only one of them may be the requested entity.
      const [drivers, shipments] = await Promise.all([loadList("drivers"), loadList("shipments")]);
      const full = { drivers, shipments, [entity]: entity === "drivers" || entity === "shipments" ? undefined : await loadList(entity) };
      const scope = buildScopeContext(req, { drivers, shipments });
      const scoped = scopeSnapshotForRead(full, scope);
      return res.status(200).json({ success: true, count: scoped[entity].length, data: scoped[entity] });
    }
    const data = await loadList(entity);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return fail(res, error, "Failed to load collection");
  }
};

/** PUT /api/app-data/:entity - replace one list. */
const saveEntity = async (req, res) => {
  try {
    const { entity } = req.params;
    if (!APP_KEYS.includes(entity)) {
      return res.status(404).json({ success: false, message: `Unknown collection "${entity}"` });
    }
    if (ADMIN_ONLY_WRITE_KEYS.has(entity) && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: `Only an admin account can modify "${entity}"` });
    }
    if (FINANCE_WRITE_KEYS.has(entity) && !isAdminOrFinance(req)) {
      return res.status(403).json({ success: false, message: `Only admin or finance can modify "${entity}"` });
    }
    if (STAFF_ONLY_WRITE_KEYS.has(entity) && !isStaff(req)) {
      return res.status(403).json({ success: false, message: `Only staff can modify "${entity}"` });
    }
    if (ADMIN_OR_OWNER_ONLY_WRITE_KEYS.has(entity) && isStaff(req) && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: `Only an admin account or the owning merchant can modify "${entity}"` });
    }
    if (roleOf(req) === "finance" && FINANCE_EXCLUDED_WRITE_KEYS.has(entity)) {
      return res.status(403).json({ success: false, message: `Finance accounts cannot modify "${entity}"` });
    }
    const items = Array.isArray(req.body) ? req.body : req.body?.data;
    let toSave = items || [];
    if (!isStaff(req) && (SCOPED_OWNERSHIP[entity] || APPEND_ONLY_FOR_SCOPED.has(entity))) {
      const [drivers, shipments, currentItems] = await Promise.all([loadList("drivers"), loadList("shipments"), loadList(entity)]);
      const scope = buildScopeContext(req, { drivers, shipments });
      toSave = SCOPED_OWNERSHIP[entity]
        ? reconcileScopedWrite(entity, toSave, currentItems, scope)
        : reconcileAppendOnlyWrite(toSave, currentItems);
    }

    if (entity === "drivers") {
      toSave = await keepDriverAvailabilityFromDb(toSave);
    }

    let staleShipmentIds = [];
    if (entity === "shipments") {
      const merged = await reconcileShipmentWrite(toSave, req.body?.asOf);
      toSave = merged.items;
      staleShipmentIds = merged.keptFromDb;
    }

    const validationContext = await buildValidationContext({ [entity]: toSave }, req);
    if (rejectIfInvalid(res, entity, toSave, validationContext[entity])) return;
    const count = await saveList(entity, toSave);
    if (entity === "shipments") {
      await reconcileDriverAvailability(toSave);
    }
    return res.status(200).json({
      success: true,
      message: `${entity} saved`,
      count,
      stale: staleShipmentIds.length ? staleShipmentIds : undefined,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    return fail(res, error, "Failed to save collection");
  }
};

/**
 * POST /api/app-data/webhooks/:id/test - fires a REAL outbound HTTP POST at
 * the webhook's configured URL and reports back what actually happened.
 * Previously frontend/src/context/StoreContext.js testWebhook() never made
 * any network call at all - it resolved after a fixed delay with a
 * `Math.random() > 0.15` coin flip, purely a client-side simulation. This
 * makes the "Test" button on admin/WebhooksPage.jsx a real delivery
 * attempt; the frontend still owns writing the returned result into the
 * `webhooks` list (unchanged - it flows through the normal PUT /api/app-data
 * autosave like every other edit), this endpoint only performs the attempt.
 * Restricted to admin because only admin can create/edit a webhook's target
 * URL (ADMIN_ONLY_WRITE_KEYS) - allowing any other role to trigger a
 * request to an admin-configured URL would not itself be a new privilege
 * (the URL is fixed, not caller-supplied), but there is no legitimate
 * non-admin caller of this UI action, so it is scoped consistently.
 */
const testWebhookById = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Only an admin account can test a webhook" });
    }
    const { id } = req.params;
    const Model = getAppModel("webhooks");
    const doc = await Model.findOne({ id }).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Webhook not found" });
    }
    if (!doc.url || typeof doc.url !== "string") {
      return res.status(400).json({ success: false, message: "This webhook has no target URL configured" });
    }

    const payload = {
      event: "webhook.test",
      webhookId: id,
      timestamp: new Date().toISOString(),
      message: "Test delivery from Courier Management System",
    };

    let status;
    let responseCode;
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000);
      const response = await fetch(doc.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });
      clearTimeout(timeoutId);
      responseCode = response.status;
      status = response.ok ? "Delivered" : "Failed";
    } catch (deliveryError) {
      // Unreachable host, connection refused, timeout, TLS error, etc. - a
      // failed delivery attempt is an expected, normal outcome here, not a
      // server error, so this always responds 200 with status "Failed"
      // rather than propagating the network error as a 500.
      status = "Failed";
      responseCode = 0;
    }

    return res.status(200).json({ success: true, result: { status, responseCode, timestamp: new Date().toISOString() } });
  } catch (error) {
    return fail(res, error, "Failed to test webhook");
  }
};

/**
 * PUT /api/app-data/drivers/:id/location - a driver's own real, live
 * coordinates (FR-24 previously had no real GPS ingestion path at all -
 * dispatcher/LiveTrackingPage.jsx only ever rendered a random-walk
 * simulation). This deliberately bypasses the normal blob save path
 * (`drivers` is in STAFF_ONLY_WRITE_KEYS, so no driver could ever write
 * here through PUT /api/app-data) with a narrow, single-field update - the
 * same pattern already used for POD photo upload and webhook testing: a
 * small dedicated endpoint for one real-world action a scoped role
 * legitimately needs to perform, rather than loosening the blob-wide
 * permission model. A driver may only ever write their OWN record (matched
 * the same way roleScope.js resolves it for reads), and only the single
 * latest point is kept - no historical trail is stored, so there is no
 * location history to leak later.
 */
const updateDriverLocation = async (req, res) => {
  try {
    if (roleOf(req) !== "driver") {
      return res.status(403).json({ success: false, message: "Only a driver account can share a driver location" });
    }
    const { id } = req.params;
    const drivers = await loadList("drivers");
    const driverBlobId = resolveDriverBlobId(drivers, req.user);
    if (!driverBlobId || driverBlobId !== id) {
      return res.status(403).json({ success: false, message: "You can only update your own location" });
    }

    const { lat, lng, accuracy } = req.body || {};
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90 || !Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({ success: false, message: "lat/lng must be valid coordinates" });
    }
    const accuracyNum = Number(accuracy);

    const Model = getAppModel("drivers");
    await Model.updateOne(
      { id: driverBlobId },
      { $set: { liveLocation: { lat: latNum, lng: lngNum, accuracy: Number.isFinite(accuracyNum) ? accuracyNum : null, updatedAt: new Date().toISOString() } } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return fail(res, error, "Failed to update driver location");
  }
};

/**
 * PUT /api/app-data/drivers/:id/availability - setting a driver's
 * OPERATIONAL AVAILABILITY (Available / Offline), distinct from and never
 * touching `accountStatus` (Admin's ban/enable, portal-access control -
 * see setDriverAccountStatus() in StoreContext.js / admin/DriversPage.jsx,
 * completely untouched by this endpoint).
 *
 * Callable by the driver themselves, for their own record only, and by an
 * admin for any driver (admin/DriversPage.jsx has an online/offline control
 * per row). It must stay the ONLY write path for this field for both of
 * them: the bulk blob save deliberately refuses to carry driver
 * availability at all (keepDriverAvailabilityFromDb() above always restores
 * the stored value over whatever a staff snapshot sent), because a staff
 * browser's copy of the drivers list is routinely older than the database
 * and would silently put a driver who just went offline back online. An
 * admin toggle wired to a normal save would therefore appear to work and
 * then revert on the next reload - which is why the equivalent control on
 * dispatcher/ActiveDriversPage.jsx was commented out rather than fixed.
 *
 * `drivers` is staff-only-write for the bulk blob save (STAFF_ONLY_WRITE_KEYS
 * above) - that restriction exists to stop a driver's partial/scoped local
 * copy of the FULL drivers list from ever overwriting other drivers'
 * records, and it is correct to keep for that path. But it also meant a
 * driver could never persist even a change to their OWN single field,
 * which is exactly why their status appeared to silently revert after a
 * refresh. This endpoint is the same narrow, single-field, ownership-
 * checked exception already used for updateDriverLocation() above -
 * bypasses that blanket restriction for exactly one field on exactly the
 * caller's own record, identified from the JWT via resolveDriverBlobId()
 * (never from the URL's :id alone - the URL value is only ever compared
 * against, never trusted).
 *
 * All three operational states (Available / Delivering / Offline) can be set
 * here. "Delivering" is still maintained
 * automatically from their real active-shipment count (see
 * reconcileDriverAvailability() above and assignDriver() in
 * StoreContext.js) so a driver who never touches this card always shows the
 * true picture - but that automatic upkeep no longer overrides a state the
 * driver has deliberately chosen. Previously "Delivering" was rejected here
 * outright and any manual Available/Offline was refused with a 409 while a
 * delivery was open, which left a driver holding active work unable to
 * change their state at all.
 */
const updateDriverAvailability = async (req, res) => {
  try {
    const role = roleOf(req);
    if (role !== "driver" && role !== "admin") {
      return res.status(403).json({ success: false, message: "Only a driver or an admin account can set driver availability" });
    }
    const { id } = req.params;
    const drivers = await loadList("drivers");

    // A driver is resolved from their JWT and may only ever write their own
    // record - the URL's :id is compared against, never trusted. An admin
    // manages every driver, so for them the :id is the target and only has
    // to name a driver that exists.
    let driverBlobId;
    if (role === "driver") {
      driverBlobId = resolveDriverBlobId(drivers, req.user);
      if (!driverBlobId || driverBlobId !== id) {
        return res.status(403).json({ success: false, message: "You can only change your own availability" });
      }
    } else {
      if (!drivers.some((driver) => driver.id === id)) {
        return res.status(404).json({ success: false, message: "Driver not found" });
      }
      driverBlobId = id;
    }

    const { availability } = req.body || {};
    if (!DRIVER_AVAILABILITY_VALUES.includes(availability)) {
      return res.status(400).json({ success: false, message: `availability must be one of ${DRIVER_AVAILABILITY_VALUES.map((value) => `"${value}"`).join(", ")}` });
    }

    // The choice is stored together with the active-delivery count it was
    // made against, which is what lets reconcileDriverAvailability() tell
    // "a person has decided this" from "this record is just stale" without
    // needing any extra event: the choice stands while that count still
    // matches, and expires by itself the moment their real workload changes.
    // `availabilitySetByDriver` marks a deliberate human choice - the
    // driver's own or an admin's on their behalf - not merely who sent it;
    // both must survive the automatic upkeep the same way, so an admin
    // setting a driver Offline mid-round is not flipped straight back to
    // "Delivering" by the next shipments save.
    const ShipmentModel = getAppModel("shipments");
    const activeCount = await ShipmentModel.countDocuments({ driverId: driverBlobId, status: "OUT_FOR_DELIVERY" });

    const DriverModel = getAppModel("drivers");
    await DriverModel.updateOne(
      { id: driverBlobId },
      { $set: { status: availability, availabilitySetByDriver: true, availabilitySetWithActiveCount: activeCount } }
    );

    return res.status(200).json({ success: true, status: availability, activeDeliveries: activeCount });
  } catch (error) {
    return fail(res, error, "Failed to update driver availability");
  }
};

/**
 * POST /api/app-data/notifications/:id/dispatch - attempts a REAL external
 * delivery (SMS/Email/WhatsApp, via services/notificationDispatcher.js) for
 * one already-persisted notificationsOutbox entry, then records the exact
 * outcome back onto that same document - "not_configured" with the precise
 * missing env vars if no provider credentials exist (the honest, correct
 * result in this environment), "Delivered" if a real provider accepted it,
 * "Failed" if a real provider rejected it. Never fabricates success. Any
 * authenticated role may call this (StoreContext.js's pushNotification()
 * fires it automatically for every notification it creates - drivers,
 * merchants and customers all trigger real business events that generate
 * notifications), so there is no ownership check beyond authentication -
 * the notification content itself was already determined server-side from
 * a template, not from this request's body.
 */
const dispatchNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const Model = getAppModel("notificationsOutbox");
    const doc = await Model.findOne({ id }).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const result = await dispatchExternalNotification({ channel: doc.channel, to: doc.to, body: doc.body });
    const externalStatus = result.delivered ? "Delivered" : result.attempted ? "Failed" : "Not configured";

    await Model.updateOne(
      { id },
      { $set: { externalDeliveryStatus: externalStatus, externalDeliveryReason: result.reason || null, externalDeliveryMissingEnvVars: result.missingEnvVars || null, externalDeliveryAttemptedAt: new Date().toISOString() } }
    );

    return res.status(200).json({ success: true, result: { ...result, status: externalStatus } });
  } catch (error) {
    return fail(res, error, "Failed to dispatch notification");
  }
};

/** GET /api/app-data/meta/collections - handy for debugging. */
const getCollectionMap = async (req, res) => {
  try {
    const counts = {};
    await Promise.all(
      APP_KEYS.map(async (key) => {
        const Model = getAppModel(key);
        counts[key] = { collection: APP_COLLECTIONS[key], documents: await Model.countDocuments({}) };
      })
    );
    return res.status(200).json({ success: true, data: counts });
  } catch (error) {
    return fail(res, error, "Failed to read collection map");
  }
};


/**
 * GET /api/app-data/shipments/failed-rto
 *
 * The merchant's failed and returned shipments, and the count behind the
 * "Failed / RTO" card on their dashboard.
 *
 * The count is computed by MongoDB (countDocuments with the status filter),
 * not by counting rows the browser happens to have loaded, so it describes
 * the real database state even when the list is paged or filtered.
 *
 * MERCHANT ISOLATION: the owning merchant is taken from the verified JWT and
 * written into the QUERY ITSELF (`senderName: <their name>`), so another
 * merchant's shipments are never fetched in the first place - they are not
 * fetched-then-hidden. A merchant cannot widen it either: the `merchant`
 * query parameter is only honoured for staff, and is ignored for a merchant
 * account, which is always pinned to its own name.
 */
const getFailedRtoShipments = async (req, res) => {
  try {
    const role = roleOf(req);
    const isStaffViewer = isStaff(req);
    if (role !== "merchant" && !isStaffViewer) {
      return res.status(403).json({ success: false, message: "Not allowed to read merchant failed/RTO shipments" });
    }

    // A merchant is ALWAYS pinned to their own name from the token. Staff may
    // look at one merchant by name, or leave it off to see every merchant's.
    const merchantName = role === "merchant"
      ? String(req.user?.merchantName || "")
      : String(req.query.merchant || "").trim();

    if (role === "merchant" && !merchantName) {
      return res.status(400).json({
        success: false,
        message: "This account is not linked to a merchant, so its shipments cannot be identified.",
      });
    }

    const ShipmentModel = getAppModel("shipments");
    const ownerFilter = merchantName ? { senderName: merchantName } : {};
    const activeFilter = { ...ownerFilter, status: { $in: ACTIVE_FAILED_RTO_STATUSES } };

    const [activeCount, completedCount, docs] = await Promise.all([
      ShipmentModel.countDocuments(activeFilter),
      ShipmentModel.countDocuments({ ...ownerFilter, status: "RTO_COMPLETED" }),
      ShipmentModel.find({ ...ownerFilter, status: { $in: [...ACTIVE_FAILED_RTO_STATUSES, "RTO_COMPLETED"] } })
        .sort({ __order: 1 })
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      // What the dashboard card shows. RTO_COMPLETED is excluded: the parcel
      // is back with the merchant, so nothing is outstanding.
      needsAttention: activeCount,
      rtoCompleted: completedCount,
      total: activeCount + completedCount,
      data: docs.map(stripInternals),
    });
  } catch (error) {
    return fail(res, error, "Failed to load failed/RTO shipments");
  }
};

module.exports = { getAppData, saveAppData, getEntity, saveEntity, getCollectionMap, testWebhookById, updateDriverLocation, updateDriverAvailability, dispatchNotification, getFailedRtoShipments };
