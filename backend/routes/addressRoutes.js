const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/addressController");
module.exports = createCrudRouter({ controller });
