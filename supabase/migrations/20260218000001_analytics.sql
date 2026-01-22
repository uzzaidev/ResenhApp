-- =====================================================
-- Migration: Analytics and Metrics System
-- Version: 1.0
-- Date: 2026-02-18
-- Description: Player statistics, rankings, and analytics
-- =====================================================

-- =====================================================
-- PLAYER_STATS TABLE (aggregate stats per player per group)
-- =====================================================

CREATE TABLE player_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Participation metrics
  total_events INTEGER DEFAULT 0,
  events_confirmed INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  events_missed INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN events_confirmed > 0
      THEN (events_attended::DECIMAL / events_confirmed * 100)
      ELSE 0
    END
  ) STORED,

  -- Performance metrics
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_yellow_cards INTEGER DEFAULT 0,
  total_red_cards INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0, -- For goalkeepers

  -- MVP / Voting
  total_votes_received INTEGER DEFAULT 0,
  average_rating DECIMAL(4, 2) DEFAULT 0.00,

  -- Streaks
  current_streak INTEGER DEFAULT 0, -- Consecutive events attended
  longest_streak INTEGER DEFAULT 0,
  last_event_date DATE,

  -- Financial
  total_paid DECIMAL(10, 2) DEFAULT 0.00,
  total_owed DECIMAL(10, 2) DEFAULT 0.00,
  payment_compliance_rate DECIMAL(5, 2) DEFAULT 100.00,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, group_id)
);

-- Indexes
CREATE INDEX idx_player_stats_user_id ON player_stats(user_id);
CREATE INDEX idx_player_stats_group_id ON player_stats(group_id);
CREATE INDEX idx_player_stats_total_goals ON player_stats(total_goals DESC);
CREATE INDEX idx_player_stats_total_assists ON player_stats(total_assists DESC);
CREATE INDEX idx_player_stats_attendance_rate ON player_stats(attendance_rate DESC);
CREATE INDEX idx_player_stats_average_rating ON player_stats(average_rating DESC);

-- =====================================================
-- EVENT_STATS TABLE (aggregate stats per event)
-- =====================================================

CREATE TABLE event_stats (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Participation
  total_rsvps INTEGER DEFAULT 0,
  total_confirmed INTEGER DEFAULT 0,
  total_attended INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5, 2) DEFAULT 0.00,

  -- Game stats
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_cards INTEGER DEFAULT 0,

  -- Financial
  total_cost DECIMAL(10, 2) DEFAULT 0.00,
  total_collected DECIMAL(10, 2) DEFAULT 0.00,
  collection_rate DECIMAL(5, 2) DEFAULT 0.00,

  -- MVP
  mvp_user_id UUID REFERENCES profiles(id),
  mvp_votes INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_stats_event_id ON event_stats(event_id);
CREATE INDEX idx_event_stats_mvp_user_id ON event_stats(mvp_user_id);

-- =====================================================
-- GROUP_STATS TABLE (aggregate stats per group)
-- =====================================================

CREATE TABLE group_stats (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT UNIQUE NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Membership
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  average_attendance_rate DECIMAL(5, 2) DEFAULT 0.00,

  -- Events
  total_events INTEGER DEFAULT 0,
  events_completed INTEGER DEFAULT 0,
  events_cancelled INTEGER DEFAULT 0,

  -- Goals
  total_goals_scored INTEGER DEFAULT 0,
  average_goals_per_event DECIMAL(5, 2) DEFAULT 0.00,

  -- Top performers
  top_scorer_id UUID REFERENCES profiles(id),
  top_scorer_goals INTEGER DEFAULT 0,
  top_assister_id UUID REFERENCES profiles(id),
  top_assister_assists INTEGER DEFAULT 0,

  -- Financial
  total_revenue DECIMAL(12, 2) DEFAULT 0.00,
  total_expenses DECIMAL(12, 2) DEFAULT 0.00,
  balance DECIMAL(12, 2) DEFAULT 0.00,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_group_stats_group_id ON group_stats(group_id);

-- =====================================================
-- LEADERBOARDS TABLE (time-based rankings)
-- =====================================================

CREATE TABLE leaderboards (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Leaderboard type
  category TEXT NOT NULL CHECK (
    category IN ('goals', 'assists', 'attendance', 'mvp', 'streak', 'all_time')
  ),

  -- Time period
  period_type TEXT NOT NULL CHECK (
    period_type IN ('weekly', 'monthly', 'yearly', 'all_time')
  ),
  period_start DATE,
  period_end DATE,

  -- Rankings (JSONB array of {user_id, rank, value})
  rankings JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  total_players INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_id, category, period_type, period_start)
);

