const Driver = require("../models/Driver");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Driver, "Driver", {
	searchFields: ["name", "email", "phone", "licenseNumber"],
});

module.exports = {
	createDriver: crud.create,
	getDrivers: crud.list,
	getDriverById: crud.getById,
	updateDriver: crud.update,
	deleteDriver: crud.remove,
};
