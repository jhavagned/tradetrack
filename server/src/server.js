// /server/src/server.js

require("dotenv").config();

const app = require("./app");
const createLogger = require("./utils/logger");
const { startSessionCleanupJob } = require("./modules/auth/repositories/session.repository");

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
 * - Start background jobs (session cleanup)
 * - Start HTTP server on configured port
 * - Log server startup metadata
 *
 * =========================================================
 * STARTUP FLOW:
 * 1. Load environment variables
 * 2. Initialize Express app
 * 3. Start session cleanup job (TTL enforcement)
 * 4. Start HTTP server
 * 5. Log startup success
 *
 * =========================================================
 * SESSION MANAGEMENT:
 * - Uses in-memory session store (temporary)
 * - TTL enforced via:
 *    a) Lazy expiration (on access)
 *    b) Background cleanup job (interval-based)
 *
 * NOTE:
 * - This MUST be called once at startup
 * - In production, replace with Redis TTL
 *
 * =========================================================
 * ENV VARIABLES:
 * - PORT: Server port (default: 5000)
 * - NODE_ENV: Environment (development | production)
 * - SESSION_TTL: Session lifetime in ms
 *
 * =========================================================
 * FUTURE IMPROVEMENTS:
 * - Replace in-memory session store with Redis
 * - Add graceful shutdown handling (SIGINT, SIGTERM)
 * - Add health check endpoints (/health)
 * - Add metrics/monitoring (Prometheus, OpenTelemetry)
 * =========================================================
 */

// Start background job for cleaning expired sessions
startSessionCleanupJob();

/**
 * Application entry point
 *
 * RESPONSIBILITIES:
 * - Load environment configuration
 * - Start HTTP server
 */
app.listen(PORT, () => {
  logger.info("Server started successfully", {
    port: Number(PORT),
    env: process.env.NODE_ENV,
  });
}); 
