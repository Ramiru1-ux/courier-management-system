const express = require("express");
const controller = require("../controllers/searchController");
const { optionalAuth } = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", optionalAuth, controller.globalSearch);
router.get("/shipments", optionalAuth, controller.searchShipments);
module.exports = router;
