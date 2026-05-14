// /server/src/modules/trades/services/trades.service.js

const {
  validateTrade,
  validateCloseTrade,
  validateEditTrade,
} = require("../validation/trades.validation");
const TradesRepository = require("../repositories/trades.repository");
const createLogger = require("../../../utils/logger");

const logger = createLogger("trades.service");

/**
 * Trade Service
 * Handles business logic for trades
 */
/**
 * Trade Service
 *
 * RESPONSIBILITIES:
 * - Handles business logic for trades
 * - Validates incoming data
 * - Normalizes input into domain format
 * - Delegates persistence to repository
 *
 * LOGGING STRATEGY:
 * - Log entry into business operations
 * - Log validation success/failure
 * - Log before persistence handoff
 */
const TradesService = {
  /**
   * Fetch all trades
   *
   * FLOW:
   * Controller -> Service -> Repository -> Controller
   */
  getAllTrades: async (userId) => {
    logger.debug("Fetching all trades", { userId });

    const trades = await TradesRepository.findAll(userId);

    const safeTrades = Array.isArray(trades) ? trades : [];

    logger.debug("Trades retrieved from repository", {
      count: safeTrades.length,
    });

    return safeTrades;
  },

  /**
   * Create a new trade
   *
   * FLOW:
   * Controller -> Service -> Validation -> Normalization -> Repository -> Controller
   *
   * @param {Object} tradeInput - Raw trade payload from request
   */
  createTrade: async (tradeInput, userId) => {
    logger.debug("Starting trade creation");

    // =========================
    // Validation
    // =========================
    const validationError = validateTrade(tradeInput);

    if (validationError) {
      logger.warn("Trade validation failed", {
        error: validationError.message,
        field: validationError.field,
      });

      const err = new Error(validationError.message);
      err.code = "VALIDATION_ERROR";
      err.status = 400;
      err.field = validationError.field;

      throw err;
    }

    logger.debug("Trade validation passed");

    // =========================
    // Data Normalization
    // =========================
    const newTrade = {
      userId,
      symbol: tradeInput.symbol,
      tradeType: tradeInput.type,
      entryPrice: Number(tradeInput.entryPrice),
      exitPrice: tradeInput.exitPrice ? Number(tradeInput.exitPrice) : null,
      entryTime: tradeInput.entryTime || null,
      exitTime: tradeInput.exitTime || null,
      quantity: Number(tradeInput.quantity),
      notes: tradeInput.notes || null,
      strategy: tradeInput.strategy || null,
    };

    // =========================
    // Persist
    // =========================
    logger.debug("Persisting trade", { userId });

    const savedTrade = await TradesRepository.create(newTrade);

    logger.info("Trade successfully created", {
      tradeId: savedTrade.trade_id,
    });

    return savedTrade;
  },

  /**
   * Close an open trade
   *
   * FLOW:
   * Controller → Service → Validation → Ownership Check → Status Check → Repository
   *
   * BUSINESS RULES:
   * - Trade must exist (404)
   * - Trade must belong to the requesting user (403)
   * - Trade must be open (400)
   * - exitPrice and exitTime are required and valid
   *
   * @param {string} tradeId   - UUID of the trade to close
   * @param {string} userId    - UUID of the authenticated user
   * @param {Object} payload   - { exitPrice, exitTime }
   * @returns {Object} The updated trade
   */
  closeTrade: async (tradeId, userId, payload) => {
    logger.debug("Starting close trade", { tradeId, userId });

    // =========================
    // Validation
    // =========================
    const validationError = validateCloseTrade(payload);

    if (validationError) {
      logger.warn("Close trade validation failed", {
        error: validationError.message,
        field: validationError.field,
      });

      const err = new Error(validationError.message);
      err.code = "VALIDATION_ERROR";
      err.status = 400;
      err.field = validationError.field;
      throw err;
    }

    // =========================
    // Existence check
    // =========================
    const trade = await TradesRepository.findById(tradeId);

    if (!trade) {
      logger.warn("Close trade failed — trade not found", { tradeId });

      const err = new Error("Trade not found");
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }

    // =========================
    // Ownership check
    // =========================
    if (trade.user_id !== userId) {
      logger.warn("Close trade failed — forbidden", { tradeId, userId });

      const err = new Error("You do not have permission to close this trade");
      err.code = "FORBIDDEN";
      err.status = 403;
      throw err;
    }

    // =========================
    // Status check
    // =========================
    if (trade.trade_status === "closed") {
      logger.warn("Close trade failed — trade already closed", { tradeId });

      const err = new Error("Trade is already closed");
      err.code = "TRADE_ALREADY_CLOSED";
      err.status = 400;
      throw err;
    }

    // =========================
    // Persist
    // =========================
    const closedAt = new Date();

    const updatedTrade = await TradesRepository.closeTrade(
      tradeId,
      Number(payload.exitPrice),
      payload.exitTime,
      closedAt,
    );

    logger.info("Trade closed successfully", { tradeId });

    return updatedTrade;
  },

  /**
   * Delete a trade
   *
   * FLOW:
   * Controller → Service → Existence Check → Ownership Check → Repository
   *
   * BUSINESS RULES:
   * - Trade must exist (404)
   * - Trade must belong to the requesting user (403)
   *
   * @param {string} tradeId - UUID of the trade to delete
   * @param {string} userId  - UUID of the authenticated user
   * @returns {void}
   */
  deleteTrade: async (tradeId, userId) => {
    logger.debug("Starting delete trade", { tradeId, userId });

    // =========================
    // Existence check
    // =========================
    const trade = await TradesRepository.findById(tradeId);

    if (!trade) {
      logger.warn("Delete trade failed — trade not found", { tradeId });

      const err = new Error("Trade not found");
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }

    // =========================
    // Ownership check
    // =========================
    if (trade.user_id !== userId) {
      logger.warn("Delete trade failed — forbidden", { tradeId, userId });

      const err = new Error("You do not have permission to delete this trade");
      err.code = "FORBIDDEN";
      err.status = 403;
      throw err;
    }

    // =========================
    // Persist
    // =========================
    await TradesRepository.deleteTrade(tradeId);

    logger.info("Trade deleted successfully", { tradeId });
  },

  /**
   * Edit a trade
   *
   * FLOW:
   * Controller → Service → Validation → Existence Check → Ownership Check → Normalization → Repository
   *
   * BUSINESS RULES:
   * - Trade must exist (404)
   * - Trade must belong to the requesting user (403)
   * - All existing validation rules apply
   * - trade_status and closed_at are recalculated from exitPrice
   *
   * @param {string} tradeId    - UUID of the trade to edit
   * @param {string} userId     - UUID of the authenticated user
   * @param {Object} tradeInput - Raw edit payload from request
   * @returns {Object} The updated trade
   */
  editTrade: async (tradeId, userId, tradeInput) => {
    logger.debug("Starting edit trade", { tradeId, userId });

    // =========================
    // Validation
    // =========================
    const validationError = validateEditTrade(tradeInput);

    if (validationError) {
      logger.warn("Edit trade validation failed", {
        error: validationError.message,
        field: validationError.field,
      });

      const err = new Error(validationError.message);
      err.code = "VALIDATION_ERROR";
      err.status = 400;
      err.field = validationError.field;
      throw err;
    }

    // =========================
    // Existence check
    // =========================
    const trade = await TradesRepository.findById(tradeId);

    if (!trade) {
      logger.warn("Edit trade failed — trade not found", { tradeId });

      const err = new Error("Trade not found");
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }

    // =========================
    // Ownership check
    // =========================
    if (trade.user_id !== userId) {
      logger.warn("Edit trade failed — forbidden", { tradeId, userId });

      const err = new Error("You do not have permission to edit this trade");
      err.code = "FORBIDDEN";
      err.status = 403;
      throw err;
    }

    // =========================
    // Normalization
    // Recalculate trade_status and closed_at from exitPrice
    // =========================
    const exitPrice = tradeInput.exitPrice
      ? Number(tradeInput.exitPrice)
      : null;
    const tradeStatus = exitPrice ? "closed" : "open";
    const closedAt = exitPrice ? new Date() : null;

    const updatedFields = {
      symbol: tradeInput.symbol,
      tradeType: tradeInput.type,
      entryPrice: Number(tradeInput.entryPrice),
      exitPrice,
      entryTime: tradeInput.entryTime || null,
      exitTime: tradeInput.exitTime || null,
      quantity: Number(tradeInput.quantity),
      notes: tradeInput.notes || null,
      strategy: tradeInput.strategy || null,
      tradeStatus,
      closedAt,
    };

    // =========================
    // Persist
    // =========================
    const updatedTrade = await TradesRepository.updateTrade(
      tradeId,
      updatedFields,
    );

    logger.info("Trade edited successfully", { tradeId });

    return updatedTrade;
  },
};

module.exports = TradesService;
