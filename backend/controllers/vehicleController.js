const Vehicle = require("../models/Vehicle");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Vehicle, "Vehicle", {
	searchFields: ["registrationNumber", "vehicleNumber", "type", "status"],
});

module.exports = {
	createVehicle: crud.create,
	getVehicles: crud.list,
	getVehicleById: crud.getById,
	updateVehicle: crud.update,
	deleteVehicle: crud.remove,
};
