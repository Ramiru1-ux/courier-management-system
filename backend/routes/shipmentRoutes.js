const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/shipmentController");
module.exports = createCrudRouter({ controller });
