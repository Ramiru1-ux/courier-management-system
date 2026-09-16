const AuditLog = require("../models/AuditLog");

const auditLogger = (options = {}) => (req, res, next) => {
	const startedAt = Date.now();
	res.on("finish", () => {
		if (typeof AuditLog.create !== "function") return;

		AuditLog.create({
			user: req.user?._id,
			action: options.action || `${req.method} ${req.originalUrl}`,
			resource: options.resource || req.baseUrl,
			method: req.method,
			path: req.originalUrl,
			statusCode: res.statusCode,
			durationMs: Date.now() - startedAt,
			ipAddress: req.ip,
			userAgent: req.get("user-agent"),
			metadata: options.metadata,
		}).catch((error) => console.error("Audit log error:", error.message));
	});

	return next();
};

module.exports = auditLogger;
module.exports.auditLogger = auditLogger;
