// /server/src/middleware/requestLogger.middleware.js

const crypto = require("crypto");
const { runWithContext, updateContext } = require("../utils/asyncRequestContext");
const createLogger = require("../utils/logger");

/**
 * =========================================================
 * REQUEST LOGGER MIDDLEWARE
 * =========================================================
 *
 * PURPOSE:
 * Initializes request tracing + logging lifecycle.
 *
 * =========================================================
 * RESPONSIBILITIES:
 * - Generate unique requestId
 * - Initialize AsyncLocalStorage context
 * - Log request start
 * - Track request duration
 * - Log request completion/failure
 * =========================================================
 */

const requestLogger = (req, res, next) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  let finished = false;

  const logger = createLogger("request.middleware");

  // Attach requestId to HTTP layer
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  /**
   * Initialize clean request context
   */
  runWithContext({ requestId },
    () => {
      logger.info("Incoming request", {
        method: req.method,
        url: req.originalUrl,
        requestId,
      });

      const finalize = (level = "info", message = "Request completed") => {
        if (finished) return;
        finished = true;

        const durationMs = Date.now() - startTime;

        logger[level](message, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            requestId,
        });
      };

      res.on("finish", () => finalize("info"));
      res.on("close", () => finalize("warn", "Request closed prematurely"));

      next();
    });
};

module.exports = requestLogger;
