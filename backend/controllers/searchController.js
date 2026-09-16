const Shipment = require("../models/Shipment");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Shipment, "Shipment", {
	searchFields: ["trackingNumber", "recipientName", "recipientPhone", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	globalSearch: crud.list,
	searchShipments: crud.list,
};
