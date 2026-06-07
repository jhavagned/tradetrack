// /server/src/modules/analytics/services/analytics.service.js

const AnalyticsRepository = require("../repositories/analytics.repository");
const { SYMBOL_MULTIPLIERS } = require("../../../utils/constants");
const createLogger = require("../../../utils/logger");

const logger = createLogger("analytics.service");

/**
 * Calculate P&L for a single trade
 * Applies futures multiplier where applicable
 *
 * @param {Object} trade - trade row from DB
 * @returns {number} dollar P&L
 */
const calculateTradePnL = (trade) => {
  const multiplier = SYMBOL_MULTIPLIERS[trade.symbol?.toUpperCase()] || 1;
  const entry = Number(trade.entry_price);
  const exit = Number(trade.exit_price);
  const qty = Number(trade.quantity);

  const diff = trade.trade_type === "BUY" ? exit - entry : entry - exit;

  return diff * qty * multiplier;
};

/**
 * Format a date into a period label
 *
 * @param {Date}   date
 * @param {string} period - "day" | "week" | "month"
 * @returns {string} label
 */
const getPeriodLabel = (date, period) => {
  const d = new Date(date);

  if (period === "day") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (period === "week") {
    // ISO week start (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return `Week of ${monday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  }

  // month
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const AnalyticsService = {
  /**
   * P&L grouped by period
   *
   * @param {string} userId
   * @param {string} period - "day" | "week" | "month"
   * @returns {Array} [{ period, pnl }]
   */
  getPnLByPeriod: async (userId, period) => {
    logger.debug("Calculating P&L by period", { userId, period });

    const VALID_PERIODS = ["day", "week", "month"];

    if (!VALID_PERIODS.includes(period)) {
      const err = new Error("Invalid period. Must be day, week, or month");
      err.code = "VALIDATION_ERROR";
      err.status = 400;
      throw err;
    }

    const trades = await AnalyticsRepository.getClosedTrades(userId);

    // Group P&L by period label
    const grouped = {};

    for (const trade of trades) {
      const label = getPeriodLabel(trade.closed_at, period);
      const pnl = calculateTradePnL(trade);
      grouped[label] = (grouped[label] || 0) + pnl;
    }

    const result = Object.entries(grouped).map(([label, pnl]) => ({
      period: label,
      pnl: Math.round(pnl * 100) / 100,
    }));

    logger.debug("P&L by period calculated", { count: result.length });

    return result;
  },

  /**
   * Win rate across all closed trades
   *
   * @param {string} userId
   * @returns {Object} { total, wins, losses, breakevens, winRate }
   */
  getWinRate: async (userId) => {
    logger.debug("Calculating win rate", { userId });

    const trades = await AnalyticsRepository.getClosedTrades(userId);

    let wins = 0,
      losses = 0,
      breakevens = 0;

    for (const trade of trades) {
      const pnl = calculateTradePnL(trade);
      if (pnl > 0) wins++;
      else if (pnl < 0) losses++;
      else breakevens++;
    }

    const total = trades.length;
    const winRate = total > 0 ? Math.round((wins / total) * 10000) / 100 : 0;

    logger.debug("Win rate calculated", { total, wins, losses, winRate });

    return { total, wins, losses, breakevens, winRate };
  },

  /**
   * P&L and win rate grouped by symbol
   *
   * @param {string} userId
   * @returns {Array} [{ symbol, totalPnl, tradeCount, wins, winRate }]
   */
  getSymbolBreakdown: async (userId) => {
    logger.debug("Calculating symbol breakdown", { userId });

    const trades = await AnalyticsRepository.getClosedTrades(userId);

    const symbolMap = {};

    for (const trade of trades) {
      const symbol = trade.symbol.toUpperCase();
      const pnl = calculateTradePnL(trade);

      if (!symbolMap[symbol]) {
        symbolMap[symbol] = { symbol, totalPnl: 0, tradeCount: 0, wins: 0 };
      }

      symbolMap[symbol].totalPnl += pnl;
      symbolMap[symbol].tradeCount += 1;
      if (pnl > 0) symbolMap[symbol].wins += 1;
    }

    const result = Object.values(symbolMap)
      .map((s) => ({
        symbol: s.symbol,
        totalPnl: Math.round(s.totalPnl * 100) / 100,
        tradeCount: s.tradeCount,
        wins: s.wins,
        winRate: Math.round((s.wins / s.tradeCount) * 10000) / 100,
      }))
      .sort((a, b) => b.totalPnl - a.totalPnl);

    logger.debug("Symbol breakdown calculated", { symbolCount: result.length });

    return result;
  },

  /**
   * Emotion analytics — win rate grouped by emotion_before
   * and most common emotions for winning vs losing trades
   *
   * @param {string} userId
   * @returns {Object} {
   *   byEmotion: [{ emotion, total, wins, winRate }],
   *   mostCommonWin: string | null,
   *   mostCommonLoss: string | null
   * }
   */
  getEmotionAnalytics: async (userId) => {
    logger.debug("Calculating emotion analytics", { userId });

    const trades = await AnalyticsRepository.getEmotionTrades(userId);

    if (trades.length === 0) {
      return {
        byEmotion: [],
        mostCommonWin: null,
        mostCommonLoss: null,
      };
    }

    // =========================
    // Group by emotion_before
    // =========================
    const emotionMap = {};
    const winEmotions = {};
    const lossEmotions = {};

    for (const trade of trades) {
      const pnl = calculateTradePnL(trade);
      const isWin = pnl > 0;
      const isLoss = pnl < 0;
      const emotion = trade.emotion_before;

      if (!emotion) continue;

      if (!emotionMap[emotion]) {
        emotionMap[emotion] = { emotion, total: 0, wins: 0 };
      }

      emotionMap[emotion].total += 1;
      if (isWin) emotionMap[emotion].wins += 1;
      if (isWin) winEmotions[emotion] = (winEmotions[emotion] || 0) + 1;
      if (isLoss) lossEmotions[emotion] = (lossEmotions[emotion] || 0) + 1;
    }

    const byEmotion = Object.values(emotionMap)
      .map((e) => ({
        emotion: e.emotion,
        total: e.total,
        wins: e.wins,
        winRate: Math.round((e.wins / e.total) * 10000) / 100,
      }))
      .sort((a, b) => b.winRate - a.winRate);

    // Most common emotion before a win
    const mostCommonWin =
      Object.entries(winEmotions).length > 0
        ? Object.entries(winEmotions).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    // Most common emotion before a loss
    const mostCommonLoss =
      Object.entries(lossEmotions).length > 0
        ? Object.entries(lossEmotions).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    logger.debug("Emotion analytics calculated", {
      emotionCount: byEmotion.length,
      mostCommonWin,
      mostCommonLoss,
    });

    return { byEmotion, mostCommonWin, mostCommonLoss };
  },
};

module.exports = AnalyticsService;
