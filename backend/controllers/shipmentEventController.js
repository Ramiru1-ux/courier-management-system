const ShipmentEvent = require("../models/ShipmentEvent");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(ShipmentEvent, "ShipmentEvent", {
	searchFields: ["shipment", "status", "eventType", "description"],
	sort: { createdAt: -1 },
});

module.exports = {
	createShipmentEvent: crud.create,
	getShipmentEvents: crud.list,
	getShipmentEventById: crud.getById,
	updateShipmentEvent: crud.update,
	deleteShipmentEvent: crud.remove,
};
