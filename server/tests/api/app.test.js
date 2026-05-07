// /server/tests/api/app.test.js

const request = require("supertest");
const app = require("../../src/app");
const { validTrade } = require("../fixtures/trades");
const { getAuthCookie, clearDatabase } = require("../fixtures/auth");

/**
 * =========================================================
 * APP INFRASTRUCTURE TEST SUITE
 * =========================================================
 *
 * PURPOSE:
 * Validates system-level behavior that is NOT specific
 * to trade business logic, but ensures that the application
 * infrastructure is working correctly.
 *
 * COVERAGE:
 * - Request lifecycle (middleware)
 * - Request ID generation and propagation
 * - Response structure consistency
 * - Basic API contract guarantees
 * - End-to-end persistence behavior
 *
 * WHY THIS EXISTS:
 * As the application grows, we separate:
 * 1. Business Logic Tests  → trades.test.js
 * 2. Infrastructure Tests  → app.test.js
 *
 * This keeps concerns isolated and improves maintainability.
 * =========================================================
 */

describe("App Infrastructure", () => {
  let cookie;

  afterAll(async () => {
    await clearDatabase();
  });

  /**
   * Full isolation between tests.
   * Clears the test database and creates a fresh
   * authenticated session before each test.
   */
  beforeEach(async () => {
    await clearDatabase();
    cookie = await getAuthCookie();
  });

  // =========================
  // Test Case 2.1
  // Request ID Header Presence
  // =========================
  /**
   * Ensures that every response includes a unique request ID header.
   *
   * WHY:
   * - Enables request tracing between client and server
   * - Critical for debugging and observability
   */
  it("attaches x-request-id header to response", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    expect(res.headers["x-request-id"]).toBeDefined();
  });

  // =========================
  // Test Case 2.2
  // Request ID Uniqueness
  // =========================
  /**
   * Ensures that each request gets a unique requestId.
   *
   * WHY:
   * - Prevents log correlation conflicts
   * - Ensures safe tracing in concurrent environments
   */
  it("generates unique requestId per request", async () => {
    const res1 = await request(app).get("/api/trades").set("Cookie", cookie);
    const res2 = await request(app).get("/api/trades").set("Cookie", cookie);

    expect(res1.headers["x-request-id"]).toBeDefined();
    expect(res2.headers["x-request-id"]).toBeDefined();
    expect(res1.headers["x-request-id"]).not.toBe(res2.headers["x-request-id"]);
  });

  // =========================
  // Test Case 2.3
  // GET Response Shape
  // =========================
  /**
   * Ensures that GET /api/trades always returns an array.
   *
   * WHY:
   * - Prevents frontend crashes
   * - Enforces consistent API contract
   */
  it("returns an array of trades", async () => {
    const res = await request(app).get("/api/trades").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // =========================
  // Test Case 2.4
  // Persistence Across Requests
  // =========================
  /**
   * Ensures that a created trade is retrievable via GET.
   *
   * WHY:
   * - Validates repository integration
   * - Confirms end-to-end request flow works
   */
  it("persists trade across requests", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());
  
    // Use the same cookie for the GET — the session must remain
    // valid between the POST and GET within the same test.
    const res = await request(app)
      .get("/api/trades")
      .set("Cookie", cookie);
  
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // =========================
  // Test Case 2.5
  // Standardized Error Response
  // =========================
  /**
   * Ensures all errors follow a consistent response structure.
   *
   * EXPECTED FORMAT:
   * {
   *   status: "error",
   *   message: string
   * }
   *
   * WHY:
   * - Prevents leaking internal errors
   * - Ensures frontend can reliably handle failures
   */
  it("returns standardized error response", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("status", "error");
    expect(res.body).toHaveProperty("message");
  });

  // =========================
  // Test Case 2.6
  // Concurrency Safety
  // =========================
  /**
   * Ensures unique requestIds under concurrent requests.
   *
   * WHY:
   * - Validates AsyncLocalStorage concurrency safety
   * - Prevents log correlation conflicts under load
   */
  it("maintains unique requestIds under concurrent requests", async () => {
    const requests = Array.from({ length: 10 }).map(() =>
      request(app).get("/api/trades").set("Cookie", cookie),
    );

    const responses = await Promise.all(requests);
    const ids = responses.map((r) => r.headers["x-request-id"]);
    expect(new Set(ids).size).toBe(10);
  });

  // =========================
  // Test Case 2.7
  // Context Leakage Safety
  // =========================
  /**
   * Ensures request context does not leak between
   * concurrent requests.
   *
   * WHY:
   * - Validates AsyncLocalStorage isolation
   * - Critical for correct per-request logging
   */
  it("does not leak request context between concurrent requests", async () => {
    const results = [];

    await Promise.all(
      Array.from({ length: 5 }).map(() =>
        request(app)
          .post("/api/trades")
          .set("Cookie", cookie)
          .send(validTrade())
          .then((res) => {
            results.push(res.headers["x-request-id"]);
          }),
      ),
    );

    expect(new Set(results).size).toBe(5);
  });

  // =========================
  // Test Case 2.8
  // Error Response Still Tracked
  // =========================
  /**
   * Ensures x-request-id is present even on error responses.
   *
   * WHY:
   * - Errors must be traceable
   * - Observability must not be lost on failure paths
   */
  it("includes x-request-id even on error responses", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.headers["x-request-id"]).toBeDefined();
  });
});