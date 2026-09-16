const errorMiddleware = (error, req, res, next) => {
	if (res.headersSent) return next(error);

	let statusCode = error.statusCode || error.status || 500;
	let message = error.message || "Internal server error";

	if (error.name === "ValidationError") statusCode = 400;
	if (error.name === "CastError") {
		statusCode = 400;
		message = "Invalid resource identifier";
	}
	if (error.code === 11000) {
		statusCode = 409;
		message = "A record with the same value already exists";
	}
	if (error.name === "MulterError") statusCode = 400;

	const response = { success: false, message };
	if (process.env.NODE_ENV !== "production") response.stack = error.stack;
	return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
module.exports.errorMiddleware = errorMiddleware;
