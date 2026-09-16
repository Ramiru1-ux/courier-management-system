const NotificationTemplate = require("../models/NotificationTemplate");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(NotificationTemplate, "NotificationTemplate", {
	searchFields: ["name", "key", "channel", "subject"],
});

module.exports = {
	createNotificationTemplate: crud.create,
	getNotificationTemplates: crud.list,
	getNotificationTemplateById: crud.getById,
	updateNotificationTemplate: crud.update,
	deleteNotificationTemplate: crud.remove,
};
