const { toNumber } = require("../utils/serviceHelpers");

const distance = (a, b) => {
	const lat = (toNumber(b.lat) - toNumber(a.lat)) * 111;
	const lng = (toNumber(b.lng) - toNumber(a.lng)) * 111 * Math.cos((toNumber(a.lat) * Math.PI) / 180);
	return Math.sqrt(lat ** 2 + lng ** 2);
};

const optimizeRoute = ({ origin, stops = [] }) => {
	const remaining = [...stops];
	const ordered = [];
	let current = origin || remaining.shift();
	while (current && remaining.length) {
		let nearestIndex = 0;
		let nearestDistance = distance(current, remaining[0]);
		remaining.forEach((stop, index) => {
			const value = distance(current, stop);
			if (value < nearestDistance) { nearestIndex = index; nearestDistance = value; }
		});
		current = remaining.splice(nearestIndex, 1)[0];
		ordered.push(current);
	}
	if (current && !ordered.includes(current)) ordered.unshift(current);
	return { stops: ordered, totalDistanceKm: ordered.slice(1).reduce((sum, stop, index) => sum + distance(ordered[index], stop), 0) };
};

module.exports = { optimizeRoute, calculateRoute: optimizeRoute };
