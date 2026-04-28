// server/src/utils/asyncRequestContext.js

const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Run a function within a request context
 */
const runWithContext = (context, callback) => {
  return asyncLocalStorage.run(context, callback);
};

/**
 * Get current request context
 */
const getContext = () => {
  return asyncLocalStorage.getStore();
};

module.exports = {
  runWithContext,
  getContext,
};
