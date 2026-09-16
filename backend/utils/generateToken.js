const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (user, options = {}) => {
	const id = user?._id || user?.id;
	if (!id) throw new Error("User id is required to generate a token");
	return jwt.sign({ id: String(id), role: user.role?.name || user.role }, env.JWT_SECRET, { expiresIn: options.expiresIn || env.JWT_EXPIRES_IN });
};

const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
module.exports = generateToken;
module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
