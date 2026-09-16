const AuditLog = require("../models/AuditLog");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(AuditLog, "AuditLog", {
	searchFields: ["action", "resource", "description"],
	sort: { createdAt: -1 },
});

module.exports = {
	createAuditLog: crud.create,
	getAuditLogs: crud.list,
	getAuditLogById: crud.getById,
	updateAuditLog: crud.update,
	deleteAuditLog: crud.remove,
};
