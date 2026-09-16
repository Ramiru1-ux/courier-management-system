const branchScope = (options = {}) => (req, res, next) => {
	const branchId = req.user?.branch || req.user?.branchId || req.headers["x-branch-id"] || req.query.branch;
	if (options.required && !branchId) {
		return res.status(400).json({ success: false, message: "Branch context is required" });
	}

	req.scope = { ...(req.scope || {}), branch: branchId };
	req.branchId = branchId;
	return next();
};

const requireBranch = branchScope({ required: true });

module.exports = { branchScope, requireBranch };
