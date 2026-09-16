const organizationScope = (options = {}) => (req, res, next) => {
	const organizationId =
		req.user?.organization ||
		req.user?.organizationId ||
		req.headers["x-organization-id"] ||
		req.query.organization;

	if (options.required && !organizationId) {
		return res.status(400).json({ success: false, message: "Organization context is required" });
	}

	req.scope = { ...(req.scope || {}), organization: organizationId };
	req.organizationId = organizationId;
	return next();
};

const requireOrganization = organizationScope({ required: true });

module.exports = { organizationScope, requireOrganization };
