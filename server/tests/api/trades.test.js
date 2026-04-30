// // /server/tests/api/trades.test.js

// /**
//  * Trade API Test Suite
//  *
//  * PURPOSE:
//  * This suite validates all trade-related business logic,
//  * including validation rules, data normalization, and API responses.
//  *
//  * COVERAGE:
//  * - Trade creation success path
//  * - Validation failures (required fields, numeric rules, enums)
//  * - Data normalization and response structure
//  * - API contract enforcement for trade-related endpoints
//  *
//  * WHY THIS EXISTS:
//  * This file focuses strictly on TRADE DOMAIN LOGIC.
//  *
//  * It does NOT test:
//  * - Middleware behavior (requestId, logging)
//  * - Infrastructure concerns
//  *
//  * Those are covered in:
//  * → app.test.js
//  *
//  * DESIGN PRINCIPLES:
//  * - Tests validate behavior, not implementation details
//  * - Assertions are flexible where appropriate (regex vs exact match)
//  * - Each test maps to a real-world failure or use case
//  */

// const request = require("supertest");
// const app = require("../../src/app");
// const repo = require("../../src/modules/trades/repositories/trades.repository");
// const { validTrade, invalidTrade } = require("../fixtures/trades");

// describe("Trade API", () => {
//   /**
//    * Reset in-memory repository before each test
//    *
//    * Ensures:
//    * - Clean state per test
//    * - No cross-test pollution
//    */
//   beforeEach(() => {
//     repo.clear();
//   });

//   // =========================
//   // Test Case 1.1
//   // Successful Trade Creation
//   // =========================
//   /**
//    * Validates that a properly structured trade
//    * is successfully created and returned.
//    *
//    * EXPECTED:
//    * - HTTP 201 status
//    * - Response contains created trade
//    *
//    * WHY:
//    * - Confirms full request lifecycle works
//    * - Ensures integration between controller → service → repository
//    */
//   it("creates a trade", async () => {
//     const res = await request(app).post("/api/trades").send(validTrade());

//     expect(res.status).toBe(201);
//     expect(res.body.data.symbol).toBe("AAPL");
//   });

//   // =========================
//   // Test Case 1.2
//   // Missing Required Fields
//   // =========================
//   /**
//    * Validates that missing required fields
//    * result in a proper validation error.
//    *
//    * EXPECTED:
//    * - HTTP 400 status
//    * - Standardized error response
//    * - Message indicates missing required data
//    *
//    * WHY:
//    * - Prevents incomplete data from entering the system
//    * - Enforces contract between client and API
//    */
//   it("rejects missing required fields", async () => {
//     const res = await request(app).post("/api/trades").send(invalidTrade());

//     expect(res.status).toBe(400);
//     expect(res.body.status).toBe("error");

//     // Flexible assertion to allow improved validation messaging
//     expect(res.body.message).toMatch(/required/i);
//   });

//   // =========================
//   // Test Case 1.3
//   // Invalid Numeric Values
//   // =========================
//   /**
//    * Validates that numeric constraints are enforced.
//    *
//    * EXAMPLES:
//    * - Negative entryPrice
//    * - Invalid quantity
//    *
//    * EXPECTED:
//    * - HTTP 400 status
//    * - Message indicates numeric validation failure
//    *
//    * WHY:
//    * - Prevents invalid financial calculations
//    * - Ensures data integrity for P&L logic
//    */
//   it("rejects invalid numeric values", async () => {
//     const res = await request(app).post("/api/trades").send({
//       symbol: "AAPL",
//       type: "BUY",
//       entryPrice: -100,
//       quantity: 1,
//     });

//     expect(res.status).toBe(400);

//     // Accept broader validation messaging improvements
//     expect(res.body.message).toMatch(/greater than 0|invalid numeric/i);
//   });

