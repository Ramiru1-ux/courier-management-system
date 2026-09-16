const User = require("../models/User");
const Notification = require("../models/Notification");
const {
	DEFAULT_INTERVALS,
	startJob,
} = require("../utils/jobHelpers");

const runDocumentExpiryReminder = async ({ days = 30, now = new Date() } = {}) => {
	if (typeof User.find !== "function") {
		return { success: true, skipped: "User model is not configured", reminders: 0 };
	}

	const expiresBefore = new Date(now);
	expiresBefore.setDate(expiresBefore.getDate() + days);
	const users = await User.find({
		"documents.expiresAt": { $gte: now, $lte: expiresBefore },
	});

	let reminders = 0;
	if (typeof Notification.create === "function") {
		for (const user of users) {
			await Notification.create({
				user: user._id,
				type: "in_app",
				title: "Document expiry reminder",
				message: "One or more of your documents will expire soon.",
				read: false,
			});
			reminders += 1;
		}
	}

	return { success: true, reminders, usersChecked: users.length };
};

const scheduledJob = startJob(
	"Document expiry reminder job",
	runDocumentExpiryReminder,
	DEFAULT_INTERVALS.daily
);

module.exports = {
	runDocumentExpiryReminder,
	startDocumentExpiryReminderJob: scheduledJob.start,
	stopDocumentExpiryReminderJob: scheduledJob.stop,
};
