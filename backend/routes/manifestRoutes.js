const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/manifestController");
module.exports = createCrudRouter({ controller });
