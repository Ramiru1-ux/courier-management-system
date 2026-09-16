const { createModel } = require("../utils/modelFactory");
module.exports = createModel("Webhook", { name: { type: String, required: true }, event: { type: String, required: true }, url: { type: String, required: true }, secret: String, headers: {}, lastTriggeredAt: Date, failureCount: { type: Number, default: 0 } }, { defaultStatus: "active", indexes: [{ event: 1 }, { status: 1 }] });
