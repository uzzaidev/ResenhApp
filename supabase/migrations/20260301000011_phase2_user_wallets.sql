-- =====================================================
-- Migration: Phase 2 - User wallets for personal credits
-- Date: 2026-03-01
-- Description: Adds personal wallet model for credits.
-- =====================================================

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
  lifetime_spent INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_balance
  ON user_wallets (balance);

INSERT INTO user_wallets (user_id)
SELECT u.id
FROM users u
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION create_user_wallet_on_user_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_wallet_on_user_insert ON users;
CREATE TRIGGER trg_create_user_wallet_on_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet_on_user_insert();
