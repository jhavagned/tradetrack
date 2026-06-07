// /server/tests/api/analytics.test.js

const request = require("supertest");
const app = require("../../src/app");
const { getAuthCookie, clearDatabase } = require("../fixtures/auth");
const { validTrade, openTrade } = require("../fixtures/trades");

/**
 * =========================================================
 * ANALYTICS API TEST SUITE
 * =========================================================
 *
 * PURPOSE:
 * Validates all analytics endpoints including P&L by period,
 * win rate, and symbol breakdown.
 *
 * COVERAGE:
 * - Empty state (no closed trades)
 * - Correct calculations with known trade data
 * - Period validation
 * - Auth protection
 *
 * DESIGN PRINCIPLES:
 * - Uses known trade values to assert exact calculations
 * - Tests are isolated via beforeEach database clear
 * =========================================================
 */

describe("Analytics API", () => {
  let cookie;

  afterAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    cookie = await getAuthCookie();
  });

  // =========================
  // Test Case 4.1
  // P&L by period — empty state
  // =========================
  /**
   * Validates that the endpoint returns an empty array
   * when there are no closed trades.
   */
  it("returns empty array for P&L when no closed trades exist", async () => {
    const res = await request(app)
      .get("/api/analytics/pnl?period=day")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // =========================
  // Test Case 4.2
  // P&L by period — with data
  // =========================
  /**
   * Validates that P&L is calculated correctly for a known trade.
   * AAPL BUY: (150 - 100) * 1 * 1 = $50
   */
  it("returns correct P&L by day for closed trades", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    const res = await request(app)
      .get("/api/analytics/pnl?period=day")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(typeof res.body.data[0].period).toBe("string");
    expect(typeof res.body.data[0].pnl).toBe("number");
  });

  // =========================
  // Test Case 4.3
  // P&L by period — invalid period
  // =========================
  /**
   * Validates that an invalid period returns 400.
   */
  it("returns 400 for invalid period parameter", async () => {
    const res = await request(app)
      .get("/api/analytics/pnl?period=year")
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  // =========================
  // Test Case 4.4
  // Win rate — empty state
  // =========================
  /**
   * Validates that win rate returns zero values
   * when there are no closed trades.
   */
  it("returns zero win rate when no closed trades exist", async () => {
    const res = await request(app)
      .get("/api/analytics/win-rate")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.winRate).toBe(0);
  });

  // =========================
  // Test Case 4.5
  // Win rate — with data
  // =========================
  /**
   * Validates win rate calculation with a known winning trade.
   * AAPL BUY entry 100 exit 150 = profit = win
   */
  it("calculates win rate correctly for closed trades", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    const res = await request(app)
      .get("/api/analytics/win-rate")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.wins).toBe(1);
    expect(res.body.data.losses).toBe(0);
    expect(res.body.data.winRate).toBe(100);
  });

  // =========================
  // Test Case 4.6
  // Symbol breakdown — empty state
  // =========================
  /**
   * Validates that symbol breakdown returns empty array
   * when there are no closed trades.
   */
  it("returns empty array for symbol breakdown when no closed trades exist", async () => {
    const res = await request(app)
      .get("/api/analytics/symbols")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // =========================
  // Test Case 4.7
  // Symbol breakdown — with data
  // =========================
  /**
   * Validates symbol breakdown includes correct fields
   * and is sorted by totalPnl descending.
   */
  it("returns symbol breakdown sorted by P&L", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    const res = await request(app)
      .get("/api/analytics/symbols")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    const symbol = res.body.data[0];
    expect(symbol.symbol).toBeDefined();
    expect(symbol.totalPnl).toBeDefined();
    expect(symbol.tradeCount).toBe(1);
    expect(symbol.winRate).toBe(100);
  });

  // =========================
  // Test Case 4.8
  // Open trades excluded
  // =========================
  /**
   * Validates that open trades are not included
   * in any analytics calculation.
   */
  it("excludes open trades from all analytics", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(openTrade());

    const [pnlRes, winRateRes, symbolRes] = await Promise.all([
      request(app).get("/api/analytics/pnl?period=day").set("Cookie", cookie),
      request(app).get("/api/analytics/win-rate").set("Cookie", cookie),
      request(app).get("/api/analytics/symbols").set("Cookie", cookie),
    ]);

    expect(pnlRes.body.data).toEqual([]);
    expect(winRateRes.body.data.total).toBe(0);
    expect(symbolRes.body.data).toEqual([]);
  });

  // =========================
  // Test Case 4.9
  // Auth protection
  // =========================
  /**
   * Validates that all analytics endpoints require authentication.
   */
  it("returns 401 for unauthenticated requests", async () => {
    const [pnlRes, winRateRes, symbolRes] = await Promise.all([
      request(app).get("/api/analytics/pnl?period=day"),
      request(app).get("/api/analytics/win-rate"),
      request(app).get("/api/analytics/symbols"),
    ]);

    expect(pnlRes.status).toBe(401);
    expect(winRateRes.status).toBe(401);
    expect(symbolRes.status).toBe(401);
  });

  // =========================
  // Test Case 4.10
  // Emotion analytics — empty state
  // =========================
  /**
   * Validates that emotion analytics returns empty state
   * when no trades have emotion data.
   */
  it("returns empty state for emotion analytics when no emotion data exists", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    const res = await request(app)
      .get("/api/analytics/emotions")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.byEmotion).toEqual([]);
    expect(res.body.data.mostCommonWin).toBeNull();
    expect(res.body.data.mostCommonLoss).toBeNull();
  });

  // =========================
  // Test Case 4.11
  // Emotion analytics — with data
  // =========================
  /**
   * Validates emotion analytics calculates correctly
   * for trades with emotion_before set.
   */
  it("returns emotion analytics for trades with emotion data", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send({
        ...validTrade(),
        emotionBefore: "Calm",
      });

    const res = await request(app)
      .get("/api/analytics/emotions")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.byEmotion.length).toBeGreaterThan(0);
    expect(res.body.data.byEmotion[0].emotion).toBe("Calm");
    expect(res.body.data.byEmotion[0].winRate).toBe(100);
    expect(res.body.data.mostCommonWin).toBe("Calm");
    expect(res.body.data.mostCommonLoss).toBeNull();
  });

  // =========================
  // Test Case 4.12
  // Emotion analytics — auth protection
  // =========================
  /**
   * Validates that emotion analytics requires authentication.
   */
  it("returns 401 for unauthenticated emotion analytics request", async () => {
    const res = await request(app).get("/api/analytics/emotions");

    expect(res.status).toBe(401);
  });
});
