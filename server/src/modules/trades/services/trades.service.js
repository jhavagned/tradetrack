// /server/src/modules/trades/services/trades.service.js

const { validateTrade } = require("../validation/trades.validation");
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
  getAllTrades: async () => {
    logger.debug("Fetching all trades");

    const trades = await TradesRepository.findAll();

    // Ensure consistent return contract (always an array)
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
  createTrade: async (tradeInput) => {
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
      symbol: tradeInput.symbol,
      type: tradeInput.type,
      entryPrice: Number(tradeInput.entryPrice),
      quantity: Number(tradeInput.quantity),
      exitPrice: tradeInput.exitPrice ? Number(tradeInput.exitPrice) : null,
      exitTime: tradeInput.exitTime || null,
      notes: tradeInput.notes || "",
      strategy: tradeInput.strategy || "",

      // System fields
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    // =========================
    // Persist
    // =========================
    logger.debug("Persisting trade", {
      tradeId: newTrade.id,
    });

    const savedTrade = await TradesRepository.create(newTrade);

    logger.info("Trade successfully created");

    return savedTrade;
  },
};

module.exports = TradesService;
