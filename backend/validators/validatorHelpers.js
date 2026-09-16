const mongoose = require("mongoose");

const validationError = (message, field) => { const error = new Error(message); error.statusCode = 400; error.field = field; return error; };
const required = (value, field) => { if (value === undefined || value === null || String(value).trim() === "") throw validationError(`${field} is required`, field); return value; };
const optionalString = (value, field, maxLength = 5000) => { if (value === undefined || value === null || value === "") return value; if (typeof value !== "string") throw validationError(`${field} must be a string`, field); if (value.length > maxLength) throw validationError(`${field} is too long`, field); return value.trim(); };
const email = (value, field = "email") => { required(value, field); const normalized = String(value).trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw validationError(`${field} must be a valid email address`, field); return normalized; };
const phone = (value, field = "phone") => { required(value, field); const normalized = String(value).trim(); if (!/^\+?[0-9 ()-]{7,20}$/.test(normalized)) throw validationError(`${field} must be a valid phone number`, field); return normalized; };
const objectId = (value, field) => { required(value, field); if (!mongoose.isValidObjectId(value)) throw validationError(`${field} must be a valid identifier`, field); return value; };
const number = (value, field, { min = -Infinity, max = Infinity, integer = false } = {}) => { const parsed = Number(value); if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) throw validationError(`${field} must be a valid number`, field); return parsed; };
const oneOf = (value, field, choices) => { if (!choices.includes(value)) throw validationError(`${field} must be one of: ${choices.join(", ")}`, field); return value; };
const createMiddleware = (validator) => (req, res, next) => { try { req.body = validator(req.body || {}, req); return next(); } catch (error) { return res.status(error.statusCode || 400).json({ success: false, message: error.message, field: error.field }); } };
module.exports = { validationError, required, optionalString, email, phone, objectId, number, oneOf, createMiddleware };
