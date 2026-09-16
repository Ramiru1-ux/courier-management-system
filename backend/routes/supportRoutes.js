const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/supportTicketController");
module.exports = createCrudRouter({ controller });
