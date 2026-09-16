const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("Payment", {
	shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", index: true },
	customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
	merchant: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", index: true },
	transactionId: { type: String, index: true },
	reference: { type: String, unique: true, sparse: true },
	amount: { type: Number, required: true, min: 0 },
	currency: { type: String, default: "LKR", uppercase: true },
	method: { type: String, default: "cash" },
	provider: String,
	paidAt: Date,
	failureReason: String,
}, { defaultStatus: "pending", indexes: [{ status: 1, createdAt: -1 }] });
