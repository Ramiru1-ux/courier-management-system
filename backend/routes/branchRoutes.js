const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/branchController");
module.exports = createCrudRouter({ controller });
