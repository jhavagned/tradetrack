// /server/src/app.js

const express = require("express");
const cors = require("cors");

const tradeRoutes = require("./modules/trades/routes/trades.route");
const requestLogger = require("./middleware/requestLogger.middleware");

const app = express();

app.use(cors());

app.use(requestLogger);

app.use(express.json());

app.use("/api/trades", tradeRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is alive" });
});

module.exports = app;
