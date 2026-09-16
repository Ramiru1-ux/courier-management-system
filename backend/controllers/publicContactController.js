const PublicContactRequest = require("../models/PublicContactRequest");
const { required, optionalString, email: emailValidator, validationError } = require("../validators/validatorHelpers");

/**
 * POST /api/public-contact - the real backend for the anonymous "Contact
 * support" form. Previously this form's onSubmit just called
 * setSent(true) with no persistence at all, and its inputs were not even
 * wired to React state - a completely fake success response. Now
 * validates real input and persists a real, inspectable record.
 */
const submitContactRequest = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    required(name, "name");
    optionalString(name, "name", 120);
    const normalizedEmail = emailValidator(email, "email");
    required(message, "message");
    optionalString(message, "message", 2000);

    const doc = await PublicContactRequest.create({
      name: String(name).trim(),
      email: normalizedEmail,
      message: String(message).trim(),
      submittedIp: req.ip || "",
    });

    return res.status(201).json({ success: true, message: "Message received", id: String(doc._id) });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message, field: error.field });
    return res.status(500).json({ success: false, message: "Could not submit your message right now" });
  }
};

module.exports = { submitContactRequest };
