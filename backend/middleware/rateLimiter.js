const createRateLimiter = (options = {}) => {
	const windowMs = Number(options.windowMs) || 15 * 60 * 1000;
	const max = Number(options.max) || 100;
	const keyGenerator = options.keyGenerator || ((req) => req.ip || req.socket?.remoteAddress || "unknown");
	const entries = new Map();

	return (req, res, next) => {
		const key = keyGenerator(req);
		const now = Date.now();
		const current = entries.get(key);
		const record = !current || now - current.startedAt >= windowMs
			? { startedAt: now, count: 0 }
			: current;

		record.count += 1;
		entries.set(key, record);
		res.setHeader("RateLimit-Limit", max);
		res.setHeader("RateLimit-Remaining", Math.max(max - record.count, 0));

		if (record.count > max) {
			const retryAfter = Math.ceil((record.startedAt + windowMs - now) / 1000);
			res.setHeader("Retry-After", retryAfter);
			return res.status(429).json({
				success: false,
				message: "Too many requests",
				retryAfter,
			});
		}
		return next();
	};
};

const rateLimiter = createRateLimiter();

module.exports = { createRateLimiter, rateLimiter, limiter: rateLimiter };
