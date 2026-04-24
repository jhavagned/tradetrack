// /server/src/modules/validation/trades.validation.js

/**
 * Trade type enum
 * Shared across validation/service layers
 */
const TRADE_TYPES = Object.freeze({
  BUY: "BUY",
  SELL: "SELL",
});

/**
 * Validates incoming trade payload
 * Returns error message string OR null if valid
 */
function validateTrade(trade) {
  const { symbol, type, entryPrice, quantity, exitPrice, exitTime } = trade;

  // =========================
  // Required fields
  // =========================
  if (!symbol || !type || entryPrice == null || quantity == null) {
    return "Missing required fields";
  }

  // =========================
  // Enum validation
  // =========================
  if (!Object.values(TRADE_TYPES).includes(type)) {
    return "Invalid trade type";
  }

  // =========================
  // Numeric validation (NaN)
  // =========================
  if (
    isNaN(Number(entryPrice)) ||
    isNaN(Number(quantity)) ||
    (exitPrice != null && isNaN(Number(exitPrice)))
  ) {
    return "Invalid numeric values";
  }

  // =========================
  // Numeric validation (range)
  // =========================
  if (
    Number(entryPrice) <= 0 ||
    Number(quantity) <= 0 ||
    (exitPrice != null && Number(exitPrice) <= 0)
  ) {
    return "Invalid numeric values";
  }

  // =========================
  // Exit data consistency
  // =========================
  const hasExitPrice = exitPrice != null;
  const hasExitTime = !!exitTime;

  if ((hasExitPrice || hasExitTime) && !(hasExitPrice && hasExitTime)) {
    return "Incomplete exit data";
  }

  return null;
}

module.exports = {
  validateTrade,
  TRADE_TYPES,
};
