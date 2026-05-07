// /server/src/modules/trades/repositories/trades.repository.js

const { query } = require("../../../db/config/db");
const createLogger = require("../../../utils/logger");

const logger = createLogger("trades.repository");



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
   * Retrieve all trades for a specific user
   *
   * @param {string} userId - The user's UUID
   * @returns {Array} List of trades
   */
  findAll: async (userId) => {
    logger.debug("Retrieving all trades from database", { userId });
  
    const { rows } = await query(
      `SELECT * FROM trades 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
  
    return rows;
  },

  /**
   * Persist a new trade
   *
   * @param {Object} trade - { userId, symbol, tradeType, entryPrice, exitPrice, entryTime, exitTime, quantity, notes, strategy }
   * @returns {Object} - The newly created trade row
   */
  create: async ({ userId, symbol, tradeType, entryPrice, exitPrice, entryTime, exitTime, quantity, notes, strategy }) => {
    logger.debug("Inserting new trade", { userId, symbol });

    // Derive trade status and closed at from whether an exit price was provided
    const tradeStatus = exitPrice ? 'closed' : 'open';
    const closedAt = exitPrice ? new Date() : null;

    const { rows } = await query(
      `INSERT INTO trades (user_id, symbol, trade_type, entry_price, exit_price, entry_time, exit_time, quantity, trade_status, closed_at, notes, strategy)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [userId, symbol, tradeType, entryPrice, exitPrice || null, entryTime || null, exitTime || null, quantity, tradeStatus, closedAt, notes || null, strategy || null]
    );

    logger.debug("Trade persisted", {
      tradeId: rows[0].trade_id,
      tradeStatus,
    });

    return rows[0];
  },
};

module.exports = TradesRepository;
