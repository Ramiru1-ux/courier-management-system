const Merchant = require("../models/Merchant");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Merchant, "Merchant", {
	searchFields: ["name", "email", "phone", "merchantCode"],
});

module.exports = {
	createMerchant: crud.create,
	getMerchants: crud.list,
	getMerchantById: crud.getById,
	updateMerchant: crud.update,
	deleteMerchant: crud.remove,
};
