const { createModel } = require("../utils/modelFactory");
module.exports = createModel("NotificationTemplate", { name: { type: String, required: true }, key: { type: String, unique: true, sparse: true }, channel: { type: String, default: "email" }, subject: String, body: { type: String, required: true }, variables: [String] });
