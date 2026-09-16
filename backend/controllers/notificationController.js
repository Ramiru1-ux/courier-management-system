const Notification = require("../models/Notification");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(Notification, "Notification", {
	searchFields: ["title", "message", "type", "status"],
	sort: { createdAt: -1 },
});

module.exports = {
	createNotification: crud.create,
	getNotifications: crud.list,
	getNotificationById: crud.getById,
	updateNotification: crud.update,
	deleteNotification: crud.remove,
	markNotificationRead: crud.update,
};
