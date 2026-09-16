const Delivery = require("../models/Delivery");
const DeliveryAttempt = require("../models/DeliveryAttempt");
const { DEFAULT_INTERVALS, startJob } = require("../utils/jobHelpers");

const runRetryFailedDeliveries = async ({ maxAttempts = 3 } = {}) => {
	if (typeof Delivery.find !== "function") {
		return { success: true, skipped: "Delivery model is not configured", retried: 0 };
	}

	const deliveries = await Delivery.find({
		status: "failed",
		$or: [
			{ retryCount: { $lt: maxAttempts } },
			{ retryCount: { $exists: false } },
		],
	});
	const ids = deliveries.map((delivery) => delivery._id).filter(Boolean);

	if (ids.length && typeof Delivery.updateMany === "function") {
		await Delivery.updateMany(
			{ _id: { $in: ids } },
			{ $set: { status: "pending" }, $inc: { retryCount: 1 } }
		);
	}

	return {
		success: true,
		retried: ids.length,
		attemptsModelReady: typeof DeliveryAttempt.create === "function",
	};
};

const scheduledJob = startJob(
	"Retry failed deliveries job",
	runRetryFailedDeliveries,
	DEFAULT_INTERVALS.hourly
);

module.exports = {
	runRetryFailedDeliveries,
	startRetryFailedDeliveriesJob: scheduledJob.start,
	stopRetryFailedDeliveriesJob: scheduledJob.stop,
};
