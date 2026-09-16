const hasPermission = (user, permission) => {
	if (!user || user.role === "super_admin" || user.isSuperAdmin) return true;
	const permissions = [
		...(Array.isArray(user.permissions) ? user.permissions : []),
		...(Array.isArray(user.role?.permissions) ? user.role.permissions : []),
	];

	return permissions.some((item) => {
		const value = typeof item === "string" ? item : `${item.resource || item.name}:${item.action || item.operation || ""}`;
		return value === permission || value === "*";
	});
};

const requirePermission = (...required) => (req, res, next) => {
	const permissions = required.flat().filter(Boolean);
	if (!permissions.length || permissions.every((permission) => hasPermission(req.user, permission))) {
		return next();
	}
	return res.status(403).json({ success: false, message: "Insufficient permissions" });
};

module.exports = { hasPermission, requirePermission, checkPermission: requirePermission };
