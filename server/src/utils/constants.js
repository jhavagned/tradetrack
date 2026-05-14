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

module.exports = { SYMBOL_MULTIPLIERS };
