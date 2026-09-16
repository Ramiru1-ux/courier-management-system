const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/merchantController");
module.exports = createCrudRouter({ controller });
