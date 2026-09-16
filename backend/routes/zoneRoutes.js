const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/zoneController");
module.exports = createCrudRouter({ controller });
