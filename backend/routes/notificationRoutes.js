const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/notificationController");
module.exports = createCrudRouter({ controller, custom: [{ method: "patch", path: "/:id/read", handler: controller.markNotificationRead }] });
