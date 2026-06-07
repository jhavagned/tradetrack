// /server/src/modules/analytics/controllers/analytics.controller.js

const AnalyticsService = require("../services/analytics.service");
const createLogger = require("../../../utils/logger");

const logger = createLogger("analytics.controller");

const sendSuccess = (res, { statusCode = 200, data }) => {
  return res.status(statusCode).json({
    status: "success",
    ...(data !== undefined && { data }),
  });
};

const sendError = (res, err) => {
  const statusCode = err.status || 500;
  const message =
    statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";
  const code = err.code || (statusCode === 500 ? "INTERNAL_ERROR" : "ERROR");

  return res.status(statusCode).json({ error: { message, code } });
};

const AnalyticsController = {
  /**
   * GET /api/analytics/pnl?period=day|week|month
   */
  getPnLByPeriod: async (req, res) => {
    const { period = "day" } = req.query;

    logger.info("GET /api/analytics/pnl request received", { period });

    try {
      const data = await AnalyticsService.getPnLByPeriod(req.userId, period);

      logger.info("P&L by period response sent", {
        period,
        count: data.length,
      });

      return sendSuccess(res, { data });
    } catch (err) {
      logger.error("Failed to fetch P&L by period", { error: err.message });
      return sendError(res, err);
    }
  },

  /**
   * GET /api/analytics/win-rate
   */
  getWinRate: async (req, res) => {
    logger.info("GET /api/analytics/win-rate request received");

    try {
      const data = await AnalyticsService.getWinRate(req.userId);

      logger.info("Win rate response sent", { winRate: data.winRate });

      return sendSuccess(res, { data });
    } catch (err) {
      logger.error("Failed to fetch win rate", { error: err.message });
      return sendError(res, err);
    }
  },

  /**
   * GET /api/analytics/symbols
   */
  getSymbolBreakdown: async (req, res) => {
    logger.info("GET /api/analytics/symbols request received");

    try {
      const data = await AnalyticsService.getSymbolBreakdown(req.userId);

      logger.info("Symbol breakdown response sent", { count: data.length });

      return sendSuccess(res, { data });
    } catch (err) {
      logger.error("Failed to fetch symbol breakdown", { error: err.message });
      return sendError(res, err);
    }
  },

  /**
   * GET /api/analytics/emotions
   */
  getEmotionAnalytics: async (req, res) => {
    logger.info("GET /api/analytics/emotions request received");

    try {
      const data = await AnalyticsService.getEmotionAnalytics(req.userId);

      logger.info("Emotion analytics response sent");

      return sendSuccess(res, { data });
    } catch (err) {
      logger.error("Failed to fetch emotion analytics", { error: err.message });
      return sendError(res, err);
    }
  },
};

module.exports = AnalyticsController;
