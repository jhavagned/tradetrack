// /server/tests/api/auth.test.js

// const request = require("supertest");
// const app = require("../../src/app");

// const repo = require("../../src/modules/trades/repositories/trades.repository");
// const {
//   clearSessions,
// } = require("../../src/modules/auth/repositories/session.repository");

// const { validTrade } = require("../fixtures/trades");
// const { getAuthCookie } = require("../fixtures/auth");

// describe("Authentication System", () => {
//   let cookie;

//   /**
//    * Full isolation between tests
//    */
//   beforeEach(async () => {
//     repo.clear();
//     clearSessions();
//     cookie = await getAuthCookie();
//   });

//   // =========================
//   // Test Case 3.1
//   // Login creates session + cookie
//   // =========================
//   it("logs in user and sets session cookie", async () => {
//     expect(cookie).toBeDefined();
//     expect(typeof cookie).toBe("string");
//     expect(cookie).toContain("sessionId=");
//   });

//   // =========================
//   // Test Case 3.2
//   // Protected route blocked without session
//   // =========================
//   it("blocks access to protected route without session", async () => {
//     const res = await request(app).get("/api/trades");

//     expect(res.status).toBe(401);
//   });

//   // =========================
//   // Test Case 3.3
//   // Access protected route with valid session
//   // =========================
//   it("allows access to protected route with valid session", async () => {
//     const res = await request(app).get("/api/trades").set("Cookie", cookie);

//     expect(res.status).toBe(200);
//   });

//   // =========================
//   // Test Case 3.4
//   // Session persists across multiple requests
//   // =========================
//   it("maintains session across multiple requests", async () => {
//     const res1 = await request(app).get("/api/trades").set("Cookie", cookie);

//     const res2 = await request(app).get("/api/trades").set("Cookie", cookie);

//     expect(res1.status).toBe(200);
//     expect(res2.status).toBe(200);
//   });

//   // =========================
//   // Test Case 3.5
//   // Logout invalidates session
//   // =========================
//   it("invalidates session after logout", async () => {
//     await request(app).post("/api/auth/logout").set("Cookie", cookie);

//     const res = await request(app).get("/api/trades").set("Cookie", cookie);

//     expect(res.status).toBe(401);
//   });

//   // =========================
//   // Test Case 3.6
//   // Invalid session rejected
//   // =========================
//   it("rejects requests with invalid sessionId", async () => {
//     const res = await request(app)
//       .get("/api/trades")
//       .set("Cookie", "sessionId=invalid-session");

//     expect(res.status).toBe(401);
//   });

//   // =========================
//   // Test Case 3.7
//   // Auth + Trade Flow (end-to-end)
//   // =========================
//   it("allows authenticated user to create and retrieve trades", async () => {
//     await request(app)
//       .post("/api/trades")
//       .set("Cookie", cookie)
//       .send(validTrade());

//     const res = await request(app).get("/api/trades").set("Cookie", cookie);

//     expect(res.status).toBe(200);
//   });
// });

const request = require("supertest");
const app = require("../../src/app");
const repo = require("../../src/modules/trades/repositories/trades.repository");
const {
  clearSessions,
} = require("../../src/modules/auth/repositories/session.repository");
const { getAuthCookie } = require("../fixtures/auth");
const { validTrade } = require("../fixtures/trades");

describe("Authentication System", () => {
  let cookie;

  beforeEach(async () => {
    repo.clear();
    clearSessions();
    cookie = await getAuthCookie();
  });

  it("logs in user and sets session cookie", async () => {
    expect(cookie).toBeDefined();
    expect(typeof cookie).toBe("string");
    expect(cookie.includes("sessionId=")).toBe(true);
  });

  it("blocks access to protected route without session", async () => {
    const res = await request(app).get("/api/trades");
    expect(res.status).toBe(401);
  });

  it("allows access with valid session", async () => {
    const res = await request(app).get("/api/trades").set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("maintains session across multiple requests", async () => {
    const res1 = await request(app).get("/api/trades").set("Cookie", cookie);

    const res2 = await request(app).get("/api/trades").set("Cookie", cookie);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });

  it("invalidates session after logout", async () => {
    await request(app).post("/api/auth/logout").set("Cookie", cookie);

    const res = await request(app).get("/api/trades").set("Cookie", cookie);

    expect(res.status).toBe(401);
  });

  it("rejects invalid sessionId", async () => {
    const res = await request(app)
      .get("/api/trades")
      .set("Cookie", "sessionId=invalid-session");

    expect(res.status).toBe(401);
  });

  it("allows authenticated user to create and retrieve trades", async () => {
    await request(app)
      .post("/api/trades")
      .set("Cookie", cookie)
      .send(validTrade());

    const res = await request(app).get("/api/trades").set("Cookie", cookie);

    expect(res.status).toBe(200);
  });
});
