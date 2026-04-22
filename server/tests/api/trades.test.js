// /server/tests/api/trades.test.js

const request = require("supertest");
const app = require("../../src/app");
const repo = require("../../src/repositories/trades.repository");
const { validTrade, invalidTrade } = require("../fixtures/trades");

describe("Trade API", () => {
  beforeEach(() => {
    repo.clear();
  });

  // =========================
  // Test Case 1.1
  // Successful Trade Creation
  // =========================
  it("creates a trade", async () => {
    const res = await request(app)
      .post("/api/trades")
      .send(validTrade());

    expect(res.status).toBe(201);
    expect(res.body.data.symbol).toBe("AAPL");
  });

  // =========================
  // Test Case 1.2
  // Missing Required Fields
  // =========================
  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/api/trades")
      .send(invalidTrade());

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toBe("Missing required fields");
  });

  // =========================
  // Test Case 1.3
  // Invalid Numeric Values
  // =========================
  it("rejects invalid numeric values", async () => {
    const res = await request(app)
      .post("/api/trades")
      .send({
        symbol: "AAPL",
        type: "LONG",
        entryPrice: -100,
        quantity: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid numeric values");
  });

  // =========================
  // Test Case 1.4
  // Partial Exit Data
  // =========================
  it("rejects partial exit data", async () => {
    const res = await request(app)
      .post("/api/trades")
      .send({
        symbol: "AAPL",
        type: "LONG",
        entryPrice: 100,
        quantity: 1,
        exitPrice: 110
        // missing exitTime
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Incomplete exit data");
  });

  // =========================
  // Test Case 1.5
  // Form Reset (API-level equivalent)
  // =========================
  it("returns clean trade response structure after creation", async () => {
    const res = await request(app)
      .post("/api/trades")
      .send({
        symbol: "AAPL",
        type: "LONG",
        entryPrice: 100,
        quantity: 1
      });

    expect(res.status).toBe(201);

    // ensures API returns normalized + computed fields
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
    expect(typeof res.body.data.entryPrice).toBe("number");
  });
});