const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("Merchant", {
	name: { type: String, required: true, trim: true },
	merchantCode: { type: String, unique: true, sparse: true, trim: true },
	email: { type: String, lowercase: true, trim: true },
	phone: String,
	address: String,
	contactPerson: String,
	users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { indexes: [{ email: 1 }, { name: 1 }] });
