// /server/src/modules/trades/controllers/trades.controller.js

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
  const message =
    statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";
  const code = err.code || (statusCode === 500 ? "INTERNAL_ERROR" : "ERROR");

  return res.status(statusCode).json({
    error: {
      message,
      code,
    },
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
      const trades = await TradesService.getAllTrades(req.userId);

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
      const trade = await TradesService.createTrade(req.body, req.userId);

      const response = sendSuccess(res, {
        statusCode: 201,
        message: "Trade created",
        data: trade,
      });

      logger.info("Trade creation response sent", {
        tradeId: trade.trade_id,
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

  /**
   * PATCH /api/trades/:id/close
   * Close an open trade
   */
  closeTrade: async (req, res) => {
    const { id } = req.params;

    logger.info("Close trade request received", { tradeId: id });

    try {
      const trade = await TradesService.closeTrade(id, req.userId, req.body);

      const response = sendSuccess(res, {
        message: "Trade closed",
        data: trade,
      });

      logger.info("Close trade response sent", { tradeId: id });

      return response;
    } catch (err) {
      logger.error("Close trade failed in controller", {
        tradeId: id,
        error: err.message,
      });

      return sendError(res, err);
    }
  },

  /**
   * DELETE /api/trades/:id
   * Delete a trade
   */
  deleteTrade: async (req, res) => {
    const { id } = req.params;

    logger.info("Delete trade request received", { tradeId: id });

    try {
      await TradesService.deleteTrade(id, req.userId);

      const response = sendSuccess(res, {
        message: "Trade deleted",
      });

      logger.info("Delete trade response sent", { tradeId: id });

      return response;
    } catch (err) {
      logger.error("Delete trade failed in controller", {
        tradeId: id,
        error: err.message,
      });

      return sendError(res, err);
    }
  },

  /**
   * PUT /api/trades/:id
   * Edit a trade
   */
  editTrade: async (req, res) => {
    const { id } = req.params;

    logger.info("Edit trade request received", { tradeId: id });

    try {
      const trade = await TradesService.editTrade(id, req.userId, req.body);

      const response = sendSuccess(res, {
        message: "Trade updated",
        data: trade,
      });

      logger.info("Edit trade response sent", { tradeId: id });

      return response;
    } catch (err) {
      logger.error("Edit trade failed in controller", {
        tradeId: id,
        error: err.message,
      });

      return sendError(res, err);
    }
  },
};

module.exports = TradesController;
