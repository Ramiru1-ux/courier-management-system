const { createModel } = require("../utils/modelFactory");
module.exports = createModel("SystemSetting", { key: { type: String, required: true, unique: true }, name: String, value: {}, description: String, isPublic: { type: Boolean, default: false } });
