// /server/src/modules/trades/repositories/trades.repository.js

const { query } = require("../../../db/config/db");
const createLogger = require("../../../utils/logger");
const { handleDbError } = require("../../../utils/dbErrorHandler");

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
      [userId],
    );

    return rows;
  },

  /**
   * Persist a new trade
   *
   * @param {Object} trade - { userId, symbol, tradeType, entryPrice, exitPrice, entryTime, exitTime, quantity, notes, strategy }
   * @returns {Object} - The newly created trade row
   */
  create: async ({
    userId,
    symbol,
    tradeType,
    entryPrice,
    exitPrice,
    entryTime,
    exitTime,
    quantity,
    notes,
    strategy,
  }) => {
    logger.debug("Inserting new trade", { userId, symbol });

    // Derive trade status and closed at from whether an exit price was provided
    const tradeStatus = exitPrice ? "closed" : "open";
    const closedAt = exitPrice ? new Date() : null;

    try {
      const { rows } = await query(
        `INSERT INTO trades (user_id, symbol, trade_type, entry_price, exit_price, entry_time, exit_time, quantity, trade_status, closed_at, notes, strategy)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          userId,
          symbol,
          tradeType,
          entryPrice,
          exitPrice || null,
          entryTime || null,
          exitTime || null,
          quantity,
          tradeStatus,
          closedAt,
          notes || null,
          strategy || null,
        ],
      );

      logger.debug("Trade persisted", {
        tradeId: rows[0].trade_id,
        tradeStatus,
      });

      return rows[0];
    } catch (error) {
      handleDbError(error);
    }
  },

  /**
   * Find a single trade by tradeId
   *
   * @param {string} tradeId - The trade's UUID
   * @returns {Object|null} The trade row or null if not found
   */
  findById: async (tradeId) => {
    logger.debug("Finding trade by ID", { tradeId });

    const { rows } = await query(`SELECT * FROM trades WHERE trade_id = $1`, [
      tradeId,
    ]);

    return rows[0] || null;
  },

  /**
   * Close an open trade
   *
   * @param {string} tradeId - The trade's UUID
   * @param {number} exitPrice - The exit price
   * @param {string} exitTime - The exit timestamp
   * @param {Date} closedAt - Server-derived close timestamp
   * @returns {Object} The updated trade row
   */
  closeTrade: async (tradeId, exitPrice, exitTime, closedAt) => {
    logger.debug("Closing trade in database", { tradeId });

    try {
      const { rows } = await query(
        `UPDATE trades
        SET exit_price   = $1,
            exit_time    = $2,
            trade_status = 'closed',
            closed_at    = $3
        WHERE trade_id = $4
        RETURNING *`,
        [exitPrice, exitTime, closedAt, tradeId],
      );

      logger.debug("Trade closed in database", { tradeId });

      return rows[0];
    } catch (error) {
      handleDbError(error);
    }
  },

  /**
   * Delete a trade by ID
   *
   * @param {string} tradeId - The trade's UUID
   * @returns {void}
   */
  deleteTrade: async (tradeId) => {
    logger.debug("Deleting trade from database", { tradeId });

    try {
      await query(`DELETE FROM trades WHERE trade_id = $1`, [tradeId]);

      logger.debug("Trade deleted from database", { tradeId });
    } catch (error) {
      handleDbError(error);
    }
  },
};

module.exports = TradesRepository;
