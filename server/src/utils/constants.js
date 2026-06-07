// /server/src/utils/constants.js

/**
 * Futures contract multipliers
 *
 * Used to calculate actual dollar P&L for futures instruments.
 * Shared across the analytics and trades modules.
 *
 * P&L formula:
 * (exitPrice - entryPrice) * quantity * multiplier  (BUY)
 * (entryPrice - exitPrice) * quantity * multiplier  (SELL)
 */
const SYMBOL_MULTIPLIERS = {
  NQ: 20,
  ES: 50,
  YM: 5,
  RTY: 50,
  MNQ: 2,
  MES: 5,
  MYM: 0.5,
  M2K: 5,
};

/**
 * Valid emotional state values
 * Used for trade journal entries (before, during, after)
 */
const VALID_EMOTIONS = Object.freeze([
  "Calm",
  "Confident",
  "Focused",
  "Excited",
  "Neutral",
  "Uncertain",
  "Confused",
  "Anxious",
  "Nervous",
  "Fearful",
  "Greedy",
  "Impatient",
  "FOMO",
  "Revenge",
]);

module.exports = { SYMBOL_MULTIPLIERS, VALID_EMOTIONS };
