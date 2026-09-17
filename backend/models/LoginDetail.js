const { createModel, mongoose } = require("../utils/modelFactory");

/**
 * One document per sign-in attempt, saved in the `login_details` collection.
 *
 * The collection name is set explicitly: without it Mongoose would name a
 * "LoginDetail" model's collection `logindetails`, and the existing
 * `login_details` collection in Atlas would stay empty.
 *
 * `status` (added by modelFactory) is used as:
 *   "success"    - email + password verified
 *   "failed"     - any rejected attempt (see failureReason)
 *   "logged_out" - a successful session that has since ended
 */
const LoginDetail = createModel("LoginDetail", {
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	name: { type: String, default: "" },
	email: { type: String, lowercase: true, trim: true, required: true },
	role: { type: String, default: "" },          // the account's real role
	requestedRole: { type: String, default: "" }, // the portal/role the login form asked for
	success: { type: Boolean, required: true },
	failureReason: {
		type: String,
		enum: ["", "missing_credentials", "locked_out", "user_not_found", "wrong_password", "account_suspended", "role_mismatch"],
		default: "",
	},
	ipAddress: { type: String, default: "" },
	userAgent: { type: String, default: "" },
	loginAt: { type: Date, default: Date.now },
	logoutAt: { type: Date, default: null },
	logoutReason: { type: String, default: "" },
	sessionDurationSeconds: { type: Number, default: null },
}, {
	defaultStatus: "success",
	indexes: [{ loginAt: -1 }, { user: 1, loginAt: -1 }, { email: 1, loginAt: -1 }, { success: 1, loginAt: -1 }],
	schemaOptions: { collection: "login_details" },
});

module.exports = LoginDetail;