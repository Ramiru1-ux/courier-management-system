const ApiKey = require("../models/ApiKey");

const getApiKey = (req) =>
	req.headers["x-api-key"] ||
	req.query.apiKey ||
	(req.headers.authorization || "").replace(/^ApiKey\s+/i, "");

const apiKeyAuth = async (req, res, next) => {
	try {
		const key = getApiKey(req);
		if (!key) {
			return res.status(401).json({ success: false, message: "API key required" });
		}
		if (typeof ApiKey.findOne !== "function") {
			return res.status(501).json({ success: false, message: "API key authentication is not configured" });
		}

		const record = await ApiKey.findOne({ key, status: { $in: ["active", undefined] } });
		if (!record) {
			return res.status(401).json({ success: false, message: "Invalid API key" });
		}

		req.apiKey = record;
		return next();
	} catch (error) {
		return next(error);
	}
};

module.exports = { apiKeyAuth, authenticateApiKey: apiKeyAuth, getApiKey };
