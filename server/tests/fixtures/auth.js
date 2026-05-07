// /server/tests/fixtures/auth.js

// dotenv is loaded here as a safety net — this fixture may be imported
// by Jest worker processes before setup.js has run in that context.
require("dotenv").config();

const request = require("supertest");
const app = require("../../src/app");
const { query } = require("../../src/db/config/db");

let counter = 0;

/*
 * Generates a unique email per test run.
 * Combines timestamp and counter to avoid collisions
 * even when tests run within the same millisecond.
 */
const getTestEmail = () => `test_${Date.now()}_${++counter}@example.com`;

/*
 * Creates a user, logs in, and returns the session cookie.
 * Used in beforeEach across test suites.
 *
 * A unique email is generated per call to avoid duplicate key
 * conflicts when the database is shared across test runs.
 */
async function getAuthCookie() {
  const user = {
    email: getTestEmail(),
    password: "password123",
  };

  await request(app).post("/api/auth/register").send(user);

  const res = await request(app).post("/api/auth/login").send(user);

  const cookie = res.headers["set-cookie"]?.[0];

  if (!cookie) {
    throw new Error("Auth login failed: no cookie returned");
  }

  return cookie;
}

/*
 * Clears all test data between tests.
 * Deletes in reverse dependency order to respect foreign key constraints:
 * trades → sessions → users
 */
async function clearDatabase() {
  await query("DELETE FROM trades");
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

module.exports = {
  getAuthCookie,
  clearDatabase,
};