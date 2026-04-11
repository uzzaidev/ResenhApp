-- =====================================================
-- Migration: Phase 1 - Group lifecycle fields
-- Date: 2026-03-01
-- Description: Adds lifecycle fields required by roadmap phase 1.
-- =====================================================

ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_groups_expires_at
  ON groups (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_groups_is_suspended
  ON groups (is_suspended)
  WHERE is_suspended = TRUE;

COMMENT ON COLUMN groups.expires_at IS
  'Date when group access expires and requires renewal.';

COMMENT ON COLUMN groups.is_suspended IS
  'Administrative suspension flag for temporarily disabling a group.';
