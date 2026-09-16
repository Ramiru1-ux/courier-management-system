const Invoice = require("../models/Invoice");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Invoice, "Invoice", {
	searchFields: ["invoiceNumber", "status", "customer", "merchant"],
	sort: { createdAt: -1 },
});

module.exports = {
	createInvoice: crud.create,
	getInvoices: crud.list,
	getInvoiceById: crud.getById,
	updateInvoice: crud.update,
	deleteInvoice: crud.remove,
};
