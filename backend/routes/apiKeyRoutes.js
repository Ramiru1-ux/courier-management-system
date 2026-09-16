const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/apiKeyController");
module.exports = createCrudRouter({ controller });
