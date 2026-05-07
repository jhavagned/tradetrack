-- /server/src/db/migrations/002_add_entry_exit_time_to_trades.sql

-- /server/src/db/migrations/002_add_entry_exit_time_to_trades.sql
-- Adds explicit entry and exit time columns to the trades table.
-- These represent the actual time a trade was entered/exited in the market,
-- separate from created_at (when the journal entry was recorded).

ALTER TABLE trades
  ADD COLUMN entry_time TIMESTAMPTZ,
  ADD COLUMN exit_time  TIMESTAMPTZ;