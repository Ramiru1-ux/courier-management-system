const Complaint = require("../models/Complaint");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Complaint, "Complaint", {
	searchFields: ["subject", "description", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createComplaint: crud.create,
	getComplaints: crud.list,
	getComplaintById: crud.getById,
	updateComplaint: crud.update,
	deleteComplaint: crud.remove,
};
