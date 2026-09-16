const Hub = require("../models/Hub");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Hub, "Hub", {
	searchFields: ["name", "code", "city", "address"],
});

module.exports = {
	createHub: crud.create,
	getHubs: crud.list,
	getHubById: crud.getById,
	updateHub: crud.update,
	deleteHub: crud.remove,
};
