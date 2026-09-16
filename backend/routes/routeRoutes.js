const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/routeController");
module.exports = createCrudRouter({ controller, custom: [{ method: "post", path: "/:id/optimize", handler: controller.optimizeRoute }] });
