const express = require("express");
const controller = require("../controllers/trackingController");
const { optionalAuth } = require("../middleware/authMiddleware");
const { createRateLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

// Fully public + unauthenticated (see below) makes this the one endpoint in
// the whole API anyone on the internet can call with no account at all, so
// it is the one most worth protecting from being scraped or hammered - a
// generous per-IP allowance that a real customer refreshing their own
// tracking page would never come close to.
const publicTrackingLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60 });
// Complaints/reviews are deliberate, occasional form submissions, not a
// page-load lookup - tighter than the tracking limiter is appropriate and
// still far above anything a real customer would need.
const publicSubmissionLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 10 });

router.get("/shipment/:id", optionalAuth, controller.getShipmentTracking);
// Deliberately fully public, no auth check at all - this is the one lookup
// the public "/track" page and the customer portal's tracking page are
// allowed to use without (or before) signing in.
router.get("/:trackingNumber", publicTrackingLimiter, controller.getTrackingByNumber);
router.post("/:trackingNumber/complaint", publicSubmissionLimiter, controller.submitComplaint);
router.post("/:trackingNumber/review", publicSubmissionLimiter, controller.submitReview);
module.exports = router;
