-- =====================================================
-- Migration: Groups and Events (Core Schema)
-- Version: 1.0
-- Date: 2026-01-27
-- Description: Core tables for groups, events, teams, and attendance
-- =====================================================

-- =====================================================
-- GROUPS TABLE
-- =====================================================

CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- G-001, G-002, etc.

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT, -- Supabase Storage: group-photos bucket
  cover_url TEXT,

  -- Sport modality
  sport_modality sport_modality_type NOT NULL DEFAULT 'futsal',

  -- Privacy
  privacy event_privacy_type NOT NULL DEFAULT 'private',
  is_active BOOLEAN DEFAULT TRUE,

  -- Ownership (CRITICAL: single owner per group)
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Settings
  default_event_duration INTEGER DEFAULT 90, -- minutes
  default_max_players INTEGER DEFAULT 10,
  default_max_goalkeepers INTEGER DEFAULT 2,

  -- Draw configuration
  draw_config JSONB DEFAULT '{
    "balance_by": "rating",
    "separate_goalkeepers": true,
    "allow_manual_swap": true
  }'::jsonb,

  -- Geolocation
  city TEXT,
  state TEXT,
  location GEOGRAPHY(POINT, 4326),

  -- Counters (updated by triggers)
  total_members INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_events_completed INTEGER DEFAULT 0,

  -- Financial
  wallet_id BIGINT, -- References wallets table (created later)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_max_players CHECK (default_max_players > 0),
  CONSTRAINT valid_max_goalkeepers CHECK (default_max_goalkeepers >= 0)
);

-- Indexes
CREATE INDEX idx_groups_code ON groups(code);
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_sport_modality ON groups(sport_modality);
CREATE INDEX idx_groups_is_active ON groups(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_groups_name_trgm ON groups USING GIN (name gin_trgm_ops);
CREATE INDEX idx_groups_location ON groups USING GIST (location) WHERE location IS NOT NULL;
CREATE INDEX idx_groups_deleted_at ON groups(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- GROUP_MEMBERS TABLE
-- =====================================================

CREATE TABLE group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role in group
  role group_role_type NOT NULL DEFAULT 'member',

  -- Permissions (JSONB for flexibility)
  permissions JSONB DEFAULT '{
    "manage_events": false,
    "manage_members": false,
    "manage_finances": false,
    "send_notifications": false
  }'::jsonb,

  -- Player preferences in this group
  is_goalkeeper BOOLEAN DEFAULT FALSE,
  base_rating DECIMAL(4, 2) DEFAULT 50.00, -- 0-100 scale

  -- Membership info
  nickname_in_group TEXT, -- Optional nickname specific to this group
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES profiles(id),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  left_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_id, user_id),
  CONSTRAINT valid_base_rating CHECK (base_rating >= 0 AND base_rating <= 100)
);

-- Indexes
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);
CREATE INDEX idx_group_members_is_active ON group_members(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_group_members_is_goalkeeper ON group_members(is_goalkeeper) WHERE is_goalkeeper = TRUE;

-- =====================================================
-- INVITES TABLE
-- =====================================================

CREATE TABLE invites (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Invite code (unique, shareable)
  code TEXT UNIQUE NOT NULL, -- INV-ABC123

  -- Created by
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Limits
  max_uses INTEGER, -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_max_uses CHECK (max_uses IS NULL OR max_uses > 0)
);

-- Indexes
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_group_id ON invites(group_id);
CREATE INDEX idx_invites_is_active ON invites(is_active) WHERE is_active = TRUE;

-- =====================================================
-- VENUES TABLE
-- =====================================================

CREATE TABLE venues (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL,

  -- Venue info
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- Geolocation
  location GEOGRAPHY(POINT, 4326), -- lat, lng

  -- Contact
  phone TEXT,
  website TEXT,

  -- Photos
  photo_url TEXT, -- Supabase Storage: venue-photos bucket
  photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs

  -- Details
  surface_type TEXT, -- grass, synthetic, indoor, etc.
  has_lighting BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  has_locker_room BOOLEAN DEFAULT FALSE,
  capacity INTEGER,

  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_venues_group_id ON venues(group_id);
CREATE INDEX idx_venues_name_trgm ON venues USING GIN (name gin_trgm_ops);
CREATE INDEX idx_venues_location ON venues USING GIST (location) WHERE location IS NOT NULL;
CREATE INDEX idx_venues_is_active ON venues(is_active) WHERE is_active = TRUE;

-- =====================================================
-- EVENTS TABLE
-- =====================================================

CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- E-2026-001
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 90, -- minutes
  end_time TIME, -- Calculated: time + duration (use trigger or application logic)

  -- Location
  venue_id BIGINT REFERENCES venues(id) ON DELETE SET NULL,
  location_name TEXT, -- Fallback if no venue
  location_address TEXT,

  -- Capacity
  max_players INTEGER NOT NULL DEFAULT 10,
  max_goalkeepers INTEGER DEFAULT 2,
  confirmed_count INTEGER DEFAULT 0, -- Updated by trigger
  waitlist_count INTEGER DEFAULT 0,   -- Updated by trigger

  -- Pricing
  cost_per_player DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')
  ),
  is_teams_drawn BOOLEAN DEFAULT FALSE,

  -- Privacy
  privacy event_privacy_type NOT NULL DEFAULT 'private',

  -- RSVP settings
  rsvp_deadline TIMESTAMPTZ,
  allow_waitlist BOOLEAN DEFAULT TRUE,
  auto_confirm_from_waitlist BOOLEAN DEFAULT TRUE,

  -- Created by
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_max_players CHECK (max_players > 0),
  CONSTRAINT valid_duration CHECK (duration > 0),
  CONSTRAINT valid_costs CHECK (
    (cost_per_player IS NULL AND total_cost IS NULL) OR
    (cost_per_player >= 0 AND total_cost >= 0)
  )
);

