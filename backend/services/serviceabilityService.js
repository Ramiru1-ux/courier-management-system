const ServiceZone = require("../models/ServiceZone");

const checkServiceability = async ({ city, postalCode, zone }) => {
	const query = zone ? { _id: zone } : { $or: [{ city }, { postalCodes: postalCode }] };
	if (!city && !postalCode && !zone) return { serviceable: false, reason: "Location is required" };
	if (typeof ServiceZone.findOne !== "function") return { serviceable: false, reason: "Service zones are not configured" };
	const match = await ServiceZone.findOne({ ...query, status: { $in: ["active", undefined] } });
	return { serviceable: Boolean(match), zone: match || null, reason: match ? null : "Location is outside the service area" };
};

module.exports = { checkServiceability, isServiceable: checkServiceability };
