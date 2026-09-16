const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/codController");
module.exports = createCrudRouter({ controller });
