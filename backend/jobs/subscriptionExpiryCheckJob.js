const Subscription = require("../models/Subscription");
const { DEFAULT_INTERVALS, startJob } = require("../utils/jobHelpers");

const runSubscriptionExpiryCheck = async (now = new Date()) => {
	if (
		typeof Subscription.updateMany !== "function" ||
		typeof Subscription.countDocuments !== "function"
	) {
		return { success: true, skipped: "Subscription model is not configured", expired: 0 };
	}

	const filter = {
		status: "active",
		endDate: { $lte: now },
	};
	const expired = await Subscription.countDocuments(filter);
	if (expired) {
		await Subscription.updateMany(filter, {
			$set: { status: "expired", expiredAt: now },
		});
	}

	return { success: true, expired };
};

const scheduledJob = startJob(
	"Subscription expiry check job",
	runSubscriptionExpiryCheck,
	DEFAULT_INTERVALS.daily
);

module.exports = {
	runSubscriptionExpiryCheck,
	startSubscriptionExpiryCheckJob: scheduledJob.start,
	stopSubscriptionExpiryCheckJob: scheduledJob.stop,
};
