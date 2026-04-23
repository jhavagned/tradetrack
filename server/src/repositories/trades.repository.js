const trades = [];

/**
 * Data access layer (simulates DB)
 */
const TradesRepository = {
  findAll: () => trades,

  create: (trade) => {
    trades.push(trade);
    return trade;
  },

  clear: () => {
    trades.length = 0;
  }
};

module.exports = TradesRepository;