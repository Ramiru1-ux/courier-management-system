const Permission = require("../models/Permission");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Permission, "Permission", {
	searchFields: ["name", "resource", "action", "description"],
});

module.exports = {
	createPermission: crud.create,
	getPermissions: crud.list,
	getPermissionById: crud.getById,
	updatePermission: crud.update,
	deletePermission: crud.remove,
};
