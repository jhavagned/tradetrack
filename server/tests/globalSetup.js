// /server/tests/globalSetup.js

const { Pool } = require('pg');
require('dotenv').config();

/*
 * Runs once before all test suites via Jest's globalSetup config.
 * Clears the test database to ensure a clean slate before any tests run.
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
};