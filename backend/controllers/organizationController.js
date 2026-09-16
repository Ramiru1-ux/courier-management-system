const Organization = require("../models/Organization");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Organization, "Organization", {
	searchFields: ["name", "slug", "email", "phone"],
});

module.exports = {
	createOrganization: crud.create,
	getOrganizations: crud.list,
	getOrganizationById: crud.getById,
	updateOrganization: crud.update,
	deleteOrganization: crud.remove,
};
