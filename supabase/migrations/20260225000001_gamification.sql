-- =====================================================
-- Migration: Gamification System (Achievements & Badges)
-- Version: 1.0
-- Date: 2026-02-25
-- Description: Achievements, badges, and gamification features
-- =====================================================

-- =====================================================
-- ACHIEVEMENT_TYPES TABLE (templates for achievements)
-- =====================================================

CREATE TABLE achievement_types (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- ACH-FIRST-GOAL, ACH-HAT-TRICK, etc.

  -- Basic info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT, -- Supabase Storage or emoji
  category achievement_category_type NOT NULL,

  -- Unlock conditions (JSONB for flexibility)
  unlock_criteria JSONB NOT NULL DEFAULT '{
    "type": "goals",
    "threshold": 1
  }'::jsonb,

  -- Rarity/Points
  rarity TEXT DEFAULT 'common' CHECK (
    rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')
  ),
  points INTEGER DEFAULT 10,

  -- Visibility
  is_active BOOLEAN DEFAULT TRUE,
  is_secret BOOLEAN DEFAULT FALSE, -- Hidden until unlocked

  -- Sport modality (NULL = all sports)
  sport_modality sport_modality_type,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_achievement_types_code ON achievement_types(code);
CREATE INDEX idx_achievement_types_category ON achievement_types(category);
CREATE INDEX idx_achievement_types_rarity ON achievement_types(rarity);
CREATE INDEX idx_achievement_types_is_active ON achievement_types(is_active) WHERE is_active = TRUE;

-- =====================================================
-- USER_ACHIEVEMENTS TABLE (unlocked achievements)
-- =====================================================

