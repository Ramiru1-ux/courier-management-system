const MerchantSettlement = require("../models/MerchantSettlement");
const { createReference, roundMoney } = require("../utils/serviceHelpers");

const calculateMerchantSettlement = (transactions = []) => transactions.reduce((sum, item) => sum + roundMoney(item.amount), 0);
const createSettlement = async ({ merchant, amount, periodStart, periodEnd, notes }) => MerchantSettlement.create({ merchant, amount: roundMoney(amount), periodStart, periodEnd, notes, reference: createReference("MST") });
const listSettlements = (filter = {}) => MerchantSettlement.find(filter).sort({ createdAt: -1 });

module.exports = { calculateMerchantSettlement, createSettlement, createMerchantSettlement: createSettlement, listSettlements };
