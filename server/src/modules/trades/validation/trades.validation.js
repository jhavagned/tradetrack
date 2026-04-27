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
 * Standard validation error shape
 *
 * @param {string} message - Human-readable error message
 * @param {string} [field] - Field associated with the error
 * @returns {{ message: string, field?: string }}
 */
function createValidationError(message, field) {
  return field ? { message, field } : { message };
}

/**
 * Validates incoming trade payload
 * 
 * @param {Object} trade - Incoming trade payload
 * @returns {null | { message: string, field?: string }}
 */
function validateTrade(trade) {
  if (!trade || typeof trade !== "object") {
    return createValidationError("Invalid payload");
  }

  const {
    symbol,
    type,
    entryPrice,
    quantity,
    exitPrice,
    exitTime,
  } = trade;

  // =========================
  // Required fields
  // =========================
  if (!symbol) {
    return createValidationError("Symbol is required", "symbol");
  }

  if (!type) {
    return createValidationError("Trade type is required", "type");
  }

  if (entryPrice == null) {
    return createValidationError("Entry price is required", "entryPrice");
  }

  if (quantity == null) {
    return createValidationError("Quantity is required", "quantity");
  }

  // =========================
  // Enum validation
  // =========================
  if (!Object.values(TRADE_TYPES).includes(type)) {
    return createValidationError("Invalid trade type", "type");
  }

  // =========================
  // Numeric validation (NaN)
  // =========================
  if (isNaN(Number(entryPrice))) {
    return createValidationError("Entry price must be a number", "entryPrice");
  }

  if (isNaN(Number(quantity))) {
    return createValidationError("Quantity must be a number", "quantity");
  }

  if (exitPrice != null && isNaN(Number(exitPrice))) {
    return createValidationError("Exit price must be a number", "exitPrice");
  }
  // =========================
  // Numeric validation (range)
  // =========================
  if (Number(entryPrice) <= 0) {
    return createValidationError("Entry price must be greater than 0", "entryPrice");
  }

  if (Number(quantity) <= 0) {
    return createValidationError("Quantity must be greater than 0", "quantity");
  }

  if (exitPrice != null && Number(exitPrice) <= 0) {
    return createValidationError("Exit price must be greater than 0", "exitPrice");
  }

  // =========================
  // Exit data consistency
  // =========================
  const hasExitPrice = exitPrice != null;
  const hasExitTime = !!exitTime;

  if ((hasExitPrice || hasExitTime) && !(hasExitPrice && hasExitTime)) {
    return createValidationError(
      "Exit price and exit time must both be provided",
      "exit"
    );
  }

  return null;
}

module.exports = {
  validateTrade,
  TRADE_TYPES,
};
