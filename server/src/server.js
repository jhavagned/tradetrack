// /server/src/server.js

require("dotenv").config();

const app = require("./app");
const createLogger = require("./utils/logger");

const logger = createLogger("server");

const PORT = process.env.PORT || 5000;

/**
 * Application entry point
 *
 * RESPONSIBILITIES:
 * - Load environment configuration
 * - Start HTTP server
 * - Log startup status
 */
app.listen(PORT, () => {
  logger.info("Server started successfully", {
    port: Number(PORT),
    env: process.env.NODE_ENV,
  });
});
