const express = require("express");
const controller = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(authenticate);
router.get("/", controller.getDashboard);
router.get("/summary", controller.getDashboardSummary);
module.exports = router;
