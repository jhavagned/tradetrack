const TradesService = require("../services/trades.service");

const TradesController = {
  getAll: (req, res) => {
    const trades = TradesService.getAllTrades();

    res.json({
      status: "success",
      data: trades
    });
  },

  create: (req, res) => {
    try {
      const trade = TradesService.createTrade(req.body);

      res.status(201).json({
        status: "success",
        message: "Trade created",
        data: trade
      });
    } catch (err) {
      res.status(err.status || 500).json({
        status: "error",
        message: err.message
      });
    }
  }
};

module.exports = TradesController;