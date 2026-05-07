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
      symbol:     tradeInput.symbol,
      tradeType:  tradeInput.type,
      entryPrice: Number(tradeInput.entryPrice),
      exitPrice:  tradeInput.exitPrice  ? Number(tradeInput.exitPrice)  : null,
      entryTime:  tradeInput.entryTime  || null,
      exitTime:   tradeInput.exitTime   || null,
      quantity:   Number(tradeInput.quantity),
      notes:      tradeInput.notes      || null,
      strategy:   tradeInput.strategy   || null,
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
};

module.exports = TradesService;