-- Indexes
CREATE INDEX idx_leaderboards_group_id ON leaderboards(group_id);
CREATE INDEX idx_leaderboards_category ON leaderboards(category);
CREATE INDEX idx_leaderboards_period ON leaderboards(period_type, period_start);

-- =====================================================
-- ACTIVITY_LOG TABLE (audit trail)
-- =====================================================

CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,

  -- Actor
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Action
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'joined', 'left', etc.
  entity_type TEXT NOT NULL, -- 'group', 'event', 'charge', etc.
  entity_id BIGINT,

  -- Context
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,

  -- Details
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- IP and device tracking
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_group_id ON activity_log(group_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- Partition by month (for performance)
-- CREATE TABLE activity_log_2026_01 PARTITION OF activity_log
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- =====================================================
-- MATERIALIZED VIEWS (for performance)
-- =====================================================

-- Top Scorers per Group
CREATE MATERIALIZED VIEW mv_top_scorers AS
SELECT
  g.id AS group_id,
  g.name AS group_name,
  p.id AS user_id,
  p.full_name,
  p.avatar_url,
  ps.total_goals,
  ps.total_assists,
  ps.total_events,
  ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY ps.total_goals DESC) AS rank
FROM groups g
JOIN player_stats ps ON ps.group_id = g.id
JOIN profiles p ON p.id = ps.user_id
WHERE g.deleted_at IS NULL
AND p.deleted_at IS NULL
ORDER BY g.id, ps.total_goals DESC;

CREATE UNIQUE INDEX idx_mv_top_scorers ON mv_top_scorers(group_id, user_id);
CREATE INDEX idx_mv_top_scorers_group ON mv_top_scorers(group_id, rank);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_top_scorers()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_scorers;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update player stats after event action
CREATE OR REPLACE FUNCTION update_player_stats_from_action()
RETURNS TRIGGER AS $$
DECLARE
  p_group_id BIGINT;
BEGIN
  -- Get group_id from event
  SELECT group_id INTO p_group_id
  FROM events
  WHERE id = NEW.event_id;

  -- Ensure player_stats record exists
  INSERT INTO player_stats (user_id, group_id)
  VALUES (NEW.user_id, p_group_id)
  ON CONFLICT (user_id, group_id) DO NOTHING;

  -- Update stats based on action type
  CASE NEW.action_type
    WHEN 'goal' THEN
      UPDATE player_stats
      SET total_goals = total_goals + 1
      WHERE user_id = NEW.user_id AND group_id = p_group_id;

    WHEN 'assist' THEN
      UPDATE player_stats
      SET total_assists = total_assists + 1
      WHERE user_id = NEW.user_id AND group_id = p_group_id;

    WHEN 'yellow_card' THEN
      UPDATE player_stats
      SET total_yellow_cards = total_yellow_cards + 1
      WHERE user_id = NEW.user_id AND group_id = p_group_id;

    WHEN 'red_card' THEN
      UPDATE player_stats
      SET total_red_cards = total_red_cards + 1
      WHERE user_id = NEW.user_id AND group_id = p_group_id;

    WHEN 'save' THEN
      UPDATE player_stats
      SET total_saves = total_saves + 1
      WHERE user_id = NEW.user_id AND group_id = p_group_id;

    ELSE
      -- Do nothing for other action types
      NULL;
  END CASE;

  -- Update assists if assisted_by is present
  IF NEW.assisted_by IS NOT NULL AND NEW.action_type = 'goal' THEN
    UPDATE player_stats
    SET total_assists = total_assists + 1
    WHERE user_id = NEW.assisted_by AND group_id = p_group_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_event_action_update_stats
AFTER INSERT ON event_actions
FOR EACH ROW
EXECUTE FUNCTION update_player_stats_from_action();

