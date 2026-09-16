const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/paymentController");
module.exports = createCrudRouter({ controller });
