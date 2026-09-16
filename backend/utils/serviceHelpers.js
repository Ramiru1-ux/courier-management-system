const crypto = require("crypto");

const required = (value, name) => {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required`);
  }
  return value;
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const roundMoney = (value) => Math.round(toNumber(value) * 100) / 100;

const createReference = (prefix = "REF") =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const toCsv = (rows = []) => {
  if (!rows.length) return "";
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n");
};

module.exports = { required, toNumber, roundMoney, createReference, toCsv };
