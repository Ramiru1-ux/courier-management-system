const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/vehicleController");
module.exports = createCrudRouter({ controller });
