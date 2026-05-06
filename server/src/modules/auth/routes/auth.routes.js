// /server/src/modules/auth/routes/auth.routes.js

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  handleLogout,
  getMe,
} = require("../controllers/auth.controller");

const requireAuth = require("../../../middleware/auth.middleware");

/**
 * =========================================================
 * AUTH ROUTES
 * =========================================================
 *
 * PURPOSE:
 * Defines all authentication-related HTTP endpoints.
 *
 * These routes manage:
 * - User registration
 * - User login (session creation)
 * - Session validation (/me)
 * - Session destruction (logout)
 *
 * =========================================================
 * AUTH STRATEGY:
 * - Cookie-based session authentication
 * - httpOnly sessionId stored in browser cookies
 * - Backend session store is source of truth
 * - authMiddleware validates session on protected routes
 *
 * =========================================================
 * ROUTE CATEGORIES:
 * 1. Public routes  → no authentication required
 * 2. Protected routes → require valid session
 *
 * =========================================================
 * SECURITY MODEL:
 * - Credentials never stored in frontend
 * - Session validation happens server-side
 * - Invalid/expired sessions are rejected via middleware
 * =========================================================
 */

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */

/**
 * Register new user
 * POST /api/auth/register
 */
router.post("/register", register);

/**
 * Login user and create session
 * POST /api/auth/login
 */
router.post("/login", login);

/**
 * =========================
 * PROTECTED ROUTES
 * =========================
 * 
 * These routes require a valid session.
 * authMiddleware ensures:
 * - sessionId exists
 * - session is valid
 * - userId is attached to request
 */

/**
 * Logout user (destroy session)
 * POST /api/auth/logout
 */
router.post("/logout", requireAuth, handleLogout);

/**
 * Get current authenticated user
 * GET /api/auth/me
 *
 * Used by frontend to:
 * - hydrate auth state on refresh
 * - validate session periodically (TTL awareness)
 */
router.get("/me", requireAuth, getMe);

module.exports = router; 
