// /server/src/modules/auth/repositories/session.repository.js

const sessions = new Map();
const createLogger = require("../../../utils/logger");

const logger = createLogger("session.repository");

/**
 * =========================================================
 * SESSION STORE (IN-MEMORY)
 * =========================================================
 *
 * PURPOSE:
 * Temporary session persistence layer used for authentication.
 *
 * =========================================================
 * RESPONSIBILITIES:
 * - Create sessions on login
 * - Retrieve and validate sessions
 * - Delete sessions on logout
 * - Auto-expire sessions (TTL enforcement)
 *
 * =========================================================
 * IMPORTANT:
 * This is an in-memory store:
 * - NOT production-safe across multiple servers
 * - WILL reset on server restart
 *
 * TODO:
 * Replace with Redis for:
 * - distributed scaling
 * - persistent TTL management
 * - centralized session control
 *
 * =========================================================
 */

/**
 * Session Time-To-Live (TTL)
 * -----------------------------------------
 * Default: 30 minutes
 * Can be overridden via environment variable.
 * Fallback ensures system still works if env is missing
 */
const SESSION_TTL = parseInt(process.env.SESSION_TTL, 10) || 1000 * 60 * 30;

/**
 * =========================================================
 * CREATE SESSION
 * =========================================================
 *
 * Called on successful login.
 * Stores session metadata in memory.
 */
const createSession = (sessionId, userId) => {
  const now = Date.now();

  const session = {
    sessionId,
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TTL,
  };

  logger.info("Session created", {
    sessionId,
    userId,
    expiresAt: session.expiresAt,
  });

  sessions.set(sessionId, session);

  return session;
};

/**
 * =========================================================
 * GET SESSION
 * =========================================================
 *
 * Used by auth middleware to validate requests.
 *
 * FLOW:
 * - Check existence
 * - Check expiration
 * - Return session or null
 */
const getSession = (sessionId) => {
  const session = sessions.get(sessionId);

  if (!session) {
    logger.debug("Session not found", { sessionId });
    return null;
  } 

  // expired session cleanup
  if (Date.now() > session.expiresAt) {
    console.log("Session expired", { sessionId });
    sessions.delete(sessionId);
    return null;
  }

  return session;
};

/**
 * =========================================================
 * DELETE SESSION
 * =========================================================
 *
 * Used during logout.
 */
const deleteSession = (sessionId) => {
  sessions.delete(sessionId);
};

/**
 * =========================================================
 * CLEAR ALL SESSIONS (TESTING ONLY)
 * =========================================================
 */
const clearSessions = () => { 
  sessions.clear();
};

/**
 * =========================================================
 * SESSION CLEANUP JOB
 * =========================================================
 *
 * Runs periodically to remove expired sessions
 * even if they are never accessed again.
 *
 * Prevents memory growth in long-running processes.
 */
const startSessionCleanupJob = () => {
  setInterval(
    () => {
      const now = Date.now();

      for (const [sessionId, session] of sessions.entries()) {
        if (now > session.expiresAt) {
          logger.debug("Cleaning expired session", { sessionId });

          sessions.delete(sessionId);
        }
      }
    },
    1 * 60 * 1000,
  );
};

module.exports = {
  createSession,
  getSession,
  deleteSession,
  clearSessions,
  startSessionCleanupJob,
};
