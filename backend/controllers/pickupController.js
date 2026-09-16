const Pickup = require("../models/Pickup");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Pickup, "Pickup", {
	searchFields: ["pickupNumber", "status", "customer", "address"],
	sort: { createdAt: -1 },
});

module.exports = {
	createPickup: crud.create,
	getPickups: crud.list,
	getPickupById: crud.getById,
	updatePickup: crud.update,
	deletePickup: crud.remove,
};
