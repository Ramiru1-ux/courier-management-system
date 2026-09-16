const Shipment = require("../models/Shipment");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Shipment, "Shipment", {
	searchFields: ["trackingNumber", "status", "recipientName", "merchant"],
	sort: { createdAt: -1 },
});

module.exports = {
	getOperationalReport: crud.list,
	getFinancialReport: crud.list,
	getBranchReport: crud.list,
	getDriverReport: crud.list,
	getMerchantReport: crud.list,
};
