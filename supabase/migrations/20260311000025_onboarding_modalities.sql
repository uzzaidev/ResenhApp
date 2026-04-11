-- =====================================================
-- Migration: Onboarding modality preferences
-- Date: 2026-03-11
-- Description:
--   Persists onboarding modality interests on users table.
-- =====================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_modalities JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN users.onboarding_modalities IS
  'User-selected modalities during onboarding wizard.';
