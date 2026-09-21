const express = require("express");

/**
 * The API surface.
 *
 * ONLY the routes below are mounted, and that is deliberate.
 *
 * This project used to mount ~42 per-entity REST modules (/api/shipments,
 * /api/branches, /api/drivers, /api/invoices, ...). None of them was ever
 * called: no frontend module imports their API clients, no job or service
 * invokes their controllers, and every collection they wrote to was empty
 * while the real data sat in the cms_* collections.
 *
 * They were not merely useless - they were actively harmful, for two
 * reasons:
 *
 *   1. A SECOND SOURCE OF TRUTH. Each defined a Mongoose model for a
 *      business entity the application already stores in a cms_* collection
 *      (models/appData.js). /api/branches wrote to `branches` while the
 *      whole application read `cms_branches`. Two collections, one concept.
 *
 *   2. They created those duplicate collections just by being loaded.
 *      utils/modelFactory.js sets no explicit collection name and no
 *      autoCreate/autoIndex override, so Mongoose's defaults (both true)
 *      mean that merely REQUIRING one of those model files, in a process
 *      that connects to MongoDB, creates its collection and indexes. That
 *      is why 32 empty plain-named collections kept reappearing in the
 *      database however often they were removed.
 *
 * The files themselves are left in place (controllers/, models/, routes/)
 * so nothing is lost and this is reversible - they are simply no longer
 * mounted, so nothing registers their models and nothing recreates their
 * collections. To bring one back, add it to the map below and be aware it
 * will start creating its own collection again.
 *
 * Canonical storage after this change:
 *   - cms_* collections  -> every business entity (via /api/app-data)
 *   - users              -> real login accounts (via /api/auth)
 *   - login_details      -> login/logout audit trail
 *   - cms_public_contact_requests -> public contact form
 */
const routeFiles = {
	// The application's entire data store: all 25 cms_* collections.
	"/app-data": "./appDataRoutes",
	// Authentication against the `users` collection, audited to `login_details`.
	"/auth": "./authRoutes",
	// Public parcel tracking. Reads cms_shipments through models/appData.js.
	"/tracking": "./trackingRoutes",
	// Proof-of-delivery photo upload (writes to disk, not MongoDB).
	"/uploads": "./uploadsRoutes",
	// Address -> coordinates lookup (calls an external provider, no MongoDB).
	"/geocode": "./geocodeRoutes",
	// Public contact form -> cms_public_contact_requests.
	"/public-contact": "./publicContactRoutes",
};

const router = express.Router();
for (const [path, file] of Object.entries(routeFiles)) router.use(path, require(file));

module.exports = router;
