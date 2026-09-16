const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("ProofOfDelivery", {
	shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true, index: true },
	recipientName: String,
	recipientPhone: String,
	signatureUrl: String,
	photoUrls: [String],
	otpVerified: { type: Boolean, default: false },
	deliveredAt: Date,
	notes: String,
}, { defaultStatus: "pending", indexes: [{ shipment: 1 }] });
