/**
 * Email format check based on the internet standards for email addresses
 * (RFC 5321 / RFC 5322, in the practical form real mail providers accept).
 * Same rules as frontend/src/utils/emailValidation.js, so an address the
 * form rejects is also rejected here if it is sent to the API directly.
 * Returns "" when the address is valid, otherwise the reason it is not.
 */
const getEmailError = (value) => {
	const email = String(value ?? "").trim();
	if (!email) return "Email address is required.";
	if (/\s/.test(email)) return "Email address cannot contain spaces.";
	if (email.length > 254) return "Email address is too long (maximum 254 characters).";

	const parts = email.split("@");
	if (parts.length !== 2) return 'Email address must contain exactly one "@" (for example name@example.com).';
	const [local, domain] = parts;

	// Part before the @
	if (!local) return 'Enter the name part before the "@" (for example name@example.com).';
	if (local.length > 64) return 'The part before the "@" is too long (maximum 64 characters).';
	if (!/^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~.-]+$/.test(local)) return 'The part before the "@" contains characters that are not allowed.';
	if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return 'The part before the "@" cannot start or end with a dot, or have two dots in a row.';

	// Domain after the @
	if (!domain) return 'Enter the domain after the "@" (for example name@example.com).';
	if (domain.length > 253) return "The email domain is too long.";
	const labels = domain.split(".");
	if (labels.length < 2) return 'The domain must end with an extension such as .com or .lk (for example name@gmail.com).';
	if (labels.some((label) => label === "")) return "The domain cannot start or end with a dot, or have two dots in a row.";
	if (labels.some((label) => label.length > 63 || !/^[A-Za-z0-9-]+$/.test(label) || label.startsWith("-") || label.endsWith("-"))) {
		return "The domain can only contain letters, numbers and hyphens, and no part of it can start or end with a hyphen.";
	}
	const extension = labels[labels.length - 1];
	if (!/^[A-Za-z]{2,63}$/.test(extension)) return "The domain extension must be at least 2 letters, such as .com or .lk.";

	return "";
};

module.exports = { getEmailError };