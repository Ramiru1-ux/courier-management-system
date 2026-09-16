const { APP_KEYS, APP_COLLECTIONS, LEGACY_COLLECTIONS, getAppModel, getLegacyModel, stripInternals } = require("../models/appData");
const { STAFF_ROLES, buildScopeContext, scopeSnapshotForRead, reconcileScopedWrite, reconcileAppendOnlyWrite, SCOPED_OWNERSHIP, resolveDriverBlobId } = require("../utils/roleScope");
const { validateShipmentsList } = require("../validators/shipmentDataValidator");
const { dispatchExternalNotification } = require("../services/notificationDispatcher");
const { hasExplicitPermission } = require("../utils/permissionMatrix");

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
async function buildValidationContext(effectivePayload) {
  const context = {};
  if (Object.prototype.hasOwnProperty.call(effectivePayload, "shipments")) {
    const [drivers, currentShipments] = await Promise.all([loadList("drivers"), loadList("shipments")]);
    context.shipments = { drivers, currentById: new Map(currentShipments.map((s) => [String(s.id), s])) };
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
  const activeDriverIds = new Set(
    (finalShipments || [])
      .filter((s) => s && s.status === "OUT_FOR_DELIVERY" && s.driverId)
      .map((s) => s.driverId)
  );
  const DriverModel = getAppModel("drivers");
  await DriverModel.updateMany(
    { status: "Delivering", id: { $nin: [...activeDriverIds] } },
    { $set: { status: "Available" } }
  );
}

const derivedRows = (collection, data) => {
  const directRows = {
    addresses: data.addresses,
    apikeys: data.apiKeys,
    auditlogs: data.auditLogs,
    branches: data.branches,
    complaints: data.complaints,
    drivers: data.drivers,
    invoices: data.invoices,
    manifests: data.manifests,
    organizations: data.organizations,
    payments: data.payments,
    ratings: data.ratings,
    shipments: data.shipments,
    users: data.users,
    vehicles: data.vehicles,
    webhooks: data.webhooks,
  };
  const sourceByCollection = {
    codtransactions: data.settlements || [],
    customers: (data.shipments || []).map((shipment) => ({
      id: `customer-${shipment.recipientName || shipment.id}`,
      name: shipment.recipientName,
      phone: shipment.recipientPhone,
      address: shipment.recipientAddress,
      city: shipment.recipientCity,
    })),
    deliveries: (data.shipments || []).filter((shipment) => shipment.driverId),
    driversettlements: data.driverReconciliation || [],
    hubs: data.branches || [],
    merchantsettlements: data.settlements || [],
    merchants: (data.settlements || []).map((settlement) => ({ id: `merchant-${settlement.merchant}`, name: settlement.merchant })),
    notifications: data.notificationsOutbox || [],
    packages: (data.shipments || []).map((shipment) => ({ id: `package-${shipment.id}`, shipmentId: shipment.id, trackingNumber: shipment.trackingNumber, weight: shipment.weight, value: shipment.codAmount })),
    permissions: [],
    pickups: (data.shipments || []).filter((shipment) => shipment.status === "CREATED"),
    pricingrules: data.pricingRules || [],
    proofofdeliveries: data.podRecords || [],
    roles: [...new Set((data.users || []).map((user) => user.role))].filter(Boolean).map((role) => ({ id: `role-${role}`, name: role })),
    routes: data.manifests || [],
    servicezones: data.zones || [],
    subscriptions: data.organizations || [],
    systemsettings: [],
  };
  return sourceByCollection[collection] || directRows[collection] || [];
};

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

    // Authoritative validation happens after ownership/permission filtering
    // (above) but before ANY write (below) - an invalid shipments list
    // rejects the whole request with nothing persisted, for this key or any
    // other key that was part of the same save.
    const validationContext = await buildValidationContext(effectivePayload);
    for (const key of Object.keys(effectivePayload)) {
      if (rejectIfInvalid(res, key, effectivePayload[key], validationContext[key])) return;
    }

    for (const key of Object.keys(effectivePayload)) {
      saved[key] = await saveList(key, effectivePayload[key]);
    }

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
    const validationContext = await buildValidationContext({ [entity]: toSave });
    if (rejectIfInvalid(res, entity, toSave, validationContext[entity])) return;
    const count = await saveList(entity, toSave);
    if (entity === "shipments") {
      await reconcileDriverAvailability(toSave);
    }
    return res.status(200).json({ success: true, message: `${entity} saved`, count });
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
 * PUT /api/app-data/drivers/:id/availability - a driver setting their own
 * OPERATIONAL AVAILABILITY (Available / Offline), distinct from and never
 * touching `accountStatus` (Admin's ban/enable, portal-access control -
 * see setDriverAccountStatus() in StoreContext.js / admin/DriversPage.jsx,
 * completely untouched by this endpoint).
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
 * "Delivering" is deliberately NOT an accepted value here - it is a
 * SYSTEM-COMPUTED state (see reconcileDriverAvailability() and
 * assignDriver() in StoreContext.js), not a manual choice, and this
 * endpoint also refuses to let a driver override it away while they still
 * have real active work: if they currently have any shipment with
 * status OUT_FOR_DELIVERY assigned to them, the true state must stay
 * "Delivering" regardless of what they would like to claim.
 */
const updateDriverAvailability = async (req, res) => {
  try {
    if (roleOf(req) !== "driver") {
      return res.status(403).json({ success: false, message: "Only a driver account can set driver availability" });
    }
    const { id } = req.params;
    const drivers = await loadList("drivers");
    const driverBlobId = resolveDriverBlobId(drivers, req.user);
    if (!driverBlobId || driverBlobId !== id) {
      return res.status(403).json({ success: false, message: "You can only change your own availability" });
    }

    const { availability } = req.body || {};
    if (!["Available", "Offline"].includes(availability)) {
      return res.status(400).json({ success: false, message: 'availability must be "Available" or "Offline"' });
    }

    const ShipmentModel = getAppModel("shipments");
    const activeCount = await ShipmentModel.countDocuments({ driverId: driverBlobId, status: "OUT_FOR_DELIVERY" });
    if (activeCount > 0) {
      return res.status(409).json({
        success: false,
        message: `You have ${activeCount} active ${activeCount === 1 ? "delivery" : "deliveries"} in progress - availability updates automatically once they are complete`,
        activeDeliveries: activeCount,
      });
    }

    const DriverModel = getAppModel("drivers");
    await DriverModel.updateOne({ id: driverBlobId }, { $set: { status: availability } });

    return res.status(200).json({ success: true, status: availability });
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

module.exports = { getAppData, saveAppData, getEntity, saveEntity, getCollectionMap, testWebhookById, updateDriverLocation, updateDriverAvailability, dispatchNotification };
