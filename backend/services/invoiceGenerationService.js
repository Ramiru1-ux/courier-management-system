const Invoice = require("../models/Invoice");
const { createReference, roundMoney } = require("../utils/serviceHelpers");

const calculateInvoice = ({ items = [], taxRate = 0 } = {}) => {
	const subtotal = roundMoney(items.reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.unitPrice || item.amount || 0), 0));
	const tax = roundMoney(subtotal * Number(taxRate) / 100);
	return { subtotal, tax, total: roundMoney(subtotal + tax) };
};
const createInvoice = async (data) => Invoice.create({ ...data, ...calculateInvoice(data), invoiceNumber: data.invoiceNumber || createReference("INV") });

module.exports = { calculateInvoice, createInvoice, generateInvoice: createInvoice };
