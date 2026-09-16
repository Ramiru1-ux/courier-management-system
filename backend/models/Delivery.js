const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("Delivery", {
	shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true, index: true },
	driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", index: true },
	trackingNumber: { type: String, index: true },
	recipientName: String,
	recipientPhone: String,
	scheduledAt: Date,
	deliveredAt: Date,
	failureReason: String,
	retryCount: { type: Number, min: 0, default: 0 },
	notes: String,
}, { defaultStatus: "pending", indexes: [{ status: 1, scheduledAt: 1 }] });
