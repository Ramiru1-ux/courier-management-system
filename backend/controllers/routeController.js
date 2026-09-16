const Route = require("../models/Route");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Route, "Route", {
	searchFields: ["routeNumber", "name", "status", "driver"],
	sort: { createdAt: -1 },
});

module.exports = {
	createRoute: crud.create,
	getRoutes: crud.list,
	getRouteById: crud.getById,
	updateRoute: crud.update,
	deleteRoute: crud.remove,
	optimizeRoute: crud.update,
};
