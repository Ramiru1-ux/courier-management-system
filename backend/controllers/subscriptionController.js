const Subscription = require("../models/Subscription");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Subscription, "Subscription", {
	searchFields: ["organization", "plan", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createSubscription: crud.create,
	getSubscriptions: crud.list,
	getSubscriptionById: crud.getById,
	updateSubscription: crud.update,
	deleteSubscription: crud.remove,
};
