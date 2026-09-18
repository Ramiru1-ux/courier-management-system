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

// "users" is the ONLY collection still mirrored outside the cms_* set. Every
// other entry that used to live here (addresses, branches, vehicles,
// invoices, shipments, webhooks, codtransactions, customers, deliveries,
// driversettlements, hubs, merchants, merchantsettlements, notifications,
// packages, permissions, pickups, pricingrules, proofofdeliveries, roles,
// routes, servicezones, subscriptions, systemsettings, apikeys, complaints,
// drivers, organizations, payments, ratings) fed a dedicated REST module
// (backend/routes/*Routes.js + controllers/*Controller.js) that nothing -
// not the frontend, not a scheduled job - ever actually called; removing
// them here stops the duplicate plain-named collection each one produced
// alongside its real cms_* counterpart. "users" stays because
// authController.register()/login() read and write real login accounts
// straight to this exact collection - it is not a legacy mirror, it is the
// live auth store, so it keeps being kept in sync with the frontend's users
// list below.
const LEGACY_COLLECTIONS = {
  users: "users",
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
