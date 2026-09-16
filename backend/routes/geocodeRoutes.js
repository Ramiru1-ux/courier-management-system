const express = require("express");
const controller = require("../controllers/geocodeController");
const { authenticate } = require("../middleware/authMiddleware");
const { createRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Defense in depth on top of geocodingService.js's own global ~1req/sec
// throttle to Nominatim - this bounds how much of that shared budget any
// one user's session can consume.
const geocodeLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, keyGenerator: (req) => req.user?.id || req.ip });

router.get("/", authenticate, geocodeLimiter, controller.geocode);

module.exports = router;
