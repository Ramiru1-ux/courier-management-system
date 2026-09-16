const ServiceZone = require("../models/ServiceZone");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(ServiceZone, "Zone", {
	searchFields: ["name", "code", "city", "status"],
});

module.exports = {
	createZone: crud.create,
	getZones: crud.list,
	getZoneById: crud.getById,
	updateZone: crud.update,
	deleteZone: crud.remove,
};
