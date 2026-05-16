// /server/tests/setup.js

require("dotenv").config();

/*
 * Test environment setup.
 * Runs before any test file is executed via Jest's setupFiles config.
 * Loads .env first, then overrides DB_NAME to point at the test
 * database so tests never touch the development database.
 */
process.env.DB_NAME = "tradetrack_test";
