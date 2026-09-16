const Customer = require("../models/Customer");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Customer, "Customer", {
	searchFields: ["name", "email", "phone", "customerCode"],
});

module.exports = {
	createCustomer: crud.create,
	getCustomers: crud.list,
	getCustomerById: crud.getById,
	updateCustomer: crud.update,
	deleteCustomer: crud.remove,
};