-- Update attendance stats after check-in
CREATE OR REPLACE FUNCTION update_attendance_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure player_stats record exists
  INSERT INTO player_stats (user_id, group_id)
  VALUES (NEW.user_id, NEW.group_id)
  ON CONFLICT (user_id, group_id) DO NOTHING;

  IF NEW.checked_in = TRUE AND (OLD.checked_in IS NULL OR OLD.checked_in = FALSE) THEN
    -- Player checked in
    UPDATE player_stats
    SET
      events_attended = events_attended + 1,
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_event_date = (SELECT date FROM events WHERE id = NEW.event_id)
    WHERE user_id = NEW.user_id AND group_id = NEW.group_id;
  END IF;

  -- Update confirmed count
  IF NEW.status = 'yes' AND (OLD.status IS NULL OR OLD.status != 'yes') THEN
    UPDATE player_stats
    SET events_confirmed = events_confirmed + 1
    WHERE user_id = NEW.user_id AND group_id = NEW.group_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_update_attendance_stats
AFTER INSERT OR UPDATE ON event_attendance
FOR EACH ROW
EXECUTE FUNCTION update_attendance_stats();

-- Calculate leaderboard for a group and period
CREATE OR REPLACE FUNCTION calculate_leaderboard(
  p_group_id BIGINT,
  p_category TEXT,
  p_period_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  period_start_date DATE;
  period_end_date DATE;
BEGIN
  -- Calculate period dates
  CASE p_period_type
    WHEN 'weekly' THEN
      period_start_date := DATE_TRUNC('week', CURRENT_DATE);
      period_end_date := period_start_date + INTERVAL '7 days';
    WHEN 'monthly' THEN
      period_start_date := DATE_TRUNC('month', CURRENT_DATE);
      period_end_date := period_start_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      period_start_date := DATE_TRUNC('year', CURRENT_DATE);
      period_end_date := period_start_date + INTERVAL '1 year';
    ELSE -- all_time
      period_start_date := NULL;
      period_end_date := NULL;
  END CASE;

  -- Build rankings based on category
  CASE p_category
    WHEN 'goals' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'rank', ROW_NUMBER() OVER (ORDER BY total_goals DESC),
          'value', total_goals,
          'full_name', (SELECT full_name FROM profiles WHERE id = user_id)
        )
      )
      INTO result
      FROM player_stats
      WHERE group_id = p_group_id
      ORDER BY total_goals DESC
      LIMIT 100;

    WHEN 'assists' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'rank', ROW_NUMBER() OVER (ORDER BY total_assists DESC),
          'value', total_assists,
          'full_name', (SELECT full_name FROM profiles WHERE id = user_id)
        )
      )
      INTO result
      FROM player_stats
      WHERE group_id = p_group_id
      ORDER BY total_assists DESC
      LIMIT 100;

    WHEN 'attendance' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'rank', ROW_NUMBER() OVER (ORDER BY attendance_rate DESC),
          'value', attendance_rate,
          'full_name', (SELECT full_name FROM profiles WHERE id = user_id)
        )
      )
      INTO result
      FROM player_stats
      WHERE group_id = p_group_id
      ORDER BY attendance_rate DESC
      LIMIT 100;

    ELSE
      result := '[]'::jsonb;
  END CASE;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES (Analytics)
-- =====================================================

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Player Stats: Group members can view
CREATE POLICY "Group members can view player stats"
ON player_stats FOR SELECT
USING (
  is_group_member(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Event Stats: Group members can view
CREATE POLICY "Group members can view event stats"
ON event_stats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_stats.event_id
    AND is_group_member(auth.uid(), events.group_id)
  )
);

-- Group Stats: Group members can view
CREATE POLICY "Group members can view group stats"
ON group_stats FOR SELECT
USING (
  is_group_member(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Leaderboards: Group members can view
CREATE POLICY "Group members can view leaderboards"
ON leaderboards FOR SELECT
USING (
  is_group_member(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Activity Log: Group members can view group activities
CREATE POLICY "Group members can view activity log"
ON activity_log FOR SELECT
USING (
  user_id = auth.uid()
  OR (group_id IS NOT NULL AND is_group_member(auth.uid(), group_id))
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE player_stats IS 'Aggregate statistics per player per group';
COMMENT ON TABLE event_stats IS 'Aggregate statistics per event';
COMMENT ON TABLE group_stats IS 'Aggregate statistics per group';
COMMENT ON TABLE leaderboards IS 'Time-based rankings and leaderboards';
COMMENT ON TABLE activity_log IS 'Audit trail for all user actions';
COMMENT ON MATERIALIZED VIEW mv_top_scorers IS 'Materialized view of top scorers per group (refresh periodically)';
