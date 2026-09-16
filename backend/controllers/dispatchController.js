const Shipment = require("../models/Shipment");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Shipment, "Shipment", {
	searchFields: ["trackingNumber", "status", "assignedDriver"],
	sort: { createdAt: -1 },
});

module.exports = {
	getDispatchOverview: crud.list,
	getDispatches: crud.list,
	assignShipment: crud.update,
	updateDispatch: crud.update,
};
