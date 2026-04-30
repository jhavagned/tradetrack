// /server/src/modules/auth/controllers/trades.controller.js

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
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const error = validateLogin({ email, password });
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error,
      });
    }

    const user = await registerUser({ email, password });

    return res.status(201).json({
      status: "success",
      data: {
        userId: user.userId,
        email: user.email,
      },
    });
  } catch (err) {
    logger.error("Registration failed", { error: err.message });

    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const error = validateLogin({ email, password });
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error,
    });
  }

  try {
    // 1. Validate credentials
    const user = await loginWithPassword({ email, password });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // 2. Create Session
    const session = await createLoginSession(user.userId);

    // 3. Set Cookie
    res.cookie("sessionId", session.sessionId, {
      httpOnly: true,
      sameSite: "lax",
    });

    logger.info("User logged in", { userId: user.userId });

    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    logger.error("Login failed", { error: err.message });

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/auth/logout
 */
const handleLogout = (req, res) => {
  const sessionId = req.cookies?.sessionId || req.headers["x-session-id"];

  logout(sessionId);

  res.clearCookie("sessionId");

  return res.json({
    status: "success",
  });
};

module.exports = {
  register,
  login,
  handleLogout,
};
