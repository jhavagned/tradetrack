// /server/src/server.js

require("dotenv").config();

const app = require("./app");
const createLogger = require("./utils/logger");
const { getPool } = require("./db/config/db");

const logger = createLogger("server");

const PORT = process.env.PORT || 5000;

/**
 * =========================================================
 * SERVER ENTRY POINT
 * =========================================================
 *
 * PURPOSE:
 * Bootstraps the backend application and starts the HTTP server.
 *
 * =========================================================
 * RESPONSIBILITIES:
 * - Load environment variables (dotenv)
 * - Initialize core application (Express app)
 * - Start HTTP server on configured port
 * - Log server startup metadata
 *
 * =========================================================
 * STARTUP FLOW:
 * 1. Load environment variables
 * 2. Validate database connection
 * 3. Initialize Express app
 * 4. Start HTTP server
 * 5. Log startup success
 *
 * =========================================================
 * SESSION MANAGEMENT:
 * - Sessions are persisted in PostgreSQL
 * - Session expiry enforced at query level (expires_at > NOW())
 * - No cleanup job needed
 *
 *
 * =========================================================
 * ENV VARIABLES:
 * - PORT: Server port (default: 5000)
 * - NODE_ENV: Environment (development | production)
 * - DB_HOST: Database host
 * - DB_PORT: Database port
 * - DB_NAME: Database name
 * - DB_USER: Database user
 * - DB_PASSWORD: Database password
 *
 * =========================================================
 * TODO:
 * - Add graceful shutdown handling (SIGINT, SIGTERM)
 * - Add health check endpoints (/health)
 * - Add metrics/monitoring (Prometheus, OpenTelemetry)
 * =========================================================
 */

/*
 * Validates the database connection on startup.
 * Acquires a client from the pool and immediately releases it.
 * Logs success or failure clearly before the server starts.
 */
const connectDB = async () => {
  try {
    const client = await getPool.connect();
    client.release();
    logger.info("Database connection established", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });
  } catch (error) {
    logger.error("Database connection failed", {
      message: error.message,
    });
    process.exit(1); // exit — no point starting the app without a DB
  }
};

/*
 * Main startup function.
 * Runs DB validation first, then starts the server.
 * If DB connection fails the process exits before the server starts.
 */
const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info("Server started successfully", {
      port: Number(PORT),
      env: process.env.NODE_ENV,
    });
  });
};

start();
