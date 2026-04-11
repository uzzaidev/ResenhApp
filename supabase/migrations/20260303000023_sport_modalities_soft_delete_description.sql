-- =====================================================
-- Migration: Sport Modalities - soft delete + description
-- Date: 2026-03-03
-- Description: Aligns schema with API expectations.
-- =====================================================

ALTER TABLE public.sport_modalities
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_sport_modalities_active
  ON public.sport_modalities (group_id, is_active)
  WHERE is_active = TRUE;
