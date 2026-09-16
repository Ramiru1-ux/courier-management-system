const CODTransaction = require("../models/CODTransaction");
const DriverSettlement = require("../models/DriverSettlement");
const MerchantSettlement = require("../models/MerchantSettlement");
const {
	DEFAULT_INTERVALS,
	isModelReady,
	startJob,
	startOfDay,
	endOfDay,
} = require("../utils/jobHelpers");

const runDailySettlement = async (date = new Date()) => {
	const range = { $gte: startOfDay(date), $lte: endOfDay(date) };
	const result = { success: true, date: startOfDay(date), settled: 0, skipped: [] };

	if (!isModelReady(CODTransaction)) {
		result.skipped.push("CODTransaction model is not configured");
		return result;
	}

	const transactions = await CODTransaction.find({
		status: { $in: ["pending", "collected", "approved"] },
		createdAt: range,
	});
	const ids = transactions.map((transaction) => transaction._id).filter(Boolean);

	if (ids.length) {
		await CODTransaction.updateMany(
			{ _id: { $in: ids } },
			{ $set: { status: "settled", settledAt: new Date() } }
		);
	}

	result.settled = ids.length;
	result.transactionCount = transactions.length;
	result.driverSettlementReady = isModelReady(DriverSettlement);
	result.merchantSettlementReady = isModelReady(MerchantSettlement);
	return result;
};

const scheduledJob = startJob(
	"Daily settlement job",
	runDailySettlement,
	DEFAULT_INTERVALS.daily,
	{ runImmediately: false }
);

module.exports = {
	runDailySettlement,
	startDailySettlementJob: scheduledJob.start,
	stopDailySettlementJob: scheduledJob.stop,
};
