const success = (res, data = null, message = "Success", statusCode = 200, extra = {}) => res.status(statusCode).json({ success: true, message, ...(data === undefined ? {} : { data }), ...extra });
const created = (res, data, message = "Created successfully") => success(res, data, message, 201);
const failure = (res, message = "Request failed", statusCode = 500, errors) => res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
const notFound = (res, message = "Resource not found") => failure(res, message, 404);
const badRequest = (res, message = "Invalid request", errors) => failure(res, message, 400, errors);

module.exports = { success, created, failure, error: failure, notFound, badRequest };
