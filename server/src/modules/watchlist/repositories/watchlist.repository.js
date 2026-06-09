// /server/src/modules/watchlist/repositories/watchlist.repository.js

const { query } = require("../../../db/config/db");
const createLogger = require("../../../utils/logger");
const { handleDbError } = require("../../../utils/dbErrorHandler");

const logger = createLogger("watchlist.repository");

const WatchlistRepository = {
  /**
   * Get all watchlist items for a user ordered by position
   *
   * @param {string} userId
   * @returns {Array} watchlist items
   */
  findAll: async (userId) => {
    logger.debug("Fetching watchlist items", { userId });

    const { rows } = await query(
      `SELECT item_id, symbol, position, created_at
       FROM watchlist_items
       WHERE user_id = $1
       ORDER BY position ASC, created_at ASC`,
      [userId],
    );

    return rows;
  },

  /**
   * Add a ticker to the watchlist
   *
   * @param {string} userId
   * @param {string} symbol
   * @param {number} position
   * @returns {Object} the new watchlist item
   */
  addItem: async (userId, symbol, position) => {
    logger.debug("Adding watchlist item", { userId, symbol });

    try {
      const { rows } = await query(
        `INSERT INTO watchlist_items (user_id, symbol, position)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, symbol.toUpperCase(), position],
      );

      logger.debug("Watchlist item added", { symbol });

      return rows[0];
    } catch (error) {
      handleDbError(error);
    }
  },

  /**
   * Remove a ticker from the watchlist
   *
   * @param {string} itemId
   * @param {string} userId
   * @returns {void}
   */
  removeItem: async (itemId, userId) => {
    logger.debug("Removing watchlist item", { itemId });

    try {
      await query(
        `DELETE FROM watchlist_items
         WHERE item_id = $1 AND user_id = $2`,
        [itemId, userId],
      );

      logger.debug("Watchlist item removed", { itemId });
    } catch (error) {
      handleDbError(error);
    }
  },

  /**
   * Count items for a user
   *
   * @param {string} userId
   * @returns {number}
   */
  countItems: async (userId) => {
    const { rows } = await query(
      `SELECT COUNT(*) FROM watchlist_items WHERE user_id = $1`,
      [userId],
    );

    return parseInt(rows[0].count, 10);
  },

  /**
   * Check if a symbol already exists for a user
   *
   * @param {string} userId
   * @param {string} symbol
   * @returns {boolean}
   */
  symbolExists: async (userId, symbol) => {
    const { rows } = await query(
      `SELECT 1 FROM watchlist_items
       WHERE user_id = $1 AND symbol = $2`,
      [userId, symbol.toUpperCase()],
    );

    return rows.length > 0;
  },
};

module.exports = WatchlistRepository;
