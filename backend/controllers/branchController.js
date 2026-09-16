const Branch = require("../models/Branch");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Branch, "Branch", {
	searchFields: ["name", "code", "city", "phone"],
});

module.exports = {
	createBranch: crud.create,
	getBranches: crud.list,
	getBranchById: crud.getById,
	updateBranch: crud.update,
	deleteBranch: crud.remove,
};
