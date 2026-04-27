// // server/src/utils/logger.js

// const { getContext } = require("./requestContext");

// /**
//  * Internal base logging function.
//  *
//  * This function constructs a standardized log object and outputs it.
//  * It should NOT be called directly outside this module.
//  *
//  * @param {("info"|"warn"|"error"|"debug")} level - Log severity level
//  * @param {string} message - Readable log message
//  * @param {Object} meta - Additional structured metadata
//  * @param {string} source - Logical origin of the log (e.g., trades.controller)
//  *
//  * LOG STRUCTURE:
//  * {
//  *   timestamp: ISO string,
//  *   level: log level,
//  *   message: log message,
//  *   requestId: current request identifier (if available),
//  *   meta: additional structured data
//  * }
//  */
// function baseLog(level, message, meta = {}) {
//   const context = getContext();

//   const logEntry = {
//     timestamp: new Date().toISOString(),
//     level,
//     message,
//     requestId: context?.requestId || null,
//     meta,
//   };

//   // Output structured log (TODO: replace with file/stream transport)
//   console.log(JSON.stringify(logEntry));
// }

// /**
//  * Logger API exposed to the application.
//  *
//  * USAGE RULES:
//  * - Use `logger.info` for normal operational events
//  * - Use `logger.warn` for unexpected but non-fatal situations
//  * - Use `logger.error` for failures/exceptions
//  * - Use `logger.debug` for development-only diagnostics
//  *
//  * @example
//  * logger.info("Trade created", { tradeId: "123" });
//  * logger.error("Trade creation failed", { error: err.message });
//  */
// const logger = {
//   /**
//    * General informational events (successful operations, flow milestones)
//    */
//   info: (message, meta) => baseLog("info", message, meta),

//   /**
//    * Warning events (unexpected states that are not fatal)
//    */
//   warn: (message, meta) => baseLog("warn", message, meta),

//   /**
//    * Error events (failures, exceptions, rejected operations)
//    */
//   error: (message, meta) => baseLog("error", message, meta),

//   /**
//    * Debug-level logs (verbose, development-only insights)
//    */
//   debug: (message, meta) => baseLog("debug", message, meta),
// };

// module.exports = logger;

// server/src/utils/logger.js

const { getContext } = require("./requestContext");

const ENV = process.env.NODE_ENV || "development";

/**
 * Log level priority map
 */
const LOG_LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Determine active log level
 *
 * Priority:
 * 1. LOG_LEVEL from .env
 * 2. Default per environment
 */
function resolveLogLevel() {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }

  if (ENV === "production") return "warn";
  if (ENV === "test") return "error";

  return "debug"; // development default
}

const ACTIVE_LOG_LEVEL = resolveLogLevel();

/**
 * Validate log level
 */
if (!LOG_LEVELS[ACTIVE_LOG_LEVEL]) {
  throw new Error(`Invalid LOG_LEVEL: ${ACTIVE_LOG_LEVEL}`);
}

const CURRENT_LEVEL = LOG_LEVELS[ACTIVE_LOG_LEVEL];

/**
 * Determines if a log should be emitted
 */
function shouldLog(level) {
  return LOG_LEVELS[level] >= CURRENT_LEVEL;
}

/**
 * Pretty formatter (dev only)
 */
function formatPrettyLog({
  timestamp,
  level,
  source,
  requestId,
  message,
  meta,
}) {
  return `[${timestamp}] [${level.toUpperCase()}] [${source}] [${
    requestId || "N/A"
  }] : "${message}" ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
}

/**
 * Centralized structured logging utility with scoped loggers.
 *
 * PURPOSE:
 * - Provide consistent, structured logging across the application
 * - Automatically attach request-scoped context (requestId)
 * - Identify log origin via "source" (controller/service/repository)
 *
 * DESIGN PRINCIPLES:
 * - Context (requestId) is request-scoped → stored in requestContext
 * - Source is log-scoped → bound to logger instance (per file)
 * - Logs are structured JSON (machine-readable)
 * - No business logic inside logger
 *
 * FUTURE EXTENSIONS:
 * - Add sessionId / userId to context
 * - Replace console.log with file or external logging system (Winston/Pino)
 * - Add log filtering by environment (NODE_ENV)
 */

/**
 * Internal base logging function.
 *
 * Constructs and outputs a structured log entry.
 * This function is NOT meant to be used directly—use scoped logger instead.
 *
 * @param {("info"|"warn"|"error"|"debug")} level - Log severity level
 * @param {string} message - Human-readable log message
 * @param {Object} meta - Additional structured metadata
 * @param {string} source - Logical origin of the log (e.g., trades.controller)
 */
function baseLog(level, message, meta = {}, source = "unknown") {
  if (!shouldLog(level)) return;

  const context = getContext();

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    source,
    requestId: context?.requestId || null,
    message,
    meta,
  };

  if (ENV === "development") {
    console.log(formatPrettyLog(logEntry));
  } else {
    // Output structured log (TODO: replace with file/stream transport)
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Factory function to create a scoped logger.
 *
 * Each module (controller, service, repository) should create its own logger
 * with a fixed "source" value. This avoids passing "source" manually on every log.
 *
 * @param {string} source - Logical identifier for the module
 *
 * @example
 * const createLogger = require("../../../utils/logger");
 * const logger = createLogger("trades.controller");
 */
function createLogger(source) {
  if (!source) {
    throw new Error("Logger requires a source identifier");
  }

  return {
    /**
     * Informational logs (normal operation, successful flows)
     */
    info: (message, meta) => baseLog("info", message, meta, source),

    /**
     * Warning logs (unexpected but non-fatal issues)
     */
    warn: (message, meta) => baseLog("warn", message, meta, source),

    /**
     * Error logs (failures, exceptions)
     */
    error: (message, meta) => baseLog("error", message, meta, source),

    /**
     * Debug logs (verbose, development-only insights)
     */
    debug: (message, meta) => baseLog("debug", message, meta, source),
  };
}

module.exports = createLogger;
