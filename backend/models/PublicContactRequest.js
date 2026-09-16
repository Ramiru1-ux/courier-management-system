const mongoose = require("mongoose");

/**
 * Real persistence for the public "Contact support" form
 * (frontend/src/pages/public/ContactSupportPage.jsx), submitted by
 * anonymous visitors with no account. Deliberately its own small, plain
 * collection (cms_public_contact_requests) rather than folded into the
 * authenticated `supportTickets` blob list - that list's read/write path
 * (GET/PUT /api/app-data) requires a signed-in session end to end, and an
 * anonymous submission has no session to scope by ownership against.
 */
const publicContactRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, default: "New" },
    submittedIp: { type: String, default: "" },
  },
  { collection: "cms_public_contact_requests", timestamps: true, versionKey: false }
);

module.exports = mongoose.models.PublicContactRequest || mongoose.model("PublicContactRequest", publicContactRequestSchema);
