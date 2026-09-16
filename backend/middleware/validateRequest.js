const formatValidationErrors = (error) => {
	if (Array.isArray(error)) return error;
	if (error?.details) return error.details.map((detail) => detail.message || detail);
	if (error?.issues) return error.issues.map((issue) => issue.message || issue);
	return [error?.message || "Request validation failed"];
};

const validateRequest = (schema, source = "body") => async (req, res, next) => {
	try {
		const value = req[source];
		if (!schema) return next();

		if (typeof schema === "function") {
			const result = await schema(value, req);
			if (result === false) {
				return res.status(400).json({ success: false, message: "Request validation failed" });
			}
			if (result && typeof result === "object") req[source] = result;
			return next();
		}

		if (typeof schema.parse === "function") {
			req[source] = await schema.parse(value);
			return next();
		}

		if (typeof schema.validate === "function") {
			const result = await schema.validate(value);
			if (result?.error) {
				return res.status(400).json({
					success: false,
					message: "Request validation failed",
					errors: formatValidationErrors(result.error),
				});
			}
			if (result?.value !== undefined) req[source] = result.value;
		}

		return next();
	} catch (error) {
		return res.status(400).json({
			success: false,
			message: "Request validation failed",
			errors: formatValidationErrors(error),
		});
	}
};

module.exports = validateRequest;
module.exports.validateRequest = validateRequest;
