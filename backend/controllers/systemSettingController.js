const SystemSetting = require("../models/SystemSetting");
const { createCrudController } = require("../utils/controllerFactory");

const crud = createCrudController(SystemSetting, "SystemSetting", {
	searchFields: ["key", "name", "description"],
});

module.exports = {
	createSystemSetting: crud.create,
	getSystemSettings: crud.list,
	getSystemSettingById: crud.getById,
	updateSystemSetting: crud.update,
	deleteSystemSetting: crud.remove,
};
