const bcrypt = require("bcryptjs");
const { createModel } = require("../utils/modelFactory");

const User = createModel("User", {
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, lowercase: true, trim: true },
	phone: String,
	password: { type: String, required: true, minlength: 6, select: false },
	role: { type: String, default: "customer" },
	permissions: [String],
	organizationId: { type: String },
	branchId: { type: String },
	// Plain text branch name shown in the UI (the frontend works with names,
	// not ObjectIds) - kept separate from the `branch` ObjectId reference.
	branchName: { type: String, default: "" },
	driverId: { type: String, default: "" },
	merchantName: { type: String, default: "" },
	avatarUrl: String,
	lastLoginAt: Date,
	resetToken: { type: String, select: false },
	resetTokenExpires: { type: Date, select: false },
	// Sign-in verification code (two-factor). Only a SHA-256 hash of the 6
	// digits is stored, never the code itself, and none of these fields are
	// selected (or returned) unless a query explicitly asks for them.
	twoFactorCodeHash: { type: String, select: false },
	twoFactorExpiresAt: { type: Date, select: false },
	twoFactorAttempts: { type: Number, default: 0, select: false },
	twoFactorSentAt: { type: Date, select: false },
}, {
	indexes: [{ email: 1 }, { role: 1 }],
	configureSchema: (schema) => {
		schema.methods.comparePassword = function comparePassword(candidate) {
			return bcrypt.compare(candidate, this.password);
		};

		schema.pre("save", async function savePassword() {
			if (!this.isModified("password")) return;
			this.password = await bcrypt.hash(this.password, 12);
		});
	},
});

module.exports = User;
