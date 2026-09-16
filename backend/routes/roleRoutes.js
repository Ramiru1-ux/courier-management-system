const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/roleController");
module.exports = createCrudRouter({ controller });
