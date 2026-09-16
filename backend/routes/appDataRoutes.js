const express = require("express");
const controller = require("../controllers/appDataController");
const { authenticate } = require("../middleware/authMiddleware");
const { createRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// This endpoint carries the entire application dataset (every shipment,
// financial record, driver, and API key), so every route here requires a
// valid signed-in session. The public tracking page does NOT use this
// endpoint - it calls GET /api/tracking/:trackingNumber instead, which
// returns only the minimal fields needed to show delivery status
// (see controllers/trackingController.js).
router.use(authenticate);

// The main GET/PUT "/" here is deliberately NOT rate-limited - it is the
// app's own autosave path, called on nearly every keystroke by every
// signed-in session (debounced client-side to ~1 call/700ms, but still far
// more frequent than any other endpoint) - a limiter tuned loose enough not
// to interfere with that would be too loose to stop anything, and one tight
// enough to matter would routinely lock normal users out of saving their
// own work. The two endpoints below are much lower-frequency, deliberate
// user actions where a real limit doesn't cost normal usage anything:
// testing a webhook is an occasional admin click, and every driver's phone
// GPS ping is naturally rate-limited by keyGenerator below to a level a
// real device could never accidentally exceed while still catching a
// scripted flood.
const webhookTestLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 10, keyGenerator: (req) => req.user?.id || req.ip });
const locationLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30, keyGenerator: (req) => req.user?.id || req.ip });
const availabilityLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, keyGenerator: (req) => req.user?.id || req.ip });
// One dispatch attempt fires automatically per notification created (shipment
// created/status changed) - generous enough for a busy shift's worth of real
// shipment activity, tight enough to bound repeated retries against a
// misconfigured or rejecting provider.
const notificationDispatchLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60, keyGenerator: (req) => req.user?.id || req.ip });

router.get("/", controller.getAppData);
router.put("/", controller.saveAppData);
router.get("/meta/collections", controller.getCollectionMap);
router.post("/webhooks/:id/test", webhookTestLimiter, controller.testWebhookById);
router.put("/drivers/:id/location", locationLimiter, controller.updateDriverLocation);
router.put("/drivers/:id/availability", availabilityLimiter, controller.updateDriverAvailability);
router.post("/notifications/:id/dispatch", notificationDispatchLimiter, controller.dispatchNotification);
router.get("/:entity", controller.getEntity);
router.put("/:entity", controller.saveEntity);

module.exports = router;
