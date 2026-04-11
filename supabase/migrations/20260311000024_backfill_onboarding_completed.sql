-- =====================================================
-- Migration: Backfill onboarding flag for legacy users
-- Date: 2026-03-11
-- Description:
--   Marks pre-rollout accounts as onboarding completed so only
--   new signups are forced through the onboarding wizard.
-- =====================================================

UPDATE users
SET onboarding_completed = TRUE,
    updated_at = NOW()
WHERE onboarding_completed = FALSE
  AND (created_at IS NULL OR created_at < TIMESTAMPTZ '2026-03-11 00:00:00+00');
