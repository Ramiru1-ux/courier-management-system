const ApiKey = require("../models/ApiKey");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(ApiKey, "ApiKey", {
	searchFields: ["name", "key", "description"],
});

module.exports = {
	createApiKey: crud.create,
	getApiKeys: crud.list,
	getApiKeyById: crud.getById,
	updateApiKey: crud.update,
	deleteApiKey: crud.remove,
};
