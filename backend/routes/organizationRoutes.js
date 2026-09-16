const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/organizationController");
module.exports = createCrudRouter({ controller });
