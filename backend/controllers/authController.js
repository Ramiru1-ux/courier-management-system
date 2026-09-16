const crypto = require("crypto");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const generateToken = require("../utils/generateToken");
const { createCrudController } = require("../utils/controllerFactory");
const { getLockoutSecondsRemaining, recordFailedLogin, clearFailedLogins } = require("../utils/loginAttempts");

const crud = createCrudController(User, "User", {
	searchFields: ["name", "email", "phone"],
});

/**
 * Every role this endpoint may legitimately create. This is shared by two
 * real admin-only screens - admin/UsersPage.jsx (staff accounts: admin,
 * finance, dispatcher, merchant, branch) and admin/DriversPage.jsx (driver
 * accounts) - so the allowlist has to cover both, not just one caller.
 * "counter" is deliberately excluded: Counter Staff is no longer an active
 * role in this system - existing counter-role User documents (if any) are
 * left completely alone (never deleted or modified by this change), this
 * only stops any NEW one from being created going forward, from here at
 * the actual source of truth rather than only hiding the option in the
 * admin UI's dropdown.
 */
const CREATABLE_ROLES = new Set(["admin", "finance", "dispatcher", "merchant", "branch", "driver", "customer"]);

const publicUser = (user) => ({
	id: String(user._id),
	name: user.name,
	email: user.email,
	phone: user.phone || "",
	role: user.role,
	branch: user.branchName || "",
	driverId: user.driverId || "",
	merchantName: user.merchantName || "",
	status: user.status,
	lastLoginAt: user.lastLoginAt || null,
});

const bad = (res, status, message) => res.status(status).json({ success: false, message });

/**
 * Records one login attempt (success or failure) as its own document in the
 * `auditlogs` collection - separate from the `users` collection, which only
 * ever holds the single most recent `lastLoginAt` per account and overwrites
 * it on every sign-in. This keeps the full history: every attempt, who it
 * was for, whether it succeeded, why it failed, and from where.
 *
 * Fire-and-forget on purpose (not awaited by callers) - a failure to write
 * the log must never block or fail the actual login response.
 */
const logLoginAttempt = (req, { email, success, reason, userId }) => {
	AuditLog.create({
		user: userId || undefined,
		action: success ? "login_success" : "login_failed",
		resource: "auth",
		method: "POST",
		path: req.originalUrl,
		statusCode: success ? 200 : 401,
		ipAddress: req.ip,
		userAgent: req.get("user-agent"),
		metadata: { email, reason },
	}).catch((error) => console.error("Login audit log error:", error.message));
};

/**
 * POST /api/auth/login
 * Checks the email + password against the `users` collection in MongoDB.
 * Passwords are stored as bcrypt hashes (see models/User.js).
 *
 * Failed-attempt lockout (utils/loginAttempts.js) is enforced here, not just
 * in the frontend's LoginPage.jsx - that copy still shows its own countdown
 * for a smooth UI, but this is what actually stops a script calling this
 * endpoint directly from brute-forcing a password with no JavaScript
 * involved at all.
 */
const login = async (req, res) => {
	try {
		const email = String(req.body?.email || "").trim().toLowerCase();
		const password = String(req.body?.password || "");
		const expectedRole = req.body?.role ? String(req.body.role).toLowerCase() : null;

		if (!email || !password) return bad(res, 400, "Email and password are required");

		const lockedForSeconds = getLockoutSecondsRemaining(email);
		if (lockedForSeconds > 0) {
			logLoginAttempt(req, { email, success: false, reason: "locked_out" });
			res.setHeader("Retry-After", lockedForSeconds);
			return res.status(429).json({
				success: false,
				message: `Too many failed attempts. Try again in ${lockedForSeconds} second(s).`,
				retryAfter: lockedForSeconds,
			});
		}

		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			recordFailedLogin(email);
			logLoginAttempt(req, { email, success: false, reason: "unknown_email" });
			return bad(res, 401, "Incorrect email or password");
		}

		const matches = await user.comparePassword(password);
		if (!matches) {
			recordFailedLogin(email);
			logLoginAttempt(req, { email, success: false, reason: "wrong_password", userId: user._id });
			return bad(res, 401, "Incorrect email or password");
		}

		if (user.status && String(user.status).toLowerCase() !== "active") {
			logLoginAttempt(req, { email, success: false, reason: "account_suspended", userId: user._id });
			return bad(res, 403, "This account is suspended. Please contact your administrator.");
		}

		if (expectedRole && String(user.role).toLowerCase() !== expectedRole) {
			logLoginAttempt(req, { email, success: false, reason: "role_mismatch", userId: user._id });
			return bad(res, 403, `This account is not a ${expectedRole} account`);
		}

		clearFailedLogins(email);
		user.lastLoginAt = new Date();
		await user.save({ validateBeforeSave: false });
		logLoginAttempt(req, { email, success: true, userId: user._id });

		return res.status(200).json({
			success: true,
			message: "Signed in successfully",
			token: generateToken(user),
			data: publicUser(user),
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || "Login failed" });
	}
};

/**
 * POST /api/auth/register
 * Saves a new account into MongoDB (password is hashed by the User model).
 */
