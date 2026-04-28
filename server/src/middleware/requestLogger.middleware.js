// /server/src/middleware/requestLogger.middleware.js

const crypto = require("crypto");
const { runWithContext } = require("../utils/asyncRequestContext");
const createLogger = require("../utils/logger");

/**
 * Request Logging Middleware
 *
 * RESPONSIBILITIES:
 * - Generate and attach requestId
 * - Initialize async context
 * - Log incoming request
 * - Track request duration
 * - Log response completion
 *
 * LOG FLOW:
 * Incoming request -> log start
 * -> request handled by app
 * -> response finished -> log completion
 */
const requestLogger = (req, res, next) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  let completed = false;

  // Attach requestId to request + response
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  // Initialize Async Context
  runWithContext({ requestId }, () => {
    const logger = createLogger("request.middleware");

    // Log incoming request
    logger.info("Incoming request", {
      method: req.method,
      url: req.originalUrl,
    });

    const finalize = (level) => {
      if (completed) return;
      completed = true;

      const duration = Date.now() - startTime;

      logger[level](
        level === "warn" ? "Request closed prematurely" : "Request completed",
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: duration,
        },
      );
    };

    res.on("finish", () => finalize("info"));
    res.on("close", () => finalize("warn"));

    next();
  });
};

module.exports = requestLogger;
