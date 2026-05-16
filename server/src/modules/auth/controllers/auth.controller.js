// /server/src/modules/auth/controllers/auth.controller.js

const {
  registerUser,
  loginWithPassword,
  createLoginSession,
  logout,
} = require("../services/auth.service");

const createLogger = require("../../../utils/logger");

const logger = createLogger("auth.controller");

const { validateLogin } = require("../validation/auth.validation");

/**
 * =========================================================
 * AUTH CONTROLLER
 * =========================================================
 *
 * PURPOSE:
 * Handles all authentication-related HTTP requests.
 *
 * This includes:
 * - User registration
 * - User login (session creation)
 * - Logout (session destruction)
 * - Session introspection (/me)
 *
 * =========================================================
 * AUTH FLOW OVERVIEW:
 *
 * LOGIN:
 * 1. Validate credentials
 * 2. Verify user
 * 3. Create session
 * 4. Set httpOnly cookie
 *
 * LOGOUT:
 * 1. Extract sessionId
 * 2. Destroy session from database
 * 3. Clear cookie
 *
 * ME:
 * 1. Require auth middleware
 * 2. Return validated userId
 *
 * =========================================================
 */

/**
 * =========================================================
 * REGISTER USER
 * =========================================================
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const error = validateLogin({ email, password });
    if (error) {
      return res.status(400).json({
        error: { message: error, code: "VALIDATION_ERROR" },
      });
    }

    const user = await registerUser({ email, password });

    return res.status(201).json({
      status: "success",
      data: {
        userId: user.user_id,
        email: user.email,
      },
    });
  } catch (err) {
    logger.error("Registration failed", { error: err.message });

    const statusCode = err.status || 500;
    const message = statusCode === 500 ? "Internal server error" : err.message;
    const code = err.code || (statusCode === 500 ? "INTERNAL_ERROR" : "ERROR");

    return res.status(statusCode).json({
      error: { message, code },
    });
  }
};

/**
 * =========================================================
 * LOGIN USER
 * =========================================================
 * POST /api/auth/login
 *
 * Creates session + sets cookie
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const error = validateLogin({ email, password });
  if (error) {
    return res.status(400).json({
      error: { message: error, code: "VALIDATION_ERROR" },
    });
  }

  try {
    // 1. Authenticate user
    const user = await loginWithPassword({ email, password });

    if (!user) {
      return res.status(401).json({
        error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS" },
      });
    }

    // 2. Create Session
    const session = await createLoginSession(user.userId);

    // 3. Set session cookie
    res.cookie("sessionId", session.sessionId, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    logger.info("User logged in", { userId: user.userId });

    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    logger.error("Login failed", { error: err.message });

    return res.status(500).json({
      error: { message: "Internal server error", code: "INTERNAL_ERROR" },
    });
  }
};

/**
 * =========================================================
 * LOGOUT USER
 * =========================================================
 * POST /api/auth/logout
 *
 * Destroys session and clears cookie
 */
const handleLogout = async (req, res) => {
  const sessionId =
    req.sessionId || req.cookies?.sessionId || req.headers["x-session-id"];

  if (sessionId) {
    await logout(sessionId);
  }

  // Clear cookie (match options used when setting it)
  res.clearCookie("sessionId", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production", // set to true in production (requires HTTPS)
  });

  logger.info("User logged out", {
    userId: req.userId || "unknown",
    sessionId: sessionId || "missing",
  });

  return res.status(200).json({
    status: "success",
  });
};

/**
 * =========================================================
 * GET CURRENT USER (/me)
 * =========================================================
 *
 * Requires auth middleware to populate req.userId
 */
const getMe = (req, res) => {
  if (!req.userId) {
    return res.status(401).json({
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    });
  }

  logger.info("Fetched current user", { userId: req.userId });

  res.status(200).json({
    status: "success",
    data: {
      userId: req.userId,
    },
  });
};

module.exports = {
  register,
  login,
  handleLogout,
  getMe,
};
