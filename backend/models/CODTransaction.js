const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("CODTransaction", {
	shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true, index: true },
	driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", index: true },
	merchant: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", index: true },
	transactionNumber: { type: String, unique: true, sparse: true },
	amount: { type: Number, required: true, min: 0 },
	collectedAt: Date,
	settledAt: Date,
	settlementReference: String,
}, { defaultStatus: "pending", indexes: [{ status: 1, createdAt: -1 }] });
