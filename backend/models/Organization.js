const { createModel, mongoose } = require("../utils/modelFactory");
module.exports = createModel("Organization", { name: { type: String, required: true }, slug: { type: String, unique: true, sparse: true, lowercase: true }, email: String, phone: String, owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, settings: mongoose.Schema.Types.Mixed }, { indexes: [{ name: 1 }, { slug: 1 }] });
