// /server/tests/globalTeardown.js

const { Pool } = require('pg');
require('dotenv').config();

/*
 * Runs once after all test suites complete via Jest's globalTeardown config.
 * Cleans up test data and attempts to close all open DB connections
 * to allow Jest to exit cleanly.
 * Deletes in reverse dependency order to respect foreign key constraints:
 * trades → sessions → users
 */
module.exports = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: 'tradetrack_test',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await pool.query('DELETE FROM trades');
  await pool.query('DELETE FROM sessions');
  await pool.query('DELETE FROM users');

  await pool.end();

  // Attempt to close the shared application pool.
  // Wrapped in try/catch as the pool may already be closed
  // depending on test execution order.
  try {
    const { getPool } = require('../src/db/config/db');
    await getPool().end();
  } catch (err) {
    // Pool already closed — safe to ignore
  }

  // Attempt to close the Express server if supertest left it open.
  // This is a known supertest + Express 5 issue where HTTP connections
  // are not always closed after tests finish.
  try {
    const app = require('../src/app');
    if (app.server) {
      await new Promise((resolve) => app.server.close(resolve));
    }
  } catch (err) {
    // Server not running — safe to ignore
  }
};