// /server/src/middleware/requestLogger.middleware.js

const crypto = require("crypto");
const { setContext, clearContext } = require("../utils/requestContext");
const createLogger = require("../utils/logger");

const logger = createLogger("request.middleware");

/**
 * Request Logging Middleware
 *
 * RESPONSIBILITIES:
 * - Generate and attach requestId
 * - Log incoming request
 * - Track request duration
 * - Log response completion
 * - Clean up request context
 *
 * LOG FLOW:
 * Incoming request -> log start
 * -> request handled by app
 * -> response finished -> log completion
 */
function requestLogger(req, res, next) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  let completed = false;

  // Attach everywhere (Express + context)
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  setContext({ requestId });

  // Log incoming request
  logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
  });

  const finalize = (type) => {
    if (completed) return;
    completed = true;

    const duration = Date.now() - startTime;

    logger[type](
      type === "warn" ? "Request closed prematurely" : "Request completed",
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
      },
    );

    clearContext();
  };

  res.on("finish", () => finalize("info"));
  res.on("close", () => finalize("warn"));

  next();
}

module.exports = requestLogger;
