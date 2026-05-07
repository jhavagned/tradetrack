// /server/src/db/config/db.js

const { Pool } = require('pg');

/*
 * Pool manages multiple DB connections efficiently.
 * Instead of opening/closing a connection on every query,
 * the pool reuses existing connections — faster and more scalable.
 * All config values are read from environment variables via .env
 * 
 * Pool is created lazily on first use so that environment variables
 * are guaranteed to be set before the connection is established.
 * This is important for the test environment where setup.js sets
 * env vars before any test runs.
 */
let pool;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
};

/*
 * Centralized query function wrapping pool.query.
 * All database queries in the app go through this function.
 * 
 * @param {string} text   - SQL string with $1, $2... placeholders
 * @param {Array}  params - Parameter values matching the placeholders
 * 
 * Example usage:
 *   const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [id]);
 */
const query = (text, params) => getPool().query(text, params);

/*
 * Export both the query function and pool.
 * - query: used by repositories for all DB operations
 * - getPool: exported for graceful shutdown and connection validation on startup
*/
module.exports = { query, getPool };