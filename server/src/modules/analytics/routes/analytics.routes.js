// /server/src/modules/analytics/routes/analytics.routes.js

const express = require("express");
const AnalyticsController = require("../controllers/analytics.controller");
const requireAuth = require("../../../middleware/auth.middleware");

const router = express.Router();

/**
 * =========================
 * PROTECTED ROUTES
 * =========================
 */

router.get("/pnl", requireAuth, AnalyticsController.getPnLByPeriod);
router.get("/win-rate", requireAuth, AnalyticsController.getWinRate);
router.get("/symbols", requireAuth, AnalyticsController.getSymbolBreakdown);

module.exports = router;
