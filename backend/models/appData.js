const mongoose = require("mongoose");

/**
 * Every screen in the React frontend keeps its data in one of these lists.
 * Each list is stored in its OWN MongoDB collection so you can open
 * MongoDB Compass / Atlas and see real documents per entity.
 *
 *   frontend key            ->  MongoDB collection
 *   shipments               ->  cms_shipments
 *   drivers                 ->  cms_drivers
 *   ...
 */
const APP_COLLECTIONS = {
  addresses: "cms_addresses",
  branches: "cms_branches",
  drivers: "cms_drivers",
  shipments: "cms_shipments",
  settlements: "cms_settlements",
  driverReconciliation: "cms_driver_reconciliation",
  invoices: "cms_invoices",
  payments: "cms_payments",
  refunds: "cms_refunds",
  users: "cms_staff_users",
  auditLogs: "cms_audit_logs",
  vehicles: "cms_vehicles",
  manifests: "cms_manifests",
  pricingRules: "cms_pricing_rules",
  zones: "cms_zones",
  notificationTemplates: "cms_notification_templates",
  supportTickets: "cms_support_tickets",
  complaints: "cms_complaints",
  podRecords: "cms_pod_records",
  ratings: "cms_ratings",
  notificationsOutbox: "cms_notifications_outbox",
  apiKeys: "cms_api_keys",
  webhooks: "cms_webhooks",
  organizations: "cms_organizations",
  subscriptionPlans: "cms_subscription_plans",
};

// Legacy/domain collection names used by the backend models. The frontend
// store uses the cms_* collections, so app-data writes mirror into these
// collections as well for compatibility with the existing API modules.
const LEGACY_COLLECTIONS = {
  addresses: "addresses",
  apikeys: "apiKeys",
  auditlogs: "auditLogs",
  branches: "branches",
  complaints: "complaints",
  drivers: "drivers",
  invoices: "invoices",
  manifests: "manifests",
  organizations: "organizations",
  payments: "payments",
  ratings: "ratings",
  shipments: "shipments",
  users: "users",
  vehicles: "vehicles",
  webhooks: "webhooks",
  // These collections are derived from the frontend lists with the same
  // business meaning and are kept populated for legacy API consumers.
  codtransactions: "codtransactions",
  customers: "customers",
  deliveries: "deliveries",
  driversettlements: "driversettlements",
  hubs: "hubs",
  merchantsettlements: "merchantsettlements",
  merchants: "merchants",
  notifications: "notifications",
  packages: "packages",
  permissions: "permissions",
  pickups: "pickups",
  pricingrules: "pricingrules",
  proofofdeliveries: "proofofdeliveries",
  roles: "roles",
  routes: "routes",
  servicezones: "servicezones",
  subscriptions: "subscriptions",
  systemsettings: "systemsettings",
};

const APP_KEYS = Object.keys(APP_COLLECTIONS);
const cache = {};
const legacyCache = {};

/**
 * Loose ("strict: false") schema on purpose: the frontend owns the shape of
 * each record, so whatever fields a screen sends are stored exactly as sent.
 * Timestamps are OFF because several records already carry their own
 * `createdAt` string and mongoose would overwrite it with a Date.
 */
const getAppModel = (key) => {
  const collection = APP_COLLECTIONS[key];
  if (!collection) return null;
  if (cache[key]) return cache[key];

  const schema = new mongoose.Schema(
    {
      id: { type: String, required: true },
      // Keeps the exact list order the UI expects (newest first, etc).
      __order: { type: Number, default: 0 },
    },
    {
      collection,
      strict: false,
      versionKey: false,
      timestamps: false,
      minimize: false,
    }
  );

  schema.index({ id: 1 }, { unique: true });
  schema.index({ __order: 1 });

  const modelName = `AppData_${key}`;
  cache[key] = mongoose.models[modelName] || mongoose.model(modelName, schema);
  return cache[key];
};

const getLegacyModel = (collection) => {
  if (legacyCache[collection]) return legacyCache[collection];
  const schema = new mongoose.Schema(
    { id: { type: String, required: true }, __order: { type: Number, default: 0 } },
    { collection, strict: false, versionKey: false, timestamps: false, minimize: false },
  );
  const modelName = `LegacyData_${collection}`;
  legacyCache[collection] = mongoose.models[modelName] || mongoose.model(modelName, schema);
  return legacyCache[collection];
};

const stripInternals = (doc) => {
  if (!doc || typeof doc !== "object") return doc;
  const { _id, __order, __v, ...rest } = doc;
  return rest;
};

module.exports = { APP_COLLECTIONS, APP_KEYS, LEGACY_COLLECTIONS, getAppModel, getLegacyModel, stripInternals };
