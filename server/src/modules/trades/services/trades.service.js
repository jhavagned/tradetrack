const validateTrade = require("../validation/trades.validation");
const TradesRepository = require("../repositories/trades.repository");

const TradesService = {
  getAllTrades: () => {
    return TradesRepository.findAll();
  },

  createTrade: (tradeInput) => {
    const error = validateTrade(tradeInput);

    if (error) {
      const err = new Error(error);
      err.status = 400;
      throw err;
    }

    const newTrade = {
      ...tradeInput,
      id: Date.now(),
      entryPrice: Number(tradeInput.entryPrice),
      quantity: Number(tradeInput.quantity),
      exitPrice: tradeInput.exitPrice ? Number(tradeInput.exitPrice) : null,
      createdAt: new Date().toISOString()
    };

    return TradesRepository.create(newTrade);
  }
};

module.exports = TradesService;