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
 * Register user (for testing/demo)
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
 * Login with email + password
 */
const loginWithPassword = async ({ email, password }) => {
  const user = findByEmail(email);

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) return null;

  const sessionId = crypto.randomUUID();

  createSession(sessionId, user.userId);

  return {
    sessionId,
    userId: user.userId,
  };
};

/**
 * Validate session (unchanged)
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

// const logout = (sessionId) => {
//   deleteSession(sessionId);
// };

const createLoginSession = (userId) => {
  if (!userId) {
    throw new Error("userId is required to create a session");
  }

  const sessionId = crypto.randomUUID();

  createSession(sessionId, userId);

  return { sessionId };
};

/**
 * Logout user (invalidate session)
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
