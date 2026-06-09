// /server/src/modules/watchlist/controllers/watchlist.controller.js

const WatchlistService = require("../services/watchlist.service");
const createLogger = require("../../../utils/logger");

const logger = createLogger("watchlist.controller");

const sendSuccess = (res, { statusCode = 200, message, data }) => {
  return res.status(statusCode).json({
    status: "success",
    ...(message && { message }),
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

const WatchlistController = {
  /**
   * GET /api/watchlist
   * Get watchlist items for the authenticated user
   */
  getWatchlist: async (req, res) => {
    logger.info("GET /api/watchlist request received");

    try {
      const items = await WatchlistService.getWatchlist(req.userId);

      return sendSuccess(res, { data: items });
    } catch (err) {
      logger.error("Failed to get watchlist", { error: err.message });
      return sendError(res, err);
    }
  },

  /**
   * GET /api/watchlist/quotes
   * Fetch live quotes for all watchlist symbols
   */
  getQuotes: async (req, res) => {
    logger.info("GET /api/watchlist/quotes request received");

    try {
      const quotes = await WatchlistService.getQuotes(req.userId);

      return sendSuccess(res, { data: quotes });
    } catch (err) {
      logger.error("Failed to fetch quotes", { error: err.message });
      return sendError(res, err);
    }
  },

  /**
   * POST /api/watchlist
   * Add a ticker to the watchlist
   */
  addItem: async (req, res) => {
    const { symbol } = req.body;

    logger.info("POST /api/watchlist request received", { symbol });

    if (!symbol) {
      return res.status(400).json({
        error: { message: "Symbol is required", code: "VALIDATION_ERROR" },
      });
    }

    try {
      const item = await WatchlistService.addItem(req.userId, symbol);

      return sendSuccess(res, {
        statusCode: 201,
        message: `${symbol.toUpperCase()} added to watchlist`,
        data: item,
      });
    } catch (err) {
      logger.error("Failed to add watchlist item", { error: err.message });
      return sendError(res, err);
    }
  },

  /**
   * DELETE /api/watchlist/:id
   * Remove a ticker from the watchlist
   */
  removeItem: async (req, res) => {
    const { id } = req.params;

    logger.info("DELETE /api/watchlist/:id request received", { itemId: id });

    try {
      await WatchlistService.removeItem(id, req.userId);

      return sendSuccess(res, { message: "Item removed from watchlist" });
    } catch (err) {
      logger.error("Failed to remove watchlist item", { error: err.message });
      return sendError(res, err);
    }
  },
};

module.exports = WatchlistController;
