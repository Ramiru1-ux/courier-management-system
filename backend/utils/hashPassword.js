const bcrypt = require("bcryptjs");

const hashPassword = (password, rounds = 12) => {
	if (!password) throw new Error("Password is required");
	return bcrypt.hash(password, rounds);
};
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = hashPassword;
module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;
