const ProofOfDelivery = require("../models/ProofOfDelivery");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(ProofOfDelivery, "ProofOfDelivery", {
	searchFields: ["shipment", "recipientName", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createProofOfDelivery: crud.create,
	getProofsOfDelivery: crud.list,
	getProofOfDeliveryById: crud.getById,
	updateProofOfDelivery: crud.update,
	deleteProofOfDelivery: crud.remove,
	getPOD: crud.getById,
	createPOD: crud.create,
};
