const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("ManifestItem", {
	manifest: { type: mongoose.Schema.Types.ObjectId, ref: "Manifest", required: true, index: true },
	shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true, index: true },
	scannedAt: Date,
	scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	notes: String,
}, { defaultStatus: "pending" });
