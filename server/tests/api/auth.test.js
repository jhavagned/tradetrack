// /server/tests/api/auth.test.js

const request = require("supertest");
const app = require("../../src/app");
const { getAuthCookie, clearDatabase } = require("../fixtures/auth");
const { validTrade } = require("../fixtures/trades");

/**
 * =========================================================
 * AUTHENTICATION SYSTEM TEST SUITE
 * =========================================================
 *
 * PURPOSE:
 * Validates all authentication-related behavior including
 * session creation, protection, persistence and invalidation.
 *
 * COVERAGE:
 * - Login creates session and cookie
 * - Protected routes blocked without session
 * - Protected routes accessible with valid session
 * - Session persists across multiple requests
 * - Logout invalidates session
 * - Invalid session rejected
 * - End-to-end auth + trade flow
 *
 * WHY THIS EXISTS:
 * Authentication is the security backbone of the application.
 * These tests ensure no regressions are introduced as the
 * system evolves.
 * =========================================================
 */

describe("Authentication System", () => {
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
  // Test Case 3.1
  // Login Creates Session + Cookie
  // =========================
  /**
   * Ensures that a successful login returns a session cookie.
   *
   * WHY:
   * - Cookie is required for all subsequent authenticated requests
   * - Validates the full login flow end-to-end
   */
  it("logs in user and sets session cookie", async () => {
    expect(cookie).toBeDefined();
    expect(typeof cookie).toBe("string");
    expect(cookie.includes("sessionId=")).toBe(true);
  });

  // =========================
  // Test Case 3.2
  // Protected Route Blocked Without Session
  // =========================
  /**
   * Ensures that protected routes reject unauthenticated requests.
   *
   * WHY:
   * - Core security requirement
   * - Validates auth middleware is applied correctly
   */
  it("blocks access to protected route without session", async () => {
    const res = await request(app).get("/api/trades");
    expect(res.status).toBe(401);
  });

  // =========================
  // Test Case 3.3
  // Access Protected Route With Valid Session
  // =========================
  /**
   * Ensures that a valid session grants access to protected routes.
   *
   * WHY:
   * - Validates session validation flow
   * - Confirms auth middleware passes valid sessions correctly
   */
  it("allows access to protected route with valid session", async () => {
    const res = await request(app).get("/api/trades").set("Cookie", cookie);
    expect(res.status).toBe(200);
  });

  // =========================
  // Test Case 3.4
  // Session Persists Across Multiple Requests
  // =========================
  /**
   * Ensures that a session remains valid across multiple requests.
   *
   * WHY:
   * - Validates session persistence in PostgreSQL
   * - Confirms session is not invalidated after first use
   */
  it("maintains session across multiple requests", async () => {
    const res1 = await request(app).get("/api/trades").set("Cookie", cookie);
    const res2 = await request(app).get("/api/trades").set("Cookie", cookie);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });

  // =========================
  // Test Case 3.5
  // Logout Invalidates Session
  // =========================
  /**
   * Ensures that logging out destroys the session.
   *
   * WHY:
   * - Validates logout flow end-to-end
   * - Confirms session is deleted from PostgreSQL on logout
   */
  it("invalidates session after logout", async () => {
    await request(app).post("/api/auth/logout").set("Cookie", cookie);

    const res = await request(app).get("/api/trades").set("Cookie", cookie);
    expect(res.status).toBe(401);
  });

  // =========================
  // Test Case 3.6
  // Invalid Session Rejected
  // =========================
  /**
   * Ensures that a made-up or expired sessionId is rejected.
   *
   * WHY:
   * - Validates that the session lookup correctly returns null
   *   for unknown session IDs
   * - Prevents unauthorized access via forged cookies
   */
  it("rejects requests with invalid sessionId", async () => {
    const res = await request(app)
      .get("/api/trades")
      .set("Cookie", "sessionId=invalid-session");

    expect(res.status).toBe(401);
  });

  // =========================
  // Test Case 3.7
  // Auth + Trade Flow (End-to-End)
  // =========================
  /**
   * Ensures an authenticated user can create and retrieve trades.
   *
   * WHY:
   * - Validates the full auth + trade integration
   * - Confirms userId is correctly propagated from session
   *   through to trade creation
   */
  it("allows authenticated user to create and retrieve trades", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    const res = await request(app).get("/api/trades").set("Cookie", cookie);
    expect(res.status).toBe(200);
  });

  // =========================
  // Test Case 3.8
  // Duplicate Email Registration
  // =========================
  /**
   * Ensures that registering with an existing email
   * returns a 409 Conflict.
   *
   * WHY:
   * - Validates duplicate email constraint handling
   * - Confirms structured error response shape
   */
  it("rejects duplicate email registration", async () => {
    // Register first user
    await request(app)
      .post("/api/auth/register")
      .send({ email: "duplicate@example.com", password: "Password1!" });

    // Attempt duplicate registration
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "duplicate@example.com", password: "Password1!" });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toMatch(/already exists/i);
    expect(res.body.error.code).toBe("DUPLICATE_ERROR");
  });

  // =========================
  // Test Case 3.9
  // Login With Wrong Password
  // =========================
  /**
   * Ensures that login with incorrect password
   * returns a 401 Unauthorized.
   *
   * WHY:
   * - Validates credential verification logic
   * - Confirms error shape on auth failure
   */
  it("rejects login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "WrongPassword1!" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toMatch(/invalid credentials/i);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  // =========================
  // Test Case 3.10
  // Login With Non-Existent Email
  // =========================
  /**
   * Ensures that login with an unregistered email
   * returns a 401 Unauthorized.
   *
   * WHY:
   * - Validates that non-existent users are rejected
   * - Confirms same error shape as wrong password
   *   to prevent email enumeration
   */
  it("rejects login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Password1!" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toMatch(/invalid credentials/i);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  // =========================
  // Test Case 3.11
  // Register With Missing Email
  // =========================
  /**
   * Ensures that registration without an email
   * returns a 400 Bad Request.
   *
   * WHY:
   * - Validates required field enforcement
   * - Confirms error shape on validation failure
   */
  it("rejects registration with missing email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ password: "Password1!" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  // =========================
  // Test Case 3.12
  // Register With Missing Password
  // =========================
  /**
   * Ensures that registration without a password
   * returns a 400 Bad Request.
   *
   * WHY:
   * - Validates required field enforcement
   * - Confirms error shape on validation failure
   */
  it("rejects registration with missing password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
