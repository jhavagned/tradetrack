// /server/src/modules/auth/routes/auth.routes.js

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  handleLogout,
} = require("../controllers/auth.controller");

const authMiddleware = require("../../../middleware/auth.middleware");
const requireAuth = authMiddleware;

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */
router.post("/register", register);

router.post("/login", login);

/**
 * =========================
 * PROTECTED ROUTES
 * =========================
 */
router.post("/logout", requireAuth, handleLogout);

module.exports = router;
