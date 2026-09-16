const PackageModel = require("../models/Package");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(PackageModel, "Package", {
	searchFields: ["name", "sku", "trackingNumber", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createPackage: crud.create,
	getPackages: crud.list,
	getPackageById: crud.getById,
	updatePackage: crud.update,
	deletePackage: crud.remove,
};
