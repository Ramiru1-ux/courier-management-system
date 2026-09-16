const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const getToken = (req) => {
	const header = req.headers.authorization || "";
	if (header.startsWith("Bearer ")) return header.slice(7).trim();
	return req.cookies?.token || req.headers["x-access-token"] || null;
};

const authenticate = async (req, res, next) => {
	try {
		const token = getToken(req);
		if (!token) {
			return res.status(401).json({ success: false, message: "Authentication required" });
		}

		const payload = jwt.verify(token, env.JWT_SECRET);
		const userId = payload.id || payload.userId || payload.sub;
		if (!userId || typeof User.findById !== "function") {
			return res.status(401).json({ success: false, message: "Invalid authentication token" });
		}

		const user = await User.findById(userId);
		if (!user || user.status === "blocked" || user.status === "inactive") {
			return res.status(401).json({ success: false, message: "User is not authorized" });
		}

		req.user = user;
		req.auth = payload;
		return next();
	} catch (error) {
		const message = error.name === "TokenExpiredError" ? "Authentication token expired" : "Invalid authentication token";
		return res.status(401).json({ success: false, message });
	}
};

const optionalAuth = async (req, res, next) => {
	if (!getToken(req)) return next();
	return authenticate(req, res, next);
};

module.exports = {
	authenticate,
	authMiddleware: authenticate,
	protect: authenticate,
	optionalAuth,
	getToken,
};
