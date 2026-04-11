-- =====================================================
-- Migration: Backfill Analytics (UUID-compatible)
-- Date: 2026-03-02
-- Replaces legacy intent from:
--   - 20260218000001_analytics.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  mvp_count INTEGER NOT NULL DEFAULT 0,
  attendance_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_player_stats_group_id ON public.player_stats(group_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON public.player_stats(user_id);

CREATE TABLE IF NOT EXISTS public.event_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  attendees_count INTEGER NOT NULL DEFAULT 0,
  confirmed_count INTEGER NOT NULL DEFAULT 0,
  waitlist_count INTEGER NOT NULL DEFAULT 0,
  goals_count INTEGER NOT NULL DEFAULT 0,
  assists_count INTEGER NOT NULL DEFAULT 0,
  mvp_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL UNIQUE REFERENCES public.groups(id) ON DELETE CASCADE,
  total_events INTEGER NOT NULL DEFAULT 0,
  total_members INTEGER NOT NULL DEFAULT 0,
  total_charges INTEGER NOT NULL DEFAULT 0,
  total_collected_cents INTEGER NOT NULL DEFAULT 0,
  avg_attendance NUMERIC(6, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT 'all_time'
    CHECK (period IN ('weekly', 'monthly', 'yearly', 'all_time')),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  position INTEGER NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, metric, period, user_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_lookup
  ON public.leaderboards(group_id, metric, period, position);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id TEXT,
  action_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
  ON public.activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_group_created
  ON public.activity_log(group_id, created_at DESC);

-- Materialized view used by cron route when present.
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_top_scorers AS
SELECT
  ps.group_id,
  ps.user_id,
  COALESCE(ps.goals, 0) AS goals,
  ROW_NUMBER() OVER (
    PARTITION BY ps.group_id
    ORDER BY COALESCE(ps.goals, 0) DESC, ps.user_id
  ) AS position
FROM public.player_stats ps;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_scorers_unique
  ON public.mv_top_scorers(group_id, user_id);

