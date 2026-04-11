-- =====================================================
-- Migration: Phase 2 - Credit earning rules and ledger
-- Date: 2026-03-01
-- Description: Adds earning rules, daily limits, and user credit ledger.
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_earning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL UNIQUE,
  credits_awarded INTEGER NOT NULL CHECK (credits_awarded >= 0),
  daily_limit INTEGER NULL CHECK (daily_limit IS NULL OR daily_limit >= 0),
  min_content_length INTEGER NULL CHECK (min_content_length IS NULL OR min_content_length >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_credit_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  earned_count INTEGER NOT NULL DEFAULT 0 CHECK (earned_count >= 0),
  earned_credits INTEGER NOT NULL DEFAULT 0 CHECK (earned_credits >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, action_type, date)
);

CREATE TABLE IF NOT EXISTS user_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  direction TEXT NOT NULL CHECK (direction IN ('earn', 'spend')),
  action_type TEXT NOT NULL,
  description TEXT NULL,
  reference_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_credit_earnings_user_date
  ON daily_credit_earnings (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_user_credit_transactions_user_created
  ON user_credit_transactions (user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_credit_transactions_unique_reference
  ON user_credit_transactions (user_id, action_type, reference_id)
  WHERE reference_id IS NOT NULL;

INSERT INTO credit_earning_rules (action_type, credits_awarded, daily_limit, description) VALUES
  ('post_training_photo', 10, 2, 'Postar foto de treino'),
  ('react_to_post', 1, 20, 'Reagir a post'),
  ('comment_on_post', 2, 10, 'Comentar em post'),
  ('rsvp_yes', 3, 5, 'Confirmar presenca em evento'),
  ('attend_event', 5, 3, 'Presenca confirmada no evento'),
  ('receive_mvp', 15, 1, 'Receber MVP'),
  ('complete_profile', 50, 1, 'Completar perfil'),
  ('invite_friend', 30, 10, 'Convidar amigo que se cadastra'),
  ('first_event_created', 20, 1, 'Criar primeiro evento'),
  ('attendance_streak_10', 100, 1, 'Sequencia de 10 presencas')
ON CONFLICT (action_type) DO UPDATE
SET
  credits_awarded = EXCLUDED.credits_awarded,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description;

CREATE OR REPLACE FUNCTION trg_set_updated_at_daily_credit_earnings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_credit_earnings_updated_at ON daily_credit_earnings;
CREATE TRIGGER trg_daily_credit_earnings_updated_at
  BEFORE UPDATE ON daily_credit_earnings
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_updated_at_daily_credit_earnings();
