const express = require("express");
const controller = require("../controllers/exportController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(authenticate);
router.get("/shipments", controller.exportShipments);
router.get("/deliveries", controller.exportDeliveries);
router.get("/payments", controller.exportPayments);
module.exports = router;
