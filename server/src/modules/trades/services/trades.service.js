// /server/src/modules/services/trades.service.js

const { validateTrade } = require("../validation/trades.validation");
const TradesRepository = require("../repositories/trades.repository");

/**
 * Trade Service
 * Handles business logic for trades
 */
const TradesService = {
  /**
   * Fetch all trades
   */
  getAllTrades: async () => {
    return TradesRepository.findAll();
  },

  /**
   * Create a new trade
   */
  createTrade: async (tradeInput) => {
    // =========================
    // Validation
    // =========================
    const error = validateTrade(tradeInput);

    if (error) {
      const err = new Error(error);
      err.code = "VALIDATION_ERROR";
      err.status = 400;
      throw err;
    }

    // =========================
    // Data Normalization
    // =========================
    const newTrade = {
      symbol: tradeInput.symbol,
      type: tradeInput.type,
      entryPrice: Number(tradeInput.entryPrice),
      quantity: Number(tradeInput.quantity),
      exitPrice: tradeInput.exitPrice ? Number(tradeInput.exitPrice) : null,
      exitTime: tradeInput.exitTime || null,
      notes: tradeInput.notes || "",
      strategy: tradeInput.strategy || "",

      // System fields
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    // =========================
    // Persist
    // =========================
    return TradesRepository.create(newTrade);
  },
};

module.exports = TradesService;
