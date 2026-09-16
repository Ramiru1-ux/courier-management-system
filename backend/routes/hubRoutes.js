const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/hubController");
module.exports = createCrudRouter({ controller });
