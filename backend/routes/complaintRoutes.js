const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/complaintController");
module.exports = createCrudRouter({ controller });
