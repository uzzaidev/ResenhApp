-- =====================================================
-- Migration: Backfill Permission Helpers (UUID-compatible)
-- Date: 2026-03-02
-- Replaces legacy intent from:
--   - 20260127000004_rls_policies.sql (function helpers only)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_group_member(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.user_id = p_user_id
      AND gm.group_id = p_group_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.user_id = p_user_id
      AND gm.group_id = p_group_id
      AND gm.role IN ('admin', 'owner')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_platform_access(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((
    SELECT p.platform_role IN ('admin', 'super_admin')
    FROM public.profiles p
    WHERE p.id = p_user_id
  ), FALSE);
$$;

