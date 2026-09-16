const Role = require("../models/Role");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Role, "Role", {
	searchFields: ["name", "description"],
});

module.exports = {
	createRole: crud.create,
	getRoles: crud.list,
	getRoleById: crud.getById,
	updateRole: crud.update,
	deleteRole: crud.remove,
};
