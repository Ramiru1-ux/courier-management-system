const Payment = require("../models/Payment");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Payment, "Payment", {
	searchFields: ["transactionId", "status", "method", "reference"],
	sort: { createdAt: -1 },
});

module.exports = {
	createPayment: crud.create,
	getPayments: crud.list,
	getPaymentById: crud.getById,
	updatePayment: crud.update,
	deletePayment: crud.remove,
};
