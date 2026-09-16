const { createModel } = require("../utils/modelFactory");
module.exports = createModel("Role", { name: { type: String, required: true, unique: true }, description: String, permissions: [String] });
