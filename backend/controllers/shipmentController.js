const Shipment = require("../models/Shipment");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Shipment, "Shipment", {
	searchFields: ["trackingNumber", "recipientName", "recipientPhone", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createShipment: crud.create,
	getShipments: crud.list,
	getShipmentById: crud.getById,
	updateShipment: crud.update,
	deleteShipment: crud.remove,
};
