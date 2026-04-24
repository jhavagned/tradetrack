// /server/src/modules/controllers/trades.controller.js

const TradesService = require("../services/trades.service");

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
    try {
      const trades = await TradesService.getAllTrades();

      return sendSuccess(res, {
        data: trades,
      });
    } catch (err) {
      return sendError(res, err);
    }
  },

  /**
   * POST /api/trades
   * Create a new trade
   */
  create: async (req, res) => {
    try {
      const trade = await TradesService.createTrade(req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Trade created",
        data: trade,
      });
    } catch (err) {
      return sendError(res, err);
    }
  },
};

module.exports = TradesController;
