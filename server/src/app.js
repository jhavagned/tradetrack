// /server/src/app.js

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const requestLogger = require("./middleware/requestLogger.middleware");

const authRoutes = require("./modules/auth/routes/auth.routes");
const tradeRoutes = require("./modules/trades/routes/trades.route");
const analyticsRoutes = require("./modules/analytics/routes/analytics.routes");

const app = express();

/**
 * =========================
 * CORE MIDDLEWARE
 * =========================
 */

// Enable CORS (frontend communication)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Parse JSON request bodies
app.use(express.json());

// Parse cookies (required for session auth)
app.use(cookieParser());

/**
 * =========================
 * OBSERVABILITY LAYER
 * =========================
 */
app.use(requestLogger);

/**
 * =========================
 * ROUTES
 * =========================
 */
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/analytics", analyticsRoutes);

/**
 * HEALTH CHECK
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is alive" });
});

module.exports = app;
