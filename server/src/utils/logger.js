// server/src/utils/logger.js

const { getContext } = require("./asyncRequestContext");

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
 * Validate configured log level
 */
if (!LOG_LEVELS[ACTIVE_LOG_LEVEL]) {
  throw new Error(`Invalid LOG_LEVEL: ${ACTIVE_LOG_LEVEL}`);
}

const CURRENT_LEVEL = LOG_LEVELS[ACTIVE_LOG_LEVEL];

/**
 * Determines if a log should be emitted
 */
function shouldLog(level) {
  if (!LOG_LEVELS[level]) {
    throw new Error(`Invalid log level: ${level}`);
  }

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
  return `[${timestamp}] [${level.toUpperCase()}] [${source}] [${requestId}] : "${message}" ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
}

/**
 * Internal base logging function.
 */
function baseLog(level, message, meta = {}, source = "unknown") {
  if (!shouldLog(level)) return;

  const context = getContext();

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    source,
    requestId: context?.requestId || "N/A",
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
 * Scoped logger factory
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
