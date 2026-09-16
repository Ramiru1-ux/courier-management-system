const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/driverController");
module.exports = createCrudRouter({ controller });
