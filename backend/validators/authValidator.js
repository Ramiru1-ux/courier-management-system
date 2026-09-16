const { required, email, phone, optionalString, createMiddleware } = require("./validatorHelpers");

const validateRegister = (body = {}) => ({
	name: optionalString(required(body.name, "name"), "name", 120),
	email: email(body.email),
	phone: body.phone ? phone(body.phone) : undefined,
	password: required(body.password, "password"),
	role: body.role || "customer",
});
const validateLogin = (body = {}) => ({ email: email(body.email), password: required(body.password, "password") });
const validateForgotPassword = (body = {}) => ({ email: email(body.email) });
const validateResetPassword = (body = {}) => ({ token: required(body.token, "token"), password: required(body.password, "password") });

module.exports = { validateRegister, validateLogin, validateForgotPassword, validateResetPassword, validateRegisterRequest: createMiddleware(validateRegister), validateLoginRequest: createMiddleware(validateLogin) };
