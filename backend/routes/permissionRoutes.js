const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/permissionController");
module.exports = createCrudRouter({ controller });
