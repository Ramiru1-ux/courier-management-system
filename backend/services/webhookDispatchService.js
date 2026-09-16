const axios = require("axios");
const crypto = require("crypto");
const signPayload = (payload, secret) => crypto.createHmac("sha256", secret || "").update(JSON.stringify(payload)).digest("hex");
const dispatchWebhook = async ({ url, payload, secret, headers = {} }) => { if (!url) throw new Error("Webhook URL is required"); return axios.post(url, payload, { headers: { "Content-Type": "application/json", "X-Webhook-Signature": signPayload(payload, secret), ...headers } }); };
module.exports = { dispatchWebhook, sendWebhook: dispatchWebhook, signPayload };
