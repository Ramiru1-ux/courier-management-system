const crypto = require("crypto");
const generateTrackingNumber = (prefix = "CMS") => `${String(prefix).toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
const isValidTrackingNumber = (value) => /^[A-Z0-9]+-[0-9]{8}-[A-F0-9]{8}$/.test(String(value || ""));
module.exports = { generateTrackingNumber, createTrackingNumber: generateTrackingNumber, isValidTrackingNumber };
