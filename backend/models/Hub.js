const { createModel, mongoose } = require("../utils/modelFactory");
module.exports = createModel("Hub", { name: { type: String, required: true }, code: { type: String, unique: true, sparse: true }, address: String, city: String, phone: String, manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, capacity: { type: Number, min: 0, default: 0 } }, { indexes: [{ name: 1 }, { city: 1 }] });
