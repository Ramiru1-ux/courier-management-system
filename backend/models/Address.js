const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("Address", {
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
	label: { type: String, trim: true, default: "Home" },
	street: { type: String, required: true, trim: true },
	city: { type: String, required: true, trim: true },
	state: String,
	country: { type: String, required: true, trim: true },
	postalCode: String,
	latitude: Number,
	longitude: Number,
	isDefault: { type: Boolean, default: false },
	phone: String,
	notes: String,
}, { indexes: [{ user: 1, isDefault: 1 }] });
