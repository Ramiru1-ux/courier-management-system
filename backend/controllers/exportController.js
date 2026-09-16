const Shipment = require("../models/Shipment");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Shipment, "Shipment", {
	searchFields: ["trackingNumber", "status", "recipientName"],
	sort: { createdAt: -1 },
});

module.exports = {
	exportShipments: crud.list,
	exportDeliveries: crud.list,
	exportPayments: crud.list,
};
