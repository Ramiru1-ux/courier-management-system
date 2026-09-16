const Webhook = require("../models/Webhook");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Webhook, "Webhook", {
	searchFields: ["name", "event", "url", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createWebhook: crud.create,
	getWebhooks: crud.list,
	getWebhookById: crud.getById,
	updateWebhook: crud.update,
	deleteWebhook: crud.remove,
	receiveWebhook: crud.create,
};
