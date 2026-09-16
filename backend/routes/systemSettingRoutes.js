const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/systemSettingController");
module.exports = createCrudRouter({ controller });
