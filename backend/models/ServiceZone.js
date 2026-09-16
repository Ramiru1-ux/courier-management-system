const { createModel } = require("../utils/modelFactory");

module.exports = createModel("ServiceZone", {
	name: { type: String, required: true, trim: true },
	code: { type: String, unique: true, sparse: true, uppercase: true },
	city: String,
	postalCodes: [String],
	deliveryFee: { type: Number, min: 0, default: 0 },
	coordinates: { type: [[Number]], default: undefined },
}, { indexes: [{ name: 1 }, { city: 1 }] });
