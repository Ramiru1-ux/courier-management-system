const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/ratingController");
module.exports = createCrudRouter({ controller });