CREATE TABLE user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type_id BIGINT NOT NULL REFERENCES achievement_types(id) ON DELETE CASCADE,

  -- Context (where it was unlocked)
  group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,

  -- Progress (for multi-step achievements)
  progress INTEGER DEFAULT 0,
  progress_max INTEGER, -- NULL = instant unlock

  -- Unlock details
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context

  UNIQUE(user_id, achievement_type_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_type_id ON user_achievements(achievement_type_id);
CREATE INDEX idx_user_achievements_group_id ON user_achievements(group_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- =====================================================
-- BADGES TABLE (visual badges for groups)
-- =====================================================

CREATE TABLE badges (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- BADGE-FOUNDER, BADGE-100-GOALS, etc.

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT, -- Hex color

  -- Earn conditions
  earn_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Rarity
  rarity TEXT DEFAULT 'common' CHECK (
    rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')
  ),

  -- Visibility
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_badges_code ON badges(code);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_badges_is_active ON badges(is_active) WHERE is_active = TRUE;

-- =====================================================
-- USER_BADGES TABLE (earned badges)
-- =====================================================

CREATE TABLE user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL,

  -- Display settings
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  -- Earned details
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  UNIQUE(user_id, badge_id, group_id)
);

-- Indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_group_id ON user_badges(group_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- =====================================================
-- MILESTONES TABLE (special events/records)
-- =====================================================

CREATE TABLE milestones (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_type TEXT NOT NULL CHECK (
    milestone_type IN (
      'first_goal', 'first_assist', 'first_event',
      'goals_10', 'goals_50', 'goals_100',
      'assists_10', 'assists_50', 'assists_100',
      'events_10', 'events_50', 'events_100',
      'perfect_attendance_month', 'hat_trick', 'poker',
      'clean_sheet', 'mvp_streak'
    )
  ),

  -- Context
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  value INTEGER, -- The actual value (e.g., 100 for goals_100)

  -- Timestamp
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, group_id, milestone_type)
);

-- Indexes
CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_group_id ON milestones(group_id);
CREATE INDEX idx_milestones_milestone_type ON milestones(milestone_type);
CREATE INDEX idx_milestones_achieved_at ON milestones(achieved_at DESC);

-- =====================================================
-- CHALLENGES TABLE (time-limited challenges)
-- =====================================================

CREATE TABLE challenges (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- CHAL-MARCH-2026, etc.

  -- Challenge details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,

  -- Scope
  scope TEXT DEFAULT 'group' CHECK (scope IN ('platform', 'group', 'user')),
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,

  -- Goals
  goal_type TEXT NOT NULL, -- 'goals', 'assists', 'events', etc.
  goal_target INTEGER NOT NULL,

  -- Rewards
  reward_points INTEGER DEFAULT 0,
  reward_badge_id BIGINT REFERENCES badges(id),
  reward_achievement_id BIGINT REFERENCES achievement_types(id),

  -- Time limits
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Created by
  created_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_challenges_code ON challenges(code);
CREATE INDEX idx_challenges_group_id ON challenges(group_id);
CREATE INDEX idx_challenges_is_active ON challenges(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_challenges_dates ON challenges(starts_at, ends_at);

-- =====================================================
-- CHALLENGE_PARTICIPANTS TABLE (user progress in challenges)
-- =====================================================

CREATE TABLE challenge_participants (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Progress
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Rank (within challenge)
  rank INTEGER,

  -- Joined
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(challenge_id, user_id)
);

-- Indexes
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_is_completed ON challenge_participants(is_completed);
CREATE INDEX idx_challenge_participants_rank ON challenge_participants(rank);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Check and unlock achievements for a user
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID, p_group_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
  achievement RECORD;
  unlocked_count INTEGER := 0;
  user_stats RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats
  FROM player_stats
  WHERE user_id = p_user_id AND group_id = p_group_id;

  -- Loop through active achievements
  FOR achievement IN
    SELECT * FROM achievement_types
    WHERE is_active = TRUE
    AND (sport_modality IS NULL OR sport_modality = (SELECT sport_modality FROM groups WHERE id = p_group_id))
  LOOP
    -- Check if already unlocked
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements
      WHERE user_id = p_user_id AND achievement_type_id = achievement.id
    ) THEN
      -- Check unlock criteria based on type
      CASE achievement.unlock_criteria->>'type'
        WHEN 'goals' THEN
          IF user_stats.total_goals >= (achievement.unlock_criteria->>'threshold')::INTEGER THEN
            INSERT INTO user_achievements (user_id, achievement_type_id, group_id)
            VALUES (p_user_id, achievement.id, p_group_id);
            unlocked_count := unlocked_count + 1;
          END IF;

        WHEN 'assists' THEN
          IF user_stats.total_assists >= (achievement.unlock_criteria->>'threshold')::INTEGER THEN
            INSERT INTO user_achievements (user_id, achievement_type_id, group_id)
            VALUES (p_user_id, achievement.id, p_group_id);
            unlocked_count := unlocked_count + 1;
          END IF;

        WHEN 'events' THEN
          IF user_stats.events_attended >= (achievement.unlock_criteria->>'threshold')::INTEGER THEN
            INSERT INTO user_achievements (user_id, achievement_type_id, group_id)
            VALUES (p_user_id, achievement.id, p_group_id);
            unlocked_count := unlocked_count + 1;
          END IF;

        WHEN 'streak' THEN
          IF user_stats.current_streak >= (achievement.unlock_criteria->>'threshold')::INTEGER THEN
            INSERT INTO user_achievements (user_id, achievement_type_id, group_id)
            VALUES (p_user_id, achievement.id, p_group_id);
            unlocked_count := unlocked_count + 1;
          END IF;

        ELSE
          -- Custom criteria (handled by application)
          NULL;
      END CASE;
    END IF;
  END LOOP;

  RETURN unlocked_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check achievements after event actions
CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  p_group_id BIGINT;
BEGIN
  -- Get group_id from event
  SELECT group_id INTO p_group_id
  FROM events
  WHERE id = NEW.event_id;

  -- Check and unlock achievements
  PERFORM check_and_unlock_achievements(NEW.user_id, p_group_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_event_action_check_achievements
AFTER INSERT ON event_actions
FOR EACH ROW
EXECUTE FUNCTION trigger_check_achievements();

-- =====================================================
-- RLS POLICIES (Gamification)
-- =====================================================

ALTER TABLE achievement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Achievement Types: Everyone can view active non-secret achievements
CREATE POLICY "Active achievements are viewable"
ON achievement_types FOR SELECT
USING (is_active = TRUE);

-- User Achievements: Users can view own achievements
CREATE POLICY "Users can view own achievements"
ON user_achievements FOR SELECT
USING (
  user_id = auth.uid()
  OR (group_id IS NOT NULL AND is_group_member(auth.uid(), group_id))
  OR has_platform_access(auth.uid())
);

-- Badges: Everyone can view active badges
CREATE POLICY "Active badges are viewable"
ON badges FOR SELECT
USING (is_active = TRUE);

-- User Badges: Users can view own badges and others' visible badges
CREATE POLICY "Users can view badges"
ON user_badges FOR SELECT
USING (
  user_id = auth.uid()
  OR is_visible = TRUE
  OR has_platform_access(auth.uid())
);

-- User Badges: Users can update own badges (visibility, order)
CREATE POLICY "Users can update own badges"
ON user_badges FOR UPDATE
USING (user_id = auth.uid());

-- Milestones: Group members can view group milestones
CREATE POLICY "Group members can view milestones"
ON milestones FOR SELECT
USING (
  user_id = auth.uid()
  OR (group_id IS NOT NULL AND is_group_member(auth.uid(), group_id))
  OR has_platform_access(auth.uid())
);

-- Challenges: Group members can view group challenges
CREATE POLICY "Group members can view challenges"
ON challenges FOR SELECT
USING (
  scope = 'platform'
  OR (scope = 'group' AND group_id IS NOT NULL AND is_group_member(auth.uid(), group_id))
  OR has_platform_access(auth.uid())
);

-- Challenge Participants: Users can view own participation
CREATE POLICY "Users can view own challenge participation"
ON challenge_participants FOR SELECT
USING (
  user_id = auth.uid()
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- SEED DATA (Default Achievements)
-- =====================================================

INSERT INTO achievement_types (code, name, description, category, unlock_criteria, rarity, points) VALUES
-- Goals
('ACH-FIRST-GOAL', 'Primeiro Gol', 'Marque seu primeiro gol', 'goals', '{"type": "goals", "threshold": 1}', 'common', 10),
('ACH-GOALS-10', '10 Gols', 'Marque 10 gols', 'goals', '{"type": "goals", "threshold": 10}', 'uncommon', 50),
('ACH-GOALS-50', '50 Gols', 'Marque 50 gols', 'goals', '{"type": "goals", "threshold": 50}', 'rare', 200),
('ACH-GOALS-100', 'Artilheiro Centenário', 'Marque 100 gols', 'goals', '{"type": "goals", "threshold": 100}', 'epic', 500),
('ACH-HAT-TRICK', 'Hat-Trick', 'Marque 3 gols em um jogo', 'goals', '{"type": "hat_trick", "threshold": 3}', 'rare', 100),

-- Assists
('ACH-FIRST-ASSIST', 'Primeira Assistência', 'Dê sua primeira assistência', 'assists', '{"type": "assists", "threshold": 1}', 'common', 10),
('ACH-ASSISTS-10', '10 Assistências', 'Dê 10 assistências', 'assists', '{"type": "assists", "threshold": 10}', 'uncommon', 50),
('ACH-ASSISTS-50', '50 Assistências', 'Dê 50 assistências', 'assists', '{"type": "assists", "threshold": 50}', 'rare', 200),

-- Participation
('ACH-FIRST-EVENT', 'Primeira Pelada', 'Participe da sua primeira pelada', 'participation', '{"type": "events", "threshold": 1}', 'common', 10),
('ACH-EVENTS-10', '10 Peladas', 'Participe de 10 peladas', 'participation', '{"type": "events", "threshold": 10}', 'uncommon', 50),
('ACH-EVENTS-50', '50 Peladas', 'Participe de 50 peladas', 'participation', '{"type": "events", "threshold": 50}', 'rare', 200),
('ACH-EVENTS-100', 'Raça Pura', 'Participe de 100 peladas', 'participation', '{"type": "events", "threshold": 100}', 'epic', 500),

-- Streaks
('ACH-STREAK-5', 'Sequência de 5', 'Participe de 5 peladas consecutivas', 'streak', '{"type": "streak", "threshold": 5}', 'uncommon', 75),
('ACH-STREAK-10', 'Sequência de 10', 'Participe de 10 peladas consecutivas', 'streak', '{"type": "streak", "threshold": 10}', 'rare', 150),
('ACH-STREAK-20', 'Imortal', 'Participe de 20 peladas consecutivas', 'streak', '{"type": "streak", "threshold": 20}', 'legendary', 500),

-- Special
('ACH-PERFECT-MONTH', 'Mês Perfeito', 'Participe de todas as peladas em um mês', 'special', '{"type": "perfect_month"}', 'epic', 300),
('ACH-EARLY-BIRD', 'Madrugador', 'Seja o primeiro a confirmar 10 vezes', 'special', '{"type": "early_bird", "threshold": 10}', 'uncommon', 50),
('ACH-MVP-MONTH', 'MVP do Mês', 'Seja eleito MVP 5 vezes em um mês', 'special', '{"type": "mvp_month", "threshold": 5}', 'legendary', 1000);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE achievement_types IS 'Achievement templates with unlock criteria';
COMMENT ON TABLE user_achievements IS 'Unlocked achievements per user';
COMMENT ON TABLE badges IS 'Visual badges for groups and users';
COMMENT ON TABLE user_badges IS 'Earned badges per user';
COMMENT ON TABLE milestones IS 'Special milestone events and records';
COMMENT ON TABLE challenges IS 'Time-limited challenges and events';
COMMENT ON TABLE challenge_participants IS 'User participation and progress in challenges';
