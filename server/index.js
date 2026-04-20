// /server/index.js

// =========================
// Imports
// =========================
const express = require("express");
const cors = require("cors");

// =========================
// App Initialization
// =========================
const app = express();

// Use env variable with fallback
const PORT = process.env.PORT || 5000;

// =========================
// Middleware
// =========================

// Enable CORS (allows frontend to talk to backend)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// =========================
// In-memory Data Store
// =========================
// NOTE: This resets every time server restarts
const trades = [];

// =========================
// Utility Functions
// =========================

/**
 * Validate incoming trade data
 * Ensures required fields + valid numbers
 */
const validateTrade = (trade) => {
  const { symbol, type, entryPrice, quantity, exitPrice, exitTime } = trade;

  // Required fields
  if (!symbol || !type || !entryPrice || !quantity) {
    return "Missing required fields";
  }

  // Numeric validation
  if (
    Number(entryPrice) <= 0 ||
    Number(quantity) <= 0 ||
    (exitPrice && Number(exitPrice) <= 0)
  ) {
    return "Invalid numeric values";
  }

  // Partial exit validation
  const hasExitPrice = !!exitPrice;
  const hasExitTime = !!exitTime;

  if ((hasExitPrice || hasExitTime) && !(hasExitPrice && hasExitTime)) {
    return "Incomplete exit data";
  }

  return null; // valid
};

// =========================
// Routes
// =========================

// Health check (for debugging / monitoring)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is alive",
  });
});

// GET all trades
app.get("/api/trades", (req, res) => {
  res.json({
    status: "success",
    data: trades,
  });
});

// POST create trade
app.post("/api/trades", (req, res) => {
  const trade = req.body;

  // =========================
  // Validation
  // =========================
  const error = validateTrade(trade);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error,
    });
  }

  // =========================
  // Data Formatting
  // =========================
  const newTrade = {
    ...trade,
    id: Date.now(), // simple unique ID
    entryPrice: Number(trade.entryPrice),
    quantity: Number(trade.quantity),
    exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
    createdAt: new Date().toISOString(),
  };

  // =========================
  // Store Trade
  // =========================
  trades.push(newTrade);

  // =========================
  // Response
  // =========================
  res.status(201).json({
    status: "success",
    message: "Trade created",
    data: newTrade,
  });
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});