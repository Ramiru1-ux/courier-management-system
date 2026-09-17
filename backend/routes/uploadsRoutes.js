const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { podUpload } = require("../config/multerConfig");
const { createRateLimiter } = require("../middleware/rateLimiter");

// Keyed by user id rather than IP (the default) - this route is always
// authenticated, and several drivers can legitimately share one IP (same
// depot Wi-Fi), so an IP-keyed limit would punish all of them for one
// driver's upload volume.
const uploadLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, keyGenerator: (req) => req.user?.id || req.ip });

/**
 * Turns a rejected upload into the exact message the driver sees. Multer
 * reports its own size limit as LIMIT_FILE_SIZE, while the type check in
 * config/multerConfig.js marks its error UNSUPPORTED_FILE_TYPE - the two
 * cases need different wording, and the driver portal shows whichever comes
 * back (frontend/src/utils/uploadValidation.js has the same two messages for
 * the check it does before uploading at all).
 */
const handlePodUploadError = (error, req, res, next) => {
  if (!error) return next();
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "This file is too large. The maximum size is 10MB." });
  }
  if (error.code === "UNSUPPORTED_FILE_TYPE") {
    return res.status(415).json({ success: false, message: error.message });
  }
  return res.status(400).json({ success: false, message: error.message || "File upload failed" });
};

/**
 * POST /api/uploads/pod-photo - stores a real proof-of-delivery photo on
 * disk (the proof-of-delivery multer config in config/multerConfig.js -
 * same upload dir, but limited to JPEG, PNG and PDF files of at most 10MB)
 * and returns its URL for the caller to store in the
 * `podRecords` blob list. Requires authentication - any signed-in role may
 * upload a POD photo (drivers are the only real caller, but there is no
 * ownership concept to check against at upload time, since the shipment
 * association happens client-side when the URL is saved into podRecords).
 */
router.post("/pod-photo", authenticate, uploadLimiter, podUpload.single("photo"), handlePodUploadError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No photo file was uploaded" });
  }
  return res.status(201).json({ success: true, url: `/api/uploads/files/${req.file.filename}` });
});

module.exports = router;
