const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/auditLogController");
module.exports = createCrudRouter({ controller });
