const Rating = require("../models/Rating");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Rating, "Rating", {
	searchFields: ["shipment", "customer", "driver", "comment"],
	sort: { createdAt: -1 },
});

module.exports = {
	createRating: crud.create,
	getRatings: crud.list,
	getRatingById: crud.getById,
	updateRating: crud.update,
	deleteRating: crud.remove,
};
