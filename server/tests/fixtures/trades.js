// /server/tests/fixtures/trades.js

const request = require("supertest");
const app = require("../../src/app");

function validTrade(overrides = {}) {
  return {
    symbol: "AAPL",
    type: "BUY",
    entryPrice: 100,
    quantity: 1,
    entryTime: "2026-04-21T09:00:00Z",
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

// Helper to create an open trade and return it
function openTrade(overrides = {}) {
  return {
    symbol: "AAPL",
    type: "BUY",
    entryPrice: 100,
    quantity: 1,
    entryTime: "2026-04-21T09:00:00Z",
    ...overrides,
  };
}

const createOpenTrade = async (cookie) => {
  const res = await request(app)
    .post("/api/trades")
    .set("Cookie", cookie)
    .send(openTrade());
  return res.body.data;
};

module.exports = { validTrade, invalidTrade, openTrade, createOpenTrade };
