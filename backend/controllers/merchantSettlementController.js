const MerchantSettlement = require("../models/MerchantSettlement");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(MerchantSettlement, "MerchantSettlement", {
	searchFields: ["merchant", "status", "reference"],
	sort: { createdAt: -1 },
});

module.exports = {
	createMerchantSettlement: crud.create,
	getMerchantSettlements: crud.list,
	getMerchantSettlementById: crud.getById,
	updateMerchantSettlement: crud.update,
	deleteMerchantSettlement: crud.remove,
};
