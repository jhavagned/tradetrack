-- /server/src/db/migrations/003_add_emotions_to_trades.sql
-- Adds emotional state tracking columns to the trades table.
-- Traders can record how they felt before, during, and after each trade
-- to help identify patterns between emotional state and performance.
-- All three columns are nullable — existing trades are unaffected.

ALTER TABLE trades
  ADD COLUMN emotion_before  VARCHAR(20),
  ADD COLUMN emotion_during  VARCHAR(20),
  ADD COLUMN emotion_after   VARCHAR(20);