const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/invoiceController");
module.exports = createCrudRouter({ controller });
