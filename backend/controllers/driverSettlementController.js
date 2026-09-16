const DriverSettlement = require("../models/DriverSettlement");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(DriverSettlement, "DriverSettlement", {
	searchFields: ["driver", "status", "reference"],
	sort: { createdAt: -1 },
});

module.exports = {
	createDriverSettlement: crud.create,
	getDriverSettlements: crud.list,
	getDriverSettlementById: crud.getById,
	updateDriverSettlement: crud.update,
	deleteDriverSettlement: crud.remove,
};
