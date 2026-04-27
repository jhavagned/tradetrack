// server/src/utils/requestContext.js

let context = {
  requestId: null,
};

/**
 * Merges new data into the existing request context.
 *
 * USAGE:
 * Typically called by middleware at the start of a request lifecycle.
 *
 * @param {Object} data - Key-value pairs to store in context
 *
 * @example
 * setContext({ requestId: "abc-123" });
 */
function setContext(data) {
  context = { ...context, ...data };
}

/**
 * Retrieves the current request context.
 *
 * USAGE:
 * Used by logger and application layers to access request-scoped data.
 *
 * @returns {Object} Current context object
 *
 * @example
 * const ctx = getContext();
 * console.log(ctx.requestId);
 */
function getContext() {
  return context;
}

/**
 * Clears the request context.
 *
 * USAGE:
 * Called at the end of a request lifecycle to prevent leakage
 * between requests in long-running server processes.
 *
 * WARNING:
 * Always ensure this is called after request completion
 * to avoid stale context being reused.
 */
function clearContext() {
  context = {};
}

module.exports = {
  setContext,
  getContext,
  clearContext,
};
