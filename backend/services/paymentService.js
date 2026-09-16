const Stripe = require("stripe");
const config = require("../config/paymentGatewayConfig");
const { required, toNumber, roundMoney } = require("../utils/serviceHelpers");

const stripe = config.stripe.secretKey ? new Stripe(config.stripe.secretKey) : null;

const createPaymentIntent = async ({ amount, currency = "lkr", metadata = {} }) => {
	required(amount, "amount");
	if (!stripe) return { id: null, amount: roundMoney(amount), currency, status: "pending", metadata };
	return stripe.paymentIntents.create({ amount: Math.round(toNumber(amount) * 100), currency: currency.toLowerCase(), metadata });
};

const refundPayment = async ({ paymentIntentId, amount }) => {
	required(paymentIntentId, "paymentIntentId");
	if (!stripe) return { id: null, paymentIntentId, amount, status: "pending" };
	return stripe.refunds.create({ payment_intent: paymentIntentId, amount: amount ? Math.round(toNumber(amount) * 100) : undefined });
};

module.exports = { stripe, createPaymentIntent, createPayment: createPaymentIntent, refundPayment };
