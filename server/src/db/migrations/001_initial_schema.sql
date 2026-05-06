-- /server/src/db/migrations/001_initial_schema.sql

/*
 * PostgreSQL needs this extension to use gen_random_uuid(), which we'll
 * use to auto-generate UUID primary keys for every table. IF NOT EXISTS
 * makes it safe to run multiple times without erroring.
 */
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- Stores registered user accounts.
-- Password is stored as a bcrypt hash, never plain text.
-- ============================================================
CREATE TABLE users (
  user_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL UNIQUE, -- used for login, must be unique
  password_hash    TEXT        NOT NULL,        -- bcrypt hash
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Speeds up login lookups by email
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- SESSIONS
-- Tracks active user sessions.
-- Cascade ensures sessions are cleaned up when a user is deleted.
-- ============================================================
CREATE TABLE sessions (
  session_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL, -- session expiry enforced at app layer
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Speeds up session lookups and enforcing one session per user
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ============================================================
-- TRADES
-- Core table. Each trade belongs to a user.
-- exit_price, closed_at, notes and strategy are nullable
-- as they are not required at trade creation.
-- ============================================================
CREATE TABLE trades (
  trade_id     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  symbol       TEXT           NOT NULL,
  trade_type   TEXT           NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
  entry_price  NUMERIC(12, 4) NOT NULL,
  exit_price   NUMERIC(12, 4),               -- null until trade is closed
  quantity     NUMERIC(12, 4) NOT NULL,
  trade_status TEXT           NOT NULL DEFAULT 'open' CHECK (trade_status IN ('open', 'closed')),
  notes        TEXT,                          -- optional trade notes
  strategy     TEXT,                          -- optional strategy tag
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  closed_at    TIMESTAMPTZ                    -- null until trade is closed
);

-- Speeds up fetching all trades for a given user
CREATE INDEX idx_trades_user_id ON trades(user_id);