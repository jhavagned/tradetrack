// /server/tests/fixtures/auth.js

const request = require("supertest");
const app = require("../../src/app");

/**
 * Creates user + logs in + returns cookie
 */
async function getAuthCookie() {
  const user = {
    email: "test@example.com",
    password: "password123",
  };

  // Register user (idempotent in in-memory DB)
  await request(app).post("/api/auth/register").send(user);

  // Login user
  const res = await request(app).post("/api/auth/login").send(user);

  const cookie = res.headers["set-cookie"]?.[0];

  if (!cookie) {
    throw new Error("Auth login failed: no cookie returned");
  }

  return cookie;
}

module.exports = {
  getAuthCookie,
};
