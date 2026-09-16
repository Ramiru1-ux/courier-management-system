const { createModel } = require("../utils/modelFactory");
module.exports = createModel("SubscriptionPlan", { name: { type: String, required: true, unique: true }, price: { type: Number, min: 0, default: 0 }, billingPeriod: { type: String, default: "monthly" }, driverLimit: Number, features: [String], description: String }, { defaultStatus: "active" });
