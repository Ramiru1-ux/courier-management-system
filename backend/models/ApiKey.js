const { createModel, mongoose } = require("../utils/modelFactory");
module.exports = createModel("ApiKey", { name: { type: String, required: true }, key: { type: String, required: true, unique: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, expiresAt: Date, lastUsedAt: Date }, { indexes: [{ key: 1 }] });
