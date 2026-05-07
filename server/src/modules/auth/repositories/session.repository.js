// /server/src/modules/auth/repositories/session.repository.js

const { query } = require("../../../db/config/db");
const createLogger = require("../../../utils/logger");

const logger = createLogger("session.repository");

/**
 * =========================================================
 * SESSION REPOSITORY
 * =========================================================
 *
 * PURPOSE:
 * Handles all database operations for session management.
 *
 * =========================================================
 * RESPONSIBILITIES:
 * - Create sessions on login
 * - Retrieve and validate sessions
 * - Delete sessions on logout
 *
 * =========================================================
 * NOTE:
 * Session expiry is enforced at the query level using
 * expires_at > NOW(). No cleanup job is needed.
 * =========================================================
 */

/**
 * =========================================================
 * CREATE SESSION
 * =========================================================
 * Inserts a new session record into the database.
 * expiresAt is calculated in the service layer and passed in.
 *
 * @param {string} userId
 * @param {Date}   expiresAt
 * @returns {Object} - The newly created session row
 */
const createSession = async (userId, expiresAt) => {
  logger.debug("Creating session", { userId });

  const { rows } = await query(
    `INSERT INTO sessions (user_id, expires_at)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, expiresAt]
  );

  logger.info("Session created", {
    sessionId: rows[0].session_id,
    userId,
    expiresAt,
  });

  return rows[0];
};

/**
 * =========================================================
 * GET SESSION
 * =========================================================
 * Retrieves a session by session_id.
 * Only returns the session if it has not expired.
 * Expiry is enforced at the query level.
 *
 * @param {string} sessionId
 * @returns {Object|null} - Session row or null if not found/expired
 */
const getSession = async (sessionId) => {
  logger.debug("Looking up session", { sessionId });

  // Postgres will throw if sessionId is not a valid UUID
  // Return null early for obviously invalid formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(sessionId)) {
    logger.debug("Session not found or expired", { sessionId });
    return null;
  }
  
  const { rows } = await query(
    `SELECT * FROM sessions 
     WHERE session_id = $1 
     AND expires_at > NOW()`,
    [sessionId]
  );

  if (!rows[0]) {
    logger.debug("Session not found or expired", { sessionId });
    return null;
  }

  return rows[0];
};

/**
 * =========================================================
 * DELETE SESSION
 * =========================================================
 * Removes a session from the database on logout.
 *
 * @param {string} sessionId
 * @returns {void}
 */
const deleteSession = async (sessionId) => {
  logger.debug("Deleting session", { sessionId });

  await query(
    `DELETE FROM sessions WHERE session_id = $1`,
    [sessionId]
  );

  logger.info("Session deleted", { sessionId });
};

module.exports = {
  createSession,
  getSession,
  deleteSession,
};
