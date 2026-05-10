// /client/src/utils/validation.js

/**
 * =========================================================
 * VALIDATION UTILITIES
 * =========================================================
 *
 * PURPOSE:
 * Shared validation functions used across the application.
 * Keeps validation logic out of components and ensures
 * consistent rules are applied everywhere.
 * =========================================================
 */

/**
 * Validates password against industry standard requirements
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param {string} pwd - Password to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validatePassword = (pwd) => {
  if (pwd.length < 12) return "Password must be at least 12 characters";
  if (!/[A-Z]/.test(pwd))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(pwd))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd))
    return "Password must contain at least one special character";
  return null;
};

/**
 * Validates that a value is a positive number
 *
 * @param {string|number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validatePositiveNumber = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) return `${fieldName} must be a positive number`;
  return null;
};

/**
 * Validates that a value is a positive integer
 *
 * @param {string|number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validatePositiveInteger = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num))
    return `${fieldName} must be a positive whole number`;
  return null;
};

/**
 * Validates that exit time is after entry time
 *
 * @param {string} entryTime - Entry time ISO string
 * @param {string} exitTime - Exit time ISO string
 * @returns {string|null} - Error message or null if valid
 */
export const validateExitAfterEntry = (entryTime, exitTime) => {
  if (entryTime && exitTime && new Date(exitTime) <= new Date(entryTime))
    return "Exit time must be after entry time";
  return null;
};

/**
 * Validates that exit price and exit time are either both present or both absent
 *
 * @param {string|number} exitPrice - Exit price value
 * @param {string} exitTime - Exit time value
 * @returns {string|null} - Error message or null if valid
 */
export const validateExitFields = (exitPrice, exitTime) => {
  if (exitPrice && !exitTime)
    return "Exit time is required when exit price is provided";
  if (exitTime && !exitPrice)
    return "Exit price is required when exit time is provided";
  return null;
};
