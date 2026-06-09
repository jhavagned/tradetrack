-- /server/src/db/migrations/004_create_watchlist_items.sql
-- Creates the watchlist_items table for storing user watchlist tickers.
-- Each user has their own list of symbols with a position for ordering.
-- position allows users to reorder their watchlist in the future.

CREATE TABLE watchlist_items (
  item_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  symbol     VARCHAR(20) NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);