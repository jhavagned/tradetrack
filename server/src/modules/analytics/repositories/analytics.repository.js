// /server/src/modules/analytics/repositories/analytics.repository.js

const { query } = require("../../../db/config/db");
const createLogger = require("../../../utils/logger");

const logger = createLogger("analytics.repository");

const AnalyticsRepository = {
  /**
   * Fetch all closed trades for a user
   * Used as the base dataset for all analytics calculations
   *
   * @param {string} userId
   * @returns {Array} closed trades
   */
  getClosedTrades: async (userId) => {
    logger.debug("Fetching closed trades for analytics", { userId });

    const { rows } = await query(
      `SELECT
            trade_id,
            symbol,
            trade_type,
            entry_price,
            exit_price,
            quantity,
            closed_at
        FROM trades
        WHERE user_id    = $1
            AND trade_status = 'closed'
            AND exit_price IS NOT NULL
        ORDER BY closed_at ASC`,
      [userId],
    );

    return rows;
  },
};

module.exports = AnalyticsRepository;
