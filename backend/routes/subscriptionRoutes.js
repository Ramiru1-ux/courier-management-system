const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/subscriptionController");
module.exports = createCrudRouter({ controller });
