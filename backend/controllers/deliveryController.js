const Delivery = require("../models/Delivery");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Delivery, "Delivery", {
	searchFields: ["status", "trackingNumber", "recipientName"],
	sort: { createdAt: -1 },
});

module.exports = {
	createDelivery: crud.create,
	getDeliveries: crud.list,
	getDeliveryById: crud.getById,
	updateDelivery: crud.update,
	deleteDelivery: crud.remove,
};
