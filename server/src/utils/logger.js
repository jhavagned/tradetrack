// server/src/utils/logger.js

const { getContext } = require("./asyncRequestContext");

const ENV = process.env.NODE_ENV || "development";

/**
 * =========================================================
 * LOG LEVELS
 * =========================================================
 */
const LOG_LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Normalize and resolve active log level
 */
function resolveLogLevel() {
  const envLevel = process.env.LOG_LEVEL;

  if (envLevel) {
    return envLevel.toLowerCase();
  }

  if (ENV === "production") return "warn";
  if (ENV === "test") return "error";

  return "debug";
}

const ACTIVE_LOG_LEVEL = resolveLogLevel();

if (!LOG_LEVELS[ACTIVE_LOG_LEVEL]) {
  throw new Error(`Invalid LOG_LEVEL: ${ACTIVE_LOG_LEVEL}`);
}

const CURRENT_LEVEL = LOG_LEVELS[ACTIVE_LOG_LEVEL];

/**
 * Check if log should be emitted
 */
function shouldLog(level) {
  if (!LOG_LEVELS[level]) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return LOG_LEVELS[level] >= CURRENT_LEVEL;
}

/**
 * Safe context extraction
 */
function getRequestContext() {
  const ctx = getContext();

  return {
    requestId: ctx?.requestId || "no-request",
    sessionId: ctx?.sessionId || null,
    userId: ctx?.userId || null,
  };
}

function formatPrettyLog(entry) {
  const { timestamp, level, source, requestId, message, meta } = entry;

  const metaStr =
    meta && Object.keys(meta).length ? JSON.stringify(meta) : "";

  return `[${timestamp}] [${level.toUpperCase()}] [${source}] [${requestId}] "${message}" ${metaStr}`;
}

/**
 * Base logger engine
 */
function baseLog(level, message, meta = {}, source = "unknown") {
  if (!shouldLog(level)) return;

  const context = getRequestContext();

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    source,
    requestId: context?.requestId || "N/A",
    sessionId: context?.sessionId || "N/A",
    userId: context?.userId || "N/A",
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
 * Logger factory
 */
function createLogger(source) {
  if (!source) {
    throw new Error("Logger requires a source identifier");
  }

  return {
    /**
     * Debug logs (verbose, development-only insights)
     */
    debug: (message, meta) => baseLog("debug", message, meta, source),
    
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
  };
}

module.exports = createLogger;
