const mongoose = require("mongoose");

const objectId = () => ({
  type: mongoose.Schema.Types.ObjectId,
  ref: "",
});

const shouldSkipExplicitIndex = (schema, indexSpec) => {
  if (!indexSpec || typeof indexSpec !== "object" || Array.isArray(indexSpec)) return false;

  const keys = Object.keys(indexSpec);
  if (keys.length === 0) return false;

  const hasFieldIndex = keys.some((key) => {
    const field = schema.tree[key];
    return field && typeof field === "object" && (field.index || field.unique);
  });

  return hasFieldIndex || keys.includes("status") && schema.tree.status && schema.tree.status.index === true;
};

const createModel = (name, fields = {}, options = {}) => {
  const schema = new mongoose.Schema(
    {
      ...fields,
      organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
      branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", index: true },
      status: { type: String, default: options.defaultStatus || "active", index: true },
    },
    { timestamps: true, versionKey: false, ...options.schemaOptions }
  );

  for (const index of options.indexes || []) {
    if (!shouldSkipExplicitIndex(schema, index)) {
      schema.index(index);
    }
  }

  if (typeof options.configureSchema === "function") options.configureSchema(schema);
  return mongoose.models[name] || mongoose.model(name, schema);
};

module.exports = { mongoose, objectId, createModel };
