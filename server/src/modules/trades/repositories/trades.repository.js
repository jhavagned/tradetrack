// /server/src/modules/trades/repositories/trades.repository.js

const createLogger = require("../../../utils/logger");
const logger = createLogger("trades.repository");

/**
 * In-memory data store
 *
 * - This simulates a database
 * - Data resets when server restarts
 */
const trades = [];

/**

 */
/**
 * Trades Repository
 *
 * Data access layer (simulates DB)
 *
 * RESPONSIBILITIES:
 * - Handle data persistence
 * - Provide read/write access to trade records
 * - Remain free of business logic
 *
 * LOGGING STRATEGY:
 * - Log data access (reads)
 * - Log persistence operations (writes)
 * - Include minimal but useful metadata
 */
const TradesRepository = {
  /**
   * Retrieve all trades
   *
   * @returns {Array} List of trades
   */
  findAll: () => {
    logger.debug("Retrieving all trades from store");

    return trades;
  },

  /**
   * Persist a new trade
   *
   * @param {Object} trade - Normalized trade object
   * @returns {Object} Saved trade
   */
  create: (trade) => {
    trades.push(trade);

    logger.debug("Trade persisted", {
      tradeId: trade.id,
    });

    return trade;
  },

  /**
   * Clear all trades
   */
  clear: () => {
    trades.length = 0;

    logger.warn("All trades cleared from store");
  },
};

module.exports = TradesRepository;
