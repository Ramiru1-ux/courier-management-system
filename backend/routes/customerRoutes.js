const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/customerController");
module.exports = createCrudRouter({ controller });
