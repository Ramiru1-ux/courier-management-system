const { createModel, mongoose } = require("../utils/modelFactory");

module.exports = createModel("Branch", {
	name: { type: String, required: true, trim: true },
	code: { type: String, unique: true, sparse: true, uppercase: true },
	address: String,
	city: String,
	phone: String,
	manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	capacity: { type: Number, min: 0, default: 0 },
}, { indexes: [{ name: 1 }, { city: 1 }] });
