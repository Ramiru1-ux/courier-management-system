const DeliveryAttempt = require("../models/DeliveryAttempt");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(DeliveryAttempt, "DeliveryAttempt", {
	searchFields: ["status", "failureReason", "shipment"],
	sort: { createdAt: -1 },
});

module.exports = {
	createDeliveryAttempt: crud.create,
	getDeliveryAttempts: crud.list,
	getDeliveryAttemptById: crud.getById,
	updateDeliveryAttempt: crud.update,
	deleteDeliveryAttempt: crud.remove,
};