const register = async (req, res) => {
	try {
		const body = req.body || {};
		const email = String(body.email || "").trim().toLowerCase();
		if (!email || !body.password) return bad(res, 400, "Email and password are required");
		if (String(body.password).length < 6) return bad(res, 400, "Password must be at least 6 characters");

		const existing = await User.findOne({ email });
		if (existing) return bad(res, 409, "An account with this email already exists");

		const role = String(body.role || "customer").toLowerCase();
		if (!CREATABLE_ROLES.has(role)) {
			return bad(res, 400, `"${role}" is not a valid role`);
		}

		const user = await User.create({
			name: body.name || email.split("@")[0],
			email,
			password: body.password,
			phone: body.phone || "",
			role,
			branchName: body.branch || body.branchName || "",
			driverId: body.driverId || "",
			merchantName: body.merchantName || "",
			status: "active",
		});

		return res.status(201).json({
			success: true,
			message: "Account created successfully",
			token: generateToken(user),
			data: publicUser(user),
		});
	} catch (error) {
		const status = error?.name === "ValidationError" ? 400 : 500;
		return res.status(status).json({ success: false, message: error.message || "Registration failed" });
	}
};

/** GET /api/auth/me - who is this token? Used to restore a session on reload. */
const getMe = async (req, res) => {
	if (!req.user) return bad(res, 401, "Authentication required");
	return res.status(200).json({ success: true, data: publicUser(req.user) });
};

/** POST /api/auth/logout - JWTs are stateless, the client drops the token. */
const logout = async (req, res) =>
	res.status(200).json({ success: true, message: "Signed out successfully" });

/**
 * POST /api/auth/forgot-password
 * Creates a short-lived reset token. There is no mail provider configured in
 * this build, so the token is returned in the response for the reset screen.
 */
const forgotPassword = async (req, res) => {
	try {
		const email = String(req.body?.email || "").trim().toLowerCase();
		if (!email) return bad(res, 400, "Email is required");

		const user = await User.findOne({ email });
		// Always answer the same way so the form cannot be used to discover
		// which emails have accounts.
		const response = {
			success: true,
			message: "If that email has an account, a reset link has been created.",
		};

		if (user) {
			const token = crypto.randomBytes(24).toString("hex");
			user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
			user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
			await user.save({ validateBeforeSave: false });
			response.token = token; // no SMTP wired up - see README
			response.expiresInMinutes = 15;
		}

		return res.status(200).json(response);
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || "Request failed" });
	}
};

/** POST /api/auth/reset-password - saves the new bcrypt hash to MongoDB. */
const resetPassword = async (req, res) => {
	try {
		const { token, password } = req.body || {};
		if (!token || !password) return bad(res, 400, "Reset token and new password are required");
		if (String(password).length < 8) return bad(res, 400, "Password must be at least 8 characters");

		const hashed = crypto.createHash("sha256").update(String(token)).digest("hex");
		const user = await User.findOne({
			resetToken: hashed,
			resetTokenExpires: { $gt: new Date() },
		}).select("+password");

		if (!user) return bad(res, 400, "This reset link is invalid or has expired");

		user.password = password;
		user.resetToken = undefined;
		user.resetTokenExpires = undefined;
		await user.save();

		return res.status(200).json({ success: true, message: "Password updated. Please sign in." });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || "Reset failed" });
	}
};

/** POST /api/auth/change-password - for a signed-in user. */
const changePassword = async (req, res) => {
	try {
		if (!req.user) return bad(res, 401, "Authentication required");
		const { currentPassword, newPassword } = req.body || {};
		if (!currentPassword || !newPassword) return bad(res, 400, "Current and new password are required");
		if (String(newPassword).length < 8) return bad(res, 400, "New password must be at least 8 characters");

		const user = await User.findById(req.user._id).select("+password");
		const matches = await user.comparePassword(currentPassword);
		if (!matches) return bad(res, 401, "Your current password is incorrect");

		user.password = newPassword;
		await user.save();
		return res.status(200).json({ success: true, message: "Password changed successfully" });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || "Change password failed" });
	}
};

/**
 * PATCH /api/auth/me - self-service profile editing. Every account
 * (admin/finance/dispatcher/driver/merchant/customer alike) can update its
 * own display name and phone number this way - the only two fields any
 * role's profile page has ever plausibly needed to change about itself.
 *
 * Deliberately an ALLOWLIST, not a blanket `Object.assign` - `role`,
 * `email`, `password`, `permissions`, `organizationId`, `branchId`,
 * `branchName`, `driverId`, and `merchantName` are exactly the fields that
 * decide what a user IS in this system (their authority, their scoped
 * ownership, their linkage to a driver/merchant/branch record) and none of
 * them are accepted here no matter what the request body contains - a
 * compromised or malicious request to this endpoint cannot escalate
 * privilege or reassign ownership, only rename/re-phone the account making
 * the request about itself.
 */
const updateProfile = async (req, res) => {
	try {
		if (!req.user) return bad(res, 401, "Authentication required");
		const { name, phone } = req.body || {};

		const updates = {};
		if (name !== undefined) {
			const trimmed = String(name).trim();
			if (!trimmed) return bad(res, 400, "Name cannot be empty");
			if (trimmed.length > 120) return bad(res, 400, "Name is too long");
			updates.name = trimmed;
		}
		if (phone !== undefined) {
			const trimmed = String(phone).trim();
			if (trimmed && !/^\+?[0-9 ()-]{7,20}$/.test(trimmed)) return bad(res, 400, "Phone must be a valid phone number");
			updates.phone = trimmed;
		}
		if (Object.keys(updates).length === 0) return bad(res, 400, "Nothing to update");

		const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
		return res.status(200).json({ success: true, data: publicUser(user) });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || "Profile update failed" });
	}
};

module.exports = {
	login,
	register,
	getMe,
	logout,
	forgotPassword,
	resetPassword,
	changePassword,
	updateProfile,
	createUser: crud.create,
	getUsers: crud.list,
	getUserById: crud.getById,
	updateUser: crud.update,
	deleteUser: crud.remove,
};
