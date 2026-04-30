// /server/tests/fixtures/trades.js

function validTrade(overrides = {}) {
  return {
    symbol: "AAPL",
    type: "BUY",
    entryPrice: 100,
    quantity: 1,
    exitPrice: 150,
    exitTime: "2026-04-21T10:00:00Z",
    ...overrides,
  };
}

function invalidTrade(overrides = {}) {
  return {
    type: "BUY",
    entryPrice: 100,
    ...overrides,
  };
}

module.exports = { validTrade, invalidTrade };
