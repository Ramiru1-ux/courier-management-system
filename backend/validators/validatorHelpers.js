const mongoose = require("mongoose");

const validationError = (message, field) => { const error = new Error(message); error.statusCode = 400; error.field = field; return error; };
const required = (value, field) => { if (value === undefined || value === null || String(value).trim() === "") throw validationError(`${field} is required`, field); return value; };
const optionalString = (value, field, maxLength = 5000) => { if (value === undefined || value === null || value === "") return value; if (typeof value !== "string") throw validationError(`${field} must be a string`, field); if (value.length > maxLength) throw validationError(`${field} is too long`, field); return value.trim(); };
const email = (value, field = "email") => { required(value, field); const normalized = String(value).trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw validationError(`${field} must be a valid email address`, field); return normalized; };
const phone = (value, field = "phone") => { required(value, field); const normalized = String(value).trim(); if (!/^\+?[0-9 ()-]{7,20}$/.test(normalized)) throw validationError(`${field} must be a valid phone number`, field); return normalized; };
const objectId = (value, field) => { required(value, field); if (!mongoose.isValidObjectId(value)) throw validationError(`${field} must be a valid identifier`, field); return value; };
const number = (value, field, { min = -Infinity, max = Infinity, integer = false } = {}) => { const parsed = Number(value); if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) throw validationError(`${field} must be a valid number`, field); return parsed; };
/**
 * The two free-text field rules the UI applies as people type
 * (frontend/src/utils/textValidation.js), enforced here as well so they also
 * hold for anything that reaches the API another way.
 *
 * personName: letters of any script (Sinhala and Tamil included), spaces,
 * and the apostrophe, hyphen and full stop real names use - no digits and no
 * other symbols. postalText: a street address, city or place label, where
 * digits belong but the symbols below never do.
 */
const BLOCKED_ADDRESS_SYMBOLS = "@$%^&*()_+";
const personName = (value, field, { maxLength = 120 } = {}) => {
	if (value === undefined || value === null || value === "") return value;
	const name = String(value).trim();
	if (!name) return value;
	if (/\d/.test(name)) throw validationError(`${field} cannot contain numbers`, field);
	if (!/^[\p{L}\p{M}][\p{L}\p{M} '.-]*$/u.test(name)) throw validationError(`${field} can only contain letters, spaces, apostrophes, hyphens and full stops`, field);
	if (name.length > maxLength) throw validationError(`${field} is too long`, field);
	return name;
};
const postalText = (value, field, { maxLength = 200 } = {}) => {
	if (value === undefined || value === null || value === "") return value;
	const text = String(value).trim();
	const blocked = [...new Set([...text].filter((character) => BLOCKED_ADDRESS_SYMBOLS.includes(character)))];
	if (blocked.length) throw validationError(`${field} cannot contain ${blocked.join(" ")}`, field);
	if (text.length > maxLength) throw validationError(`${field} is too long`, field);
	return text;
};
const oneOf = (value, field, choices) => { if (!choices.includes(value)) throw validationError(`${field} must be one of: ${choices.join(", ")}`, field); return value; };
const createMiddleware = (validator) => (req, res, next) => { try { req.body = validator(req.body || {}, req); return next(); } catch (error) { return res.status(error.statusCode || 400).json({ success: false, message: error.message, field: error.field }); } };
module.exports = { validationError, required, optionalString, email, phone, objectId, number, oneOf, personName, postalText, BLOCKED_ADDRESS_SYMBOLS, createMiddleware };
