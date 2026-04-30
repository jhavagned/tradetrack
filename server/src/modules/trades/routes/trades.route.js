// /server/src/modules/trades/routes/trades.route.js

const express = require("express");
const TradesController = require("../controllers/trades.controller");
const authMiddleware = require("../../../middleware/auth.middleware");

const router = express.Router();

/**
 * =========================
 * PROTECTED ROUTES
 * =========================
 */
router.use(authMiddleware);

router.get("/", TradesController.getAll);
router.post("/", TradesController.create);

module.exports = router;
