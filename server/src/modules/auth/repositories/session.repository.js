// /server/src/modules/auth/repositories/session.repository.js

const sessions = new Map();

/**
 * Session TTL (ms)
 * Fallback ensures system still works if env is missing
 */
const SESSION_TTL = parseInt(process.env.SESSION_TTL, 10) || 1000 * 60 * 30;

/**
 * Session Store
 *
 * RESPONSIBILITY:
 * - Persist active sessions in memory
 * - Provide CRUD operations for session lifecycle
 *
 * TODO:
 * Replace temporary in-memory implementation
 * with Redis or a database.
 */

/**
 * Create a session
 */
const createSession = (sessionId, userId) => {
  const now = Date.now();

  const session = {
    sessionId,
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TTL,
  };

  sessions.set(sessionId, session);

  return session;
};

/**
 * Retrieve session by ID
 */
const getSession = (sessionId) => {
  const session = sessions.get(sessionId);

  if (!session) return null;

  // expired -> cleanup + reject
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
};

/**
 * Delete session (logout support)
 */
const deleteSession = (sessionId) => {
  sessions.delete(sessionId);
};

/**
 * Clear all sessions (testing utility)
 */
const clearSessions = () => {
  sessions.clear();
};

/**
 * Periodic cleanup (production hygiene)
 * removes expired sessions even if not accessed
 */
const startSessionCleanupJob = () => {
  setInterval(
    () => {
      const now = Date.now();

      for (const [sessionId, session] of sessions.entries()) {
        if (now > session.expiresAt) {
          sessions.delete(sessionId);
        }
      }
    },
    10 * 60 * 1000,
  );
};

module.exports = {
  createSession,
  getSession,
  deleteSession,
  clearSessions,
  startSessionCleanupJob,
};
