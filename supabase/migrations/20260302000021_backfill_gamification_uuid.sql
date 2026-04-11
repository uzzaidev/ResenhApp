-- =====================================================
-- Migration: Backfill Gamification (UUID-compatible)
-- Date: 2026-03-02
-- Replaces legacy intent from:
--   - 20260225000001_gamification.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS public.achievement_types (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  rarity TEXT NOT NULL DEFAULT 'common'
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_secret BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type_id BIGINT NOT NULL REFERENCES public.achievement_types(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  progress_max INTEGER NOT NULL DEFAULT 1,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_type_id, group_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id
  ON public.user_achievements(user_id, unlocked_at DESC);

CREATE TABLE IF NOT EXISTS public.badges (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id, group_id)
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenges (
  id BIGSERIAL PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  reward_badge_id BIGINT REFERENCES public.badges(id) ON DELETE SET NULL,
  reward_achievement_id BIGINT REFERENCES public.achievement_types(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id BIGINT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE (challenge_id, user_id)
);

-- Seed minimal achievement catalog used by API/UI.
INSERT INTO public.achievement_types (code, name, description, category, rarity, points)
VALUES
  ('first_goal', 'Primeiro Gol', 'Marcou o primeiro gol registrado.', 'goals', 'common', 10),
  ('goals_10', 'Artilheiro Iniciante', 'Alcancou 10 gols.', 'goals', 'rare', 25),
  ('attendance_10', 'Presenca Forte', 'Participou de 10 eventos.', 'attendance', 'rare', 20),
  ('mvp_5', 'Craque do Grupo', 'Recebeu 5 MVPs.', 'mvp', 'epic', 40)
ON CONFLICT (code) DO NOTHING;

-- Compatibility helper required by /api/achievements/check.
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(
  p_user_id UUID,
  p_group_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_goals INTEGER := 0;
  v_games INTEGER := 0;
  v_mvp INTEGER := 0;
  v_unlocked INTEGER := 0;
BEGIN
  SELECT
    COALESCE(SUM(ps.goals), 0),
    COALESCE(SUM(ps.games_played), 0),
    COALESCE(SUM(ps.mvp_count), 0)
  INTO v_goals, v_games, v_mvp
  FROM public.player_stats ps
  WHERE ps.user_id = p_user_id
    AND (p_group_id IS NULL OR ps.group_id = p_group_id);

  IF v_goals >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type_id, progress, progress_max, group_id)
    SELECT p_user_id, at.id, LEAST(v_goals, 1), 1, p_group_id
    FROM public.achievement_types at
    WHERE at.code = 'first_goal'
    ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_unlocked = ROW_COUNT;
  END IF;

  IF v_goals >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type_id, progress, progress_max, group_id)
    SELECT p_user_id, at.id, LEAST(v_goals, 10), 10, p_group_id
    FROM public.achievement_types at
    WHERE at.code = 'goals_10'
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_games >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type_id, progress, progress_max, group_id)
    SELECT p_user_id, at.id, LEAST(v_games, 10), 10, p_group_id
    FROM public.achievement_types at
    WHERE at.code = 'attendance_10'
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_mvp >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type_id, progress, progress_max, group_id)
    SELECT p_user_id, at.id, LEAST(v_mvp, 5), 5, p_group_id
    FROM public.achievement_types at
    WHERE at.code = 'mvp_5'
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_unlocked;
END;
$$;

