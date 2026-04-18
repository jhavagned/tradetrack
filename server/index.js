// Load external libraries
const express = require("express");
const cors = require("cors");

// Create the app
const app = express();
//Define the PORT
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Define array to store trades
const trades = [];

// test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is alive" });
});

// trades route
app.post("/api/trades", (req, res) => {
  const trade = req.body;

  // 1. add id
  trade.id = Date.now();

  // 2. store trade
  trades.push(trade);

  // 3. respond
  res.json({
    status: "success",
    message: "Trade created",
    data: trade,
  });
});

//Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
