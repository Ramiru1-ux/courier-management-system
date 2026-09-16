const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/pricingController");
module.exports = createCrudRouter({ controller });