//   // =========================
//   // Test Case 1.4
//   // Partial Exit Data
//   // =========================
//   /**
//    * Validates that exitPrice and exitTime
//    * must be provided together.
//    *
//    * INVALID CASE:
//    * - exitPrice present without exitTime
//    *
//    * EXPECTED:
//    * - HTTP 400 status
//    * - Message indicates incomplete exit data
//    *
//    * WHY:
//    * - Prevents inconsistent trade states
//    * - Ensures accurate trade lifecycle tracking
//    */
//   it("rejects partial exit data", async () => {
//     const res = await request(app).post("/api/trades").send({
//       symbol: "AAPL",
//       type: "BUY",
//       entryPrice: 100,
//       quantity: 1,
//       exitPrice: 110,
//       // missing exitTime
//     });

//     expect(res.status).toBe(400);

//     // Supports improved validation messaging
//     expect(res.body.message).toMatch(/exit.*both|incomplete/i);
//   });

//   // =========================
//   // Test Case 1.5
//   // Response Normalization
//   // =========================
//   /**
//    * Validates that the API returns a fully normalized trade object.
//    *
//    * EXPECTED:
//    * - id is generated
//    * - createdAt timestamp exists
//    * - numeric fields are properly typed
//    *
//    * WHY:
//    * - Ensures backend is responsible for data shaping
//    * - Prevents frontend reliance on raw/unprocessed data
//    */
//   it("returns clean trade response structure after creation", async () => {
//     const res = await request(app).post("/api/trades").send({
//       symbol: "AAPL",
//       type: "BUY",
//       entryPrice: 100,
//       quantity: 1,
//     });

//     expect(res.status).toBe(201);

//     expect(res.body.data.id).toBeDefined();
//     expect(res.body.data.createdAt).toBeDefined();
//     expect(typeof res.body.data.entryPrice).toBe("number");
//   });

//   // =========================
//   // Test Case 1.6
//   // Invalid Trade Type
//   // =========================
//   /**
//    * Validates that only supported trade types are accepted.
//    *
//    * INVALID TYPES:
//    * - LONG
//    * - SHORT
//    * - arbitrary strings
//    *
//    * EXPECTED:
//    * - HTTP 400 status
//    * - Message indicates invalid trade type
//    *
//    * WHY:
//    * - Enforces strict enum constraints
//    * - Prevents undefined behavior in business logic
//    */
//   it("rejects invalid trade types", async () => {
//     const invalidTypes = ["LONG", "SHORT", "INVALID"];

//     for (const type of invalidTypes) {
//       const res = await request(app).post("/api/trades").send({
//         symbol: "AAPL",
//         type,
//         entryPrice: 100,
//         quantity: 1,
//       });

//       expect(res.status).toBe(400);

//       // Flexible to allow better messaging over time
//       expect(res.body.message).toMatch(/invalid trade type/i);
//     }
//   });
// });

const request = require("supertest");
const app = require("../../src/app");
const repo = require("../../src/modules/trades/repositories/trades.repository");
const { validTrade, invalidTrade } = require("../fixtures/trades");
const { getAuthCookie } = require("../fixtures/auth");

describe("Trade API", () => {
  let cookie;

  beforeEach(async () => {
    repo.clear();
    cookie = await getAuthCookie();
  });

  it("creates a trade", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    expect(res.status).toBe(201);
    expect(res.body.data.symbol).toBe("AAPL");
  });

  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(invalidTrade());

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toMatch(/required/i);
  });

  it("rejects invalid numeric values", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send({
        symbol: "AAPL",
        type: "BUY",
        entryPrice: -100,
        quantity: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/greater than 0|invalid numeric/i);
  });

  it("rejects partial exit data", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send({
        symbol: "AAPL",
        type: "BUY",
        entryPrice: 100,
        quantity: 1,
        exitPrice: 110,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/exit.*both|incomplete/i);
  });

  it("returns clean trade response structure after creation", async () => {
    const res = await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send({
        symbol: "AAPL",
        type: "BUY",
        entryPrice: 100,
        quantity: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
    expect(typeof res.body.data.entryPrice).toBe("number");
  });

  it("rejects invalid trade types", async () => {
    const invalidTypes = ["LONG", "SHORT", "INVALID"];

    for (const type of invalidTypes) {
      const res = await request(app)
        .post("/api/trades")
        .set("Cookie", cookie)
        .send({
          symbol: "AAPL",
          type,
          entryPrice: 100,
          quantity: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid trade type/i);
    }
  });
});
