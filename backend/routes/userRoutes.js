const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/userController");
module.exports = createCrudRouter({ controller });
