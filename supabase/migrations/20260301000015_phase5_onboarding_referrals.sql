-- =====================================================
-- Migration: Phase 5 - Onboarding and referrals
-- Date: 2026-03-01
-- Description:
--   - onboarding flags and referral fields for users table
--   - referrals table
-- =====================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code_unique
  ON users (referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_referred_by
  ON users (referred_by)
  WHERE referred_by IS NOT NULL;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  credits_awarded INTEGER NOT NULL DEFAULT 30 CHECK (credits_awarded >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status
  ON referrals (referrer_id, status);

CREATE INDEX IF NOT EXISTS idx_referrals_referral_code
  ON referrals (referral_code);

COMMENT ON COLUMN users.onboarding_completed IS
  'Whether user completed onboarding flow.';
COMMENT ON COLUMN users.referral_code IS
  'User shareable referral code.';
COMMENT ON COLUMN users.referred_by IS
  'User who referred this account.';
COMMENT ON TABLE referrals IS
  'Tracks referral relations and reward status.';
