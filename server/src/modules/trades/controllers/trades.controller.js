// /server/src/modules/controllers/trades.controller.js

const TradesService = require("../services/trades.service");
const createLogger = require("../../../utils/logger");
const logger = createLogger("trades.controller");

/**
 * Standard success response helper
 */
const sendSuccess = (res, { statusCode = 200, message, data }) => {
  return res.status(statusCode).json({
    status: "success",
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });
};

/**
 * Standard error response helper
 * Prevents leaking internal server errors
 */
const sendError = (res, err) => {
  const statusCode = err.status || 500;

  return res.status(statusCode).json({
    status: "error",
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
};

const TradesController = {
  /**
   * GET /api/trades
   * Fetch all trades
   */
  getAll: async (req, res) => {
    logger.info("GET /api/trades request received");

    try {
      const trades = await TradesService.getAllTrades();

      logger.info("Fetched all trades successfully", {
        count: trades.length,
      });

      const response = sendSuccess(res, {
        data: trades,
      });

      logger.info("GET /api/trades response sent");

      return response;
    } catch (err) {
      logger.error("Failed to fetch trades", {
        error: err.message,
      });

      return sendError(res, err);
    }
  },

  /**
   * POST /api/trades
   * Create a new trade
   */
  create: async (req, res) => {
    logger.info("Trade creation request received", {
      symbol: req.body?.symbol,
      type: req.body?.type,
    });

    try {
      const trade = await TradesService.createTrade(req.body);

      const response = sendSuccess(res, {
        statusCode: 201,
        message: "Trade created",
        data: trade,
      });

      logger.info("Trade creation response sent", {
        tradeId: trade.id,
      });

      return response;
    } catch (err) {
      logger.error("Trade creation failed in controller", {
        error: err.message,
        payload: req.body,
      });

      return sendError(res, err);
    }
  },
};

module.exports = TradesController;
