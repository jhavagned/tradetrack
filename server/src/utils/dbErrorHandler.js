// /server/src/utils/dbErrorHandler.js

const createLogger = require("./logger");

const logger = createLogger("db.error.handler");

/**
 * =========================================================
 * DATABASE ERROR HANDLER
 * =========================================================
 *
 * PURPOSE:
 * Maps PostgreSQL error codes to meaningful HTTP errors.
 * Prevents raw Postgres errors from surfacing as 500s.
 *
 * =========================================================
 * POSTGRES ERROR CODES:
 * 23505 — unique_violation      (duplicate key)
 * 23502 — not_null_violation    (missing required field)
 * 23503 — foreign_key_violation (invalid foreign key reference)
 *
 * =========================================================
 * USAGE:
 * Call handleDbError(error) in any repository catch block.
 * It will throw a structured error or re-throw the original.
 * =========================================================
 */

/**
 * Maps a PostgreSQL error to a structured application error.
 * Throws a structured error with status, code, and message.
 * Re-throws the original error if unrecognized.
 *
 * @param {Error} error - The raw error from PostgreSQL
 * @throws {Error} - Structured error with status and code
 */
const handleDbError = (error) => {
  logger.debug("Handling database error", { pgCode: error.code });

  switch (error.code) {

    // ----------------------------------------------------------
    // 23505 — Unique Violation
    // Triggered when a duplicate value violates a unique constraint
    // e.g. duplicate email on register
    // ----------------------------------------------------------
    case "23505": {
      const field = extractField(error.detail);
      const err = new Error(
        field ? `${field} already exists` : "A record with that value already exists"
      );
      err.status = 409;
      err.code = "DUPLICATE_ERROR";
      logger.warn("Unique constraint violation", { field, detail: error.detail });
      throw err;
    }

    // ----------------------------------------------------------
    // 23502 — Not Null Violation
    // Triggered when a required field is missing
    // ----------------------------------------------------------
    case "23502": {
      const field = error.column || "unknown field";
      const err = new Error(`${field} is required`);
      err.status = 400;
      err.code = "NOT_NULL_ERROR";
      logger.warn("Not null constraint violation", { field });
      throw err;
    }

    // ----------------------------------------------------------
    // 23503 — Foreign Key Violation
    // Triggered when a referenced record does not exist
    // e.g. trade inserted with invalid user_id
    // ----------------------------------------------------------
    case "23503": {
      const err = new Error("Referenced record does not exist");
      err.status = 400;
      err.code = "FOREIGN_KEY_ERROR";
      logger.warn("Foreign key constraint violation", { detail: error.detail });
      throw err;
    }

    // ----------------------------------------------------------
    // Unrecognized error — re-throw as-is
    // Will be caught by the global error handler as a 500
    // ----------------------------------------------------------
    default:
      logger.error("Unrecognized database error", {
        pgCode: error.code,
        message: error.message,
      });
      throw error;
  }
};

/**
 * Extracts the field name from a Postgres error detail string.
 * e.g. 'Key (email)=(test@test.com) already exists.' → 'email'
 *
 * @param {string} detail - Postgres error detail string
 * @returns {string|null} - Extracted field name or null
 */
const extractField = (detail) => {
  if (!detail) return null;
  const match = detail.match(/Key \((.+?)\)=/);
  return match ? match[1] : null;
};

module.exports = { handleDbError };