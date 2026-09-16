const authorizeRoles = (...allowedRoles) => {
	const roles = allowedRoles.flat().filter(Boolean).map((role) => String(role).toLowerCase());
	return (req, res, next) => {
		const userRole = String(req.user?.role?.name || req.user?.role || "").toLowerCase();
		if (roles.includes(userRole) || userRole === "super_admin") return next();
		return res.status(403).json({ success: false, message: "You are not authorized for this action" });
	};
};

module.exports = {
	authorizeRoles,
	requireRole: authorizeRoles,
	roleMiddleware: authorizeRoles,
};
