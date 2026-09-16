const { createModel } = require("../utils/modelFactory");
module.exports = createModel("Permission", { name: { type: String, required: true }, resource: String, action: String, description: String }, { indexes: [{ name: 1 }, { resource: 1, action: 1 }] });
