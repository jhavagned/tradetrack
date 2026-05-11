// /server/src/modules/auth/repositories/user.repository.js

const { query } = require("../../../db/config/db");
const createLogger = require("../../../utils/logger");
const { handleDbError } = require("../../../utils/dbErrorHandler");

const logger = createLogger("user.repository");

/**
 * =========================================================
 * CREATE USER
 * =========================================================
 * Inserts a new user record into the database.
 *
 * @param {Object} user - { email, passwordHash }
 * @returns {Object} - The newly created user row
 */
const createUser = async ({ email, passwordHash }) => {
  logger.debug("Inserting new user", { email });

  try {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING *`,
      [email, passwordHash],
    );

    logger.debug("User created successfully", { userId: rows[0].user_id });

    return rows[0];
  } catch (error) {
    handleDbError(error);
  }
};

/**
 * =========================================================
 * FIND BY EMAIL
 * =========================================================
 * Looks up a user by email address.
 * Used during login to retrieve the user for password comparison.
 *
 * @param {string} email
 * @returns {Object|null} - User row or null if not found
 */
const findByEmail = async (email) => {
  logger.debug("Looking up user by email", { email });

  const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email]);

  return rows[0] || null;
};

module.exports = {
  createUser,
  findByEmail,
};
