// /server/src/modules/auth/services/auth.service.js

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const {
  createSession,
  getSession,
  deleteSession,
} = require("../repositories/session.repository");

const { createUser, findByEmail } = require("../repositories/user.repository");

const SALT_ROUNDS = 10;

/**
 * =========================================================
 * AUTH SERVICE
 * =========================================================
 *
 * PURPOSE:
 * Core business logic for authentication.
 *
 * RESPONSIBILITIES:
 * - User registration (hashing + persistence)
 * - Credential validation (login)
 * - Session lifecycle management
 *
 * IMPORTANT DESIGN DECISIONS:
 * - Session creation is centralized in ONE place
 *   -> createLoginSession()
 *
 * - loginWithPassword() ONLY validates credentials
 *   -> does NOT create sessions
 *
 * This prevents:
 * Duplicate sessions
 * Hidden side effects
 * Debugging confusion
 *
 * =========================================================
 */

/**
 * =========================================================
 * REGISTER USER
 * =========================================================
 *
 * FLOW:
 * 1. Check if user already exists
 * 2. Hash password securely
 * 3. Persist user
 *
 * RETURNS:
 * - user object (without exposing password)
 */
const registerUser = async ({ email, password }) => {
  const existing = findByEmail(email);

  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = {
    userId: crypto.randomUUID(),
    email,
    passwordHash,
  };

  createUser(user);

  return user;
};

/**
 * =========================================================
 * LOGIN (CREDENTIAL VALIDATION ONLY)
 * =========================================================
 *
 * PURPOSE:
 * Validate email + password WITHOUT side effects
 *
 * IMPORTANT:
 * Does not create session
 * ONLY verifies credentials
 *
 * RETURNS:
 * - user object if valid
 * - null if invalid
 */
const loginWithPassword = async ({ email, password }) => {
  const user = findByEmail(email);

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) return null;

  //const sessionId = crypto.randomUUID();

  //createSession(sessionId, user.userId);

  return {
    userId: user.userId,
    email: user.email,
  };
};

/**
 * =========================================================
 * CREATE LOGIN SESSION (SINGLE SOURCE OF TRUTH)
 * =========================================================
 *
 * PURPOSE:
 * Create a new session AFTER credentials are validated
 *
 * FLOW:
 * 1. Generate sessionId
 * 2. Store session
 * 3. Return sessionId for cookie usage
 *
 * RETURNS:
 * - { sessionId }
 */
const createLoginSession = (userId) => {
  if (!userId) {
    throw new Error("userId is required to create a session");
  }

  const sessionId = crypto.randomUUID();

  createSession(sessionId, userId);

  return { sessionId };
};

/**
 * =========================================================
 * VALIDATE SESSION
 * =========================================================
 *
 * PURPOSE:
 * Check if session exists and is valid
 *
 * RETURNS:
 * - { sessionId, userId } if valid
 * - null if invalid/expired
 */
const validateSession = (sessionId) => {
  if (!sessionId) return null;

  const session = getSession(sessionId);
  if (!session) return null;

  return {
    sessionId,
    userId: session.userId,
  };
};

/**
 * =========================================================
 * LOGOUT (SESSION INVALIDATION)
 * =========================================================
 *
 * PURPOSE:
 * Destroy session on logout
 *
 * SAFE:
 * - No-op if sessionId missing
 */
const logout = (sessionId) => {
  if (!sessionId) return;

  deleteSession(sessionId);
};

module.exports = {
  registerUser,
  loginWithPassword,
  createLoginSession,
  validateSession,
  logout,
};
