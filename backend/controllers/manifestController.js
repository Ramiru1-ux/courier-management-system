const Manifest = require("../models/Manifest");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Manifest, "Manifest", {
	searchFields: ["manifestNumber", "status", "branch"],
	sort: { createdAt: -1 },
});

module.exports = {
	createManifest: crud.create,
	getManifests: crud.list,
	getManifestById: crud.getById,
	updateManifest: crud.update,
	deleteManifest: crud.remove,
};
