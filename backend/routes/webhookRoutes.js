const { createCrudRouter } = require("../utils/routeFactory");
const controller = require("../controllers/webhookController");
module.exports = createCrudRouter({ controller, auth: false, custom: [{ method: "post", path: "/receive", handler: controller.receiveWebhook }] });
