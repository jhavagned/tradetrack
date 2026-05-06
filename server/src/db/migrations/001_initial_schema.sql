-- /server/src/db/migrations/001_initial_schema.sql

/*
* PostgreSQL needs this extension to use gen_random_uuid(), which we'll 
* use to auto-generate UUID primary keys for every table. IF NOT EXISTS 
* makes it safe to run multiple times without erroring.
*/
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  user_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL UNIQUE,
  password_hash    TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email)

CREATE TABLE sessions (
  session_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE TABLE trades (
  trade_id     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  symbol       TEXT           NOT NULL,
  trade_type   TEXT           NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
  entry_price  NUMERIC(12, 4) NOT NULL,
  exit_price   NUMERIC(12, 4),
  quantity     NUMERIC(12, 4) NOT NULL,
  trade_status TEXT           NOT NULL DEFAULT 'open' CHECK (trade_status IN ('open', 'closed')),
  notes        TEXT,
  strategy     TEXT,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  closed_at    TIMESTAMPTZ
);

CREATE INDEX idx_trades_user_id ON trades(user_id);