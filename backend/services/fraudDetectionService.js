const detectFraud = ({ amount = 0, attempts = 0, velocity = 0, riskCountry = false } = {}) => {
	const signals = [];
	if (Number(amount) > 100000) signals.push("high_amount");
	if (Number(attempts) > 5) signals.push("repeated_attempts");
	if (Number(velocity) > 10) signals.push("high_velocity");
	if (riskCountry) signals.push("risk_country");
	return { suspicious: signals.length >= 2, score: Math.min(signals.length / 4, 1), signals };
};

module.exports = { detectFraud, assessTransaction: detectFraud, isSuspicious: (input) => detectFraud(input).suspicious };
