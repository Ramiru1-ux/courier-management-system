const crypto = require("crypto");

const createQrPayload = (value) => Buffer.from(String(value ?? "")).toString("base64url");
const verifyQrPayload = (payload, expected) => Buffer.from(String(payload ?? ""), "base64url").toString("utf8") === String(expected ?? "");
const createQrToken = (value, secret = "courier-qr") => crypto.createHmac("sha256", secret).update(String(value)).digest("hex");

module.exports = { createQrPayload, verifyQrPayload, createQrToken, generateQrCode: createQrPayload };
