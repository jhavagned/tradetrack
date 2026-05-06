// /server/src/db/config/db.js

const { Pool } = require('pg');

/*
 * Pool manages multiple DB connections efficiently.
 * Instead of opening/closing a connection on every query,
 * the pool reuses existing connections — faster and more scalable.
 * All config values are read from environment variables via .env
 */
const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

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
const query = (text, params) => pool.query(text, params);

/*
* Export both the query function and pool.
* - query: used by repositories for all DB operations
* - pool: exported for graceful shutdown on app exit
*/
module.exports = { query, pool };