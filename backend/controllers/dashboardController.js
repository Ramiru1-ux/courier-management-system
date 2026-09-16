const Shipment = require("../models/Shipment");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Shipment, "Shipment", {
	searchFields: ["trackingNumber", "status", "recipientName"],
	sort: { createdAt: -1 },
});

const getDashboard = crud.list;

module.exports = {
	getDashboard,
	getDashboardSummary: getDashboard,
	getSummary: getDashboard,
};
