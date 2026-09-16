const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { uploadSingle, handleUploadError } = require("../middleware/uploadMiddleware");
const { createRateLimiter } = require("../middleware/rateLimiter");

// Keyed by user id rather than IP (the default) - this route is always
// authenticated, and several drivers can legitimately share one IP (same
// depot Wi-Fi), so an IP-keyed limit would punish all of them for one
// driver's upload volume.
const uploadLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, keyGenerator: (req) => req.user?.id || req.ip });

/**
 * POST /api/uploads/pod-photo - stores a real proof-of-delivery photo on
 * disk (reusing the existing multer config in config/multerConfig.js - same
 * upload dir, file-type filter and 5MB size cap already used by the dead
 * legacy REST modules) and returns its URL for the caller to store in the
 * `podRecords` blob list. Requires authentication - any signed-in role may
 * upload a POD photo (drivers are the only real caller, but there is no
 * ownership concept to check against at upload time, since the shipment
 * association happens client-side when the URL is saved into podRecords).
 */
router.post("/pod-photo", authenticate, uploadLimiter, uploadSingle("photo"), handleUploadError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No photo file was uploaded" });
  }
  return res.status(201).json({ success: true, url: `/api/uploads/files/${req.file.filename}` });
});

module.exports = router;
