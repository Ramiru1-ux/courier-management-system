const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/pickupController");
module.exports = createCrudRouter({ controller });
