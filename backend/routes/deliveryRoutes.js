const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/deliveryController");
module.exports = createCrudRouter({ controller });
