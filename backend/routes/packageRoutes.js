const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/packageController");
module.exports = createCrudRouter({ controller });
