const VehicleMaintenance = require("../models/VehicleMaintenance");
const Notification = require("../models/Notification");
const { DEFAULT_INTERVALS, startJob } = require("../utils/jobHelpers");

const runVehicleMaintenanceReminder = async ({ days = 7, now = new Date() } = {}) => {
	if (typeof VehicleMaintenance.find !== "function") {
		return { success: true, skipped: "VehicleMaintenance model is not configured", reminders: 0 };
	}

	const dueBefore = new Date(now);
	dueBefore.setDate(dueBefore.getDate() + days);
	const maintenance = await VehicleMaintenance.find({
		nextServiceDate: { $gte: now, $lte: dueBefore },
		status: { $nin: ["completed", "cancelled"] },
	});

	let reminders = 0;
	if (typeof Notification.create === "function") {
		for (const item of maintenance) {
			await Notification.create({
				type: "in_app",
				title: "Vehicle maintenance due",
				message: `Vehicle maintenance is due by ${new Date(item.nextServiceDate).toLocaleDateString()}.`,
				reference: item._id,
				read: false,
			});
			reminders += 1;
		}
	}

	return { success: true, reminders, maintenanceChecked: maintenance.length };
};

const scheduledJob = startJob(
	"Vehicle maintenance reminder job",
	runVehicleMaintenanceReminder,
	DEFAULT_INTERVALS.daily
);

module.exports = {
	runVehicleMaintenanceReminder,
	startVehicleMaintenanceReminderJob: scheduledJob.start,
	stopVehicleMaintenanceReminderJob: scheduledJob.stop,
};
