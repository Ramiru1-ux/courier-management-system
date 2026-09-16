const CODTransaction = require("../models/CODTransaction");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(CODTransaction, "CODTransaction", {
	searchFields: ["transactionNumber", "status", "shipment"],
	sort: { createdAt: -1 },
});

module.exports = {
	createCODTransaction: crud.create,
	getCODTransactions: crud.list,
	getCODTransactionById: crud.getById,
	updateCODTransaction: crud.update,
	deleteCODTransaction: crud.remove,
};
