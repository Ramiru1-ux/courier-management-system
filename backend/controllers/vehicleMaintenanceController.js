const VehicleMaintenance = require("../models/VehicleMaintenance");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(VehicleMaintenance, "VehicleMaintenance", {
	searchFields: ["vehicle", "maintenanceType", "status", "description"],
	sort: { createdAt: -1 },
});

module.exports = {
	createVehicleMaintenance: crud.create,
	getVehicleMaintenances: crud.list,
	getVehicleMaintenanceById: crud.getById,
	updateVehicleMaintenance: crud.update,
	deleteVehicleMaintenance: crud.remove,
};
