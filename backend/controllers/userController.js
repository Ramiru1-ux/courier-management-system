const User = require("../models/User");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(User, "User", {
	searchFields: ["name", "email", "phone", "role"],
});

module.exports = {
	createUser: crud.create,
	getUsers: crud.list,
	getUserById: crud.getById,
	updateUser: crud.update,
	deleteUser: crud.remove,
};
