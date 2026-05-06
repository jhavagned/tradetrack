// /server/src/middleware/auth.middleware.js

const { validateSession } = require("../modules/auth/services/auth.service");
const { getContext, updateContext } = require("../utils/asyncRequestContext");

const createLogger = require("../utils/logger");

const logger = createLogger("auth.middleware");

/**
 * =========================================================
 * AUTHENTICATION MIDDLEWARE
 * =========================================================
 *
 * PURPOSE:
 * Protects API routes by validating user sessions.
 *
 * =========================================================
 * RESPONSIBILITIES:
 * - Extract sessionId from request (cookie or header)
 * - Validate session against session store
 * - Attach authenticated user to request object
 * - Enrich async request context (AsyncLocalStorage)
 * - Block unauthorized requests
 *
 * =========================================================
 * SECURITY MODEL:
 * - SessionId is httpOnly cookie (primary)
 * - Header fallback supported for API clients
 * - Backend is single source of truth
 * =========================================================
 */

const authMiddleware = (req, res, next) => {
  const sessionId = req.cookies?.sessionId || req.headers["x-session-id"];

  /**
   * =========================================================
   * 1. MISSING SESSION
   * =========================================================
   */
  if (!sessionId) {
    logger.warn("Missing sessionId", {
      path: req.originalUrl,
    });

    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  /**
   * =========================================================
   * 2. SESSION VALIDATION
   * =========================================================
   */
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

  /**
   * =========================================================
   * 3. ASYNC CONTEXT ENRICHMENT
   * =========================================================
   *
   * IMPORTANT:
   * Only mutate context if it exists and is mutable.
   */
  const context = getContext() || {};

  //if (context) { context.sessionId = sessionId; context.userId = session.userId; }
  
  updateContext({
    sessionId,
    userId: session.userId,
  });

  /**
   * =========================================================
   * 4. REQUEST ENRICHMENT
   * =========================================================
   */
  req.sessionId = sessionId;
  req.userId = session.userId;

  logger.info("User authenticated", {
    userId: session.userId,
    sessionId,
    path: req.originalUrl,
  });

  next();
};

module.exports = authMiddleware;
