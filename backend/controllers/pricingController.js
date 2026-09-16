const PricingRule = require("../models/PricingRule");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(PricingRule, "PricingRule", {
	searchFields: ["name", "serviceType", "zone", "status"],
});

module.exports = {
	createPricingRule: crud.create,
	getPricingRules: crud.list,
	getPricingRuleById: crud.getById,
	updatePricingRule: crud.update,
	deletePricingRule: crud.remove,
};
