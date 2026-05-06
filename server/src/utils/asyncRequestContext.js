// server/src/utils/asyncRequestContext.js

const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * =========================================================
 * ASYNC REQUEST CONTEXT
 * =========================================================
 *
 * PURPOSE:
 * Provides request-scoped storage across async calls.
 *
 * This enables:
 * - request tracing
 * - structured logging per request
 * - user/session correlation across services
 *
 * =========================================================
 * BACKING TECHNOLOGY:
 * Node.js AsyncLocalStorage
 *
 * =========================================================
 * IMPORTANT:
 * Context only exists inside runWithContext scope.
 * Outside of it → getContext() returns undefined.
 * =========================================================
 */

/**
 * Run a function inside a request-scoped context
 *
 * @param {Object} context - initial request context
 * @param {Function} callback - execution function
 */
const runWithContext = (context, callback) => {
  return asyncLocalStorage.run(context, callback);
};

/**
 * Get current request context
 *
 * @returns {Object|undefined}
 */
const getContext = () => {
  return asyncLocalStorage.getStore();
};

/**
 * Merge additional data into current context safely
 *
 * Prevents unsafe direct mutation patterns.
 */
const updateContext = (updates = {}) => {
  const store = asyncLocalStorage.getStore();

  if (!store) return;

  Object.assign(store, updates);
};

module.exports = {
  runWithContext,
  getContext,
  updateContext,
};
