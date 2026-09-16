const express = require("express");
const controller = require("../controllers/publicContactController");
const { createRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Fully public, no auth possible (the submitter has no account) - the only
// real anti-abuse control available is a strict per-IP rate limit. 5/hour
// comfortably covers a real visitor (nobody legitimately submits this form
// repeatedly) while bounding a spam script tightly.
const contactLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

router.post("/", contactLimiter, controller.submitContactRequest);

module.exports = router;
