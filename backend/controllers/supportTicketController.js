const SupportTicket = require("../models/SupportTicket");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(SupportTicket, "SupportTicket", {
	searchFields: ["ticketNumber", "subject", "description", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createSupportTicket: crud.create,
	getSupportTickets: crud.list,
	getSupportTicketById: crud.getById,
	updateSupportTicket: crud.update,
	deleteSupportTicket: crud.remove,
	createTicket: crud.create,
	getTickets: crud.list,
};
