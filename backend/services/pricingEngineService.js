const { roundMoney, toNumber } = require("../utils/serviceHelpers");
const calculatePrice = ({ basePrice = 0, weight = 0, pricePerKg = 0, distanceKm = 0, pricePerKm = 0, surcharge = 0, discount = 0 } = {}) => { const subtotal = toNumber(basePrice) + toNumber(weight) * toNumber(pricePerKg) + toNumber(distanceKm) * toNumber(pricePerKm) + toNumber(surcharge); return { subtotal: roundMoney(subtotal), discount: roundMoney(discount), total: roundMoney(Math.max(subtotal - toNumber(discount), 0)) }; };
module.exports = { calculatePrice, calculateShippingPrice: calculatePrice };
