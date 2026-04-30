// /server/src/middleware/auth.middleware.js

const { validateSession } = require("../modules/auth/services/auth.service");
const { runWithContext, getContext } = require("../utils/asyncRequestContext");
const createLogger = require("../utils/logger");

const logger = createLogger("auth.middleware");

/**
 * Authentication Middleware
 *
 * RESPONSIBILITIES:
 * - Extract sessionId from cookie or header
 * - Validate session
 * - Attach user identity to request context
 * - Enrich AsyncLocalStorage context
 * - Block unauthorized requests
 */
const authMiddleware = (req, res, next) => {
  const sessionId = req.cookies?.sessionId || req.headers["x-session-id"];

  // 1. No session provided
  if (!sessionId) {
    logger.warn("Missing sessionId", {
      path: req.originalUrl,
    });

    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  // 2. Validate session BEFORE touching context
  const session = validateSession(sessionId);
  const normalizedSessionId = sessionId || "missing";

  if (!session) {
    logger.warn("Invalid session", {
      sessionId: normalizedSessionId,
      path: req.originalUrl,
    });

    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  /*
   * 3. Enrich existing AsyncLocalStorage context
   * Get existing context (from requestLogger)
   */
  const context = getContext() || {};

  if (context) {
    context.sessionId = sessionId;
    context.userId = session.userId;
  }

  // 4. Attach to request object
  req.sessionId = sessionId;
  req.userId = session.userId;

  logger.info("User authenticated", {
    userId: session.userId,
    sessionId,
  });

  next();
};

module.exports = authMiddleware;