-- Indexes
CREATE INDEX idx_events_code ON events(code);
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_datetime ON events(date, time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_deleted_at ON events(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- EVENT_ATTENDANCE TABLE (RSVP)
-- =====================================================

CREATE TABLE event_attendance (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- RSVP status
  status rsvp_status_type NOT NULL DEFAULT 'yes',

  -- Goalkeeper preference for this event
  attending_as_goalkeeper BOOLEAN DEFAULT FALSE,

  -- Waitlist tracking
  order_of_arrival INTEGER, -- For fairness when moving from waitlist

  -- Check-in (day of event)
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,

  -- Payment tracking
  has_paid BOOLEAN DEFAULT FALSE,
  paid_amount DECIMAL(10, 2),
  paid_at TIMESTAMPTZ,

  -- Response time tracking
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_minutes INTEGER, -- How quickly user responded to invite

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX idx_event_attendance_user_id ON event_attendance(user_id);
CREATE INDEX idx_event_attendance_status ON event_attendance(status);
CREATE INDEX idx_event_attendance_checked_in ON event_attendance(checked_in) WHERE checked_in = TRUE;
CREATE INDEX idx_event_attendance_has_paid ON event_attendance(has_paid);
CREATE INDEX idx_event_attendance_waitlist ON event_attendance(order_of_arrival) WHERE status = 'waitlist';

-- =====================================================
-- TEAMS TABLE
-- =====================================================

CREATE TABLE teams (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Team info
  name TEXT NOT NULL, -- "Time 1", "Time 2", "Azul", "Vermelho", etc.
  color TEXT, -- Hex color code (#FF0000)
  number INTEGER, -- 1, 2, 3, etc.

  -- Final score (updated after match)
  score INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, number)
);

-- Indexes
CREATE INDEX idx_teams_event_id ON teams(event_id);

-- =====================================================
-- TEAM_MEMBERS TABLE
-- =====================================================

CREATE TABLE team_members (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Position in team
  is_goalkeeper BOOLEAN DEFAULT FALSE,
  position player_position_type,

  -- Formation position (for tactical lineup)
  formation_position INTEGER, -- 1-11 or custom

  -- Captain/leadership
  is_captain BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, user_id),
  UNIQUE(event_id, user_id) -- Player can only be in one team per event
);

-- Indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_event_id ON team_members(event_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_is_goalkeeper ON team_members(is_goalkeeper) WHERE is_goalkeeper = TRUE;

-- =====================================================
-- EVENT_ACTIONS TABLE (goals, assists, cards, etc.)
-- =====================================================

CREATE TABLE event_actions (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Action details
  action_type event_action_type NOT NULL,

  -- Related users (e.g., who assisted the goal)
  assisted_by UUID REFERENCES profiles(id),

  -- Timing
  minute INTEGER, -- Minute of the game when action occurred
  period TEXT DEFAULT '1st', -- '1st', '2nd', 'extra', 'penalty'

  -- Context
  description TEXT,
  video_url TEXT,

  -- Recorded by
  recorded_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_minute CHECK (minute IS NULL OR minute >= 0)
);

-- Indexes
CREATE INDEX idx_event_actions_event_id ON event_actions(event_id);
CREATE INDEX idx_event_actions_user_id ON event_actions(user_id);
CREATE INDEX idx_event_actions_team_id ON event_actions(team_id);
CREATE INDEX idx_event_actions_action_type ON event_actions(action_type);
CREATE INDEX idx_event_actions_assisted_by ON event_actions(assisted_by);

-- =====================================================
-- VOTES TABLE (player voting system)
-- =====================================================

CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voted_for_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Vote value (1-5 stars, or custom scale)
  vote_value INTEGER NOT NULL DEFAULT 1 CHECK (vote_value >= 1 AND vote_value <= 5),

  -- Category (optional)
  category TEXT, -- 'best_player', 'best_goalkeeper', 'mvp', etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, voter_id, voted_for_id, category),
  CONSTRAINT cannot_vote_self CHECK (voter_id != voted_for_id)
);

-- Indexes
CREATE INDEX idx_votes_event_id ON votes(event_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_voted_for_id ON votes(voted_for_id);
CREATE INDEX idx_votes_category ON votes(category);

-- =====================================================
-- TRIGGER: Calculate end_time automatically
-- =====================================================

-- Function to calculate end_time
CREATE OR REPLACE FUNCTION calculate_event_end_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate end_time = time + duration minutes
  IF NEW.time IS NOT NULL AND NEW.duration IS NOT NULL THEN
    NEW.end_time := (NEW.time + (NEW.duration || ' minutes')::INTERVAL)::TIME;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate end_time
CREATE TRIGGER trigger_calculate_event_end_time
BEFORE INSERT OR UPDATE OF time, duration ON events
FOR EACH ROW
EXECUTE FUNCTION calculate_event_end_time();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE groups IS 'Soccer groups managed by organizers';
COMMENT ON TABLE group_members IS 'Group membership with roles and permissions';
COMMENT ON TABLE invites IS 'Group invitation codes';
COMMENT ON TABLE venues IS 'Match locations/venues';
COMMENT ON TABLE events IS 'Scheduled matches/events';
COMMENT ON TABLE event_attendance IS 'RSVP system with waitlist support';
COMMENT ON TABLE teams IS 'Drawn teams per event';
COMMENT ON TABLE team_members IS 'Players assigned to teams';
COMMENT ON TABLE event_actions IS 'In-game actions (goals, assists, cards)';
COMMENT ON TABLE votes IS 'Player voting/rating system';
