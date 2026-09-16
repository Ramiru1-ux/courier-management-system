/**
 * The authoritative, server-enforced permission matrix for this
 * application - documentation that describes exactly what
 * appDataController.js and roleScope.js actually enforce, not an aspirational
 * design that isn't wired to anything.
 *
 * This project's real data model is the 25-list blob behind
 * GET/PUT /api/app-data (see models/appData.js), not a REST resource per
 * item, so "permission" here means "which roles may write which list, and
 * under what per-record ownership rule" - the same shape as the actual
 * enforcement code in appDataController.js:
 *   - ADMIN_ONLY_WRITE_KEYS: only role "admin"
 *   - FINANCE_WRITE_KEYS: "admin" or "finance"
 *   - STAFF_ONLY_WRITE_KEYS: any of "admin"/"finance"/"dispatcher"
 *   - ADMIN_OR_OWNER_ONLY_WRITE_KEYS: "admin", or the scoped owner via
 *     SCOPED_OWNERSHIP (roleScope.js) - no other staff role
 *   - SCOPED_OWNERSHIP (roleScope.js): a non-staff role may create/edit only
 *     records it owns (merchant's own shipments/addresses/apiKeys, driver's
 *     own shipments, customer's own complaints/tickets/ratings/payments) -
 *     every other record in that list is preserved untouched no matter what
 *     the request's payload says
 *   - APPEND_ONLY_FOR_SCOPED: a scoped role may only ADD new rows (audit
 *     log, notification outbox, POD records) - never edit or delete an
 *     existing one
 *   - everything else: any authenticated role may write (no ownership
 *     concept applies - e.g. a driver toggling their own availability
 *     inside the staff-writable `drivers` list is filtered by
 *     STAFF_ONLY_WRITE_KEYS instead, not by this catch-all)
 *
 * `admin` always has full read/write access to every list - it is never
 * restricted by anything below.
 *
 * Per-user overrides: the User model (models/User.js) has always had an
 * unused `permissions: [String]` field. `effectivePermissions(user)` makes
 * it real - if populated, it REPLACES that user's role-default permission
 * set entirely (an explicit, deliberate override), so a specific finance
 * account could be granted (or denied) an exception without changing the
 * role-wide default. No admin UI edits this yet (that would be a
 * meaningfully larger feature - a permissions editor screen - than this
 * pass's scope), but the enforcement path is real and already covers the
 * resources listed below; a future admin screen only needs to write to
 * this same field.
 */

const RESOURCE_KEYS = {
  users: "users",
  drivers: "drivers",
  vehicles: "vehicles",
  branches: "branches",
  shipments: "shipments",
  addresses: "addresses",
  finance: ["settlements", "invoices", "refunds", "driverReconciliation", "payments"],
  complaints: "complaints",
  reports: null, // computed client-side from other lists - no separate collection, no separate permission
  apiKeys: "apiKeys",
  webhooks: "webhooks",
  settings: ["pricingRules", "zones", "notificationTemplates", "organizations", "subscriptionPlans"],
  auditLogs: "auditLogs",
};

/** role -> resource -> "full" | "own" | "read" | "none". "own" means
 * SCOPED_OWNERSHIP-enforced (their own records only, verified against the
 * database, never against the request's own payload). This table is a
 * human-readable projection of the Sets/functions above - kept next to them
 * so a change to one is easy to notice as a change needed in the other. */
const PERMISSION_MATRIX = {
  admin: {
    users: "full", drivers: "full", vehicles: "full", branches: "full", shipments: "full",
    addresses: "full", finance: "full", complaints: "full", apiKeys: "full", webhooks: "full",
    settings: "full", auditLogs: "full",
  },
  finance: {
    users: "none", drivers: "none", vehicles: "none", branches: "none", shipments: "read",
    addresses: "read", finance: "full", complaints: "read", apiKeys: "none", webhooks: "none",
    settings: "none", auditLogs: "read",
  },
  dispatcher: {
    users: "none", drivers: "full", vehicles: "read", branches: "read", shipments: "full",
    addresses: "read", finance: "none", complaints: "read", apiKeys: "none", webhooks: "none",
    settings: "none", auditLogs: "read",
  },
  merchant: {
    users: "none", drivers: "read (own shipments only)", vehicles: "none", branches: "read",
    shipments: "own", addresses: "own", finance: "read (own settlements/invoices only)",
    complaints: "none", apiKeys: "own", webhooks: "none", settings: "none", auditLogs: "none",
  },
  driver: {
    users: "none", drivers: "own (self only)", vehicles: "none", branches: "read",
    shipments: "own (assigned only)", addresses: "none", finance: "none", complaints: "none",
    apiKeys: "none", webhooks: "none", settings: "none", auditLogs: "append-only (own actions)",
  },
  customer: {
    users: "none", drivers: "read (own deliveries only)", vehicles: "none", branches: "read",
    shipments: "read (own, as recipient)", addresses: "none",
    finance: "own (own payments only)", complaints: "own", apiKeys: "none", webhooks: "none",
    settings: "none", auditLogs: "none",
  },
};

/** A user's effective permission STRING SET, if they have an override
 * populated - null means "use the role default table above", which is the
 * case for every account in this system today. Format: "resource:action",
 * e.g. "shipments:write", "finance:read". */
function effectivePermissions(user) {
  if (Array.isArray(user?.permissions) && user.permissions.length > 0) {
    return new Set(user.permissions);
  }
  return null; // signals "fall back to role defaults" to any caller
}

/** True if `user` has an explicit override AND it grants `permissionString`
 * (e.g. "webhooks:write"). Returns null (not false) when the user has no
 * override at all, so a caller can tell "explicitly denied" apart from
 * "no override configured - use the role default". */
function hasExplicitPermission(user, permissionString) {
  const overrides = effectivePermissions(user);
  if (!overrides) return null;
  return overrides.has(permissionString);
}

module.exports = { RESOURCE_KEYS, PERMISSION_MATRIX, effectivePermissions, hasExplicitPermission };
