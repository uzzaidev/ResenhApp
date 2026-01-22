-- =====================================================
-- Migration: Auth & Profiles
-- Version: 1.0
-- Date: 2026-01-27
-- Description: User profiles extending Supabase auth.users
-- =====================================================

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================

CREATE TABLE profiles (
  -- Primary key (references Supabase auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Unique code for user (P-00123)
  code TEXT UNIQUE NOT NULL,

  -- Basic info
  full_name TEXT,
  display_name TEXT,
  nickname TEXT,
  bio TEXT,
  avatar_url TEXT, -- Supabase Storage: avatars bucket

  -- =====================================================
  -- CRITICAL: USER TYPE SYSTEM
  -- =====================================================

  -- Platform role (player, organizer, admin, super_admin)
  platform_role platform_role_type NOT NULL DEFAULT 'player',

  -- Generated columns for permissions
  can_create_groups BOOLEAN GENERATED ALWAYS AS (
    platform_role IN ('organizer', 'admin', 'super_admin')
  ) STORED,

  can_manage_platform BOOLEAN GENERATED ALWAYS AS (
    platform_role IN ('admin', 'super_admin')
  ) STORED,

  -- =====================================================
  -- MULTI-GROUP MANAGEMENT
  -- =====================================================

  -- Track how many groups user owns/manages
  total_groups_owned INTEGER DEFAULT 0,
  total_groups_member INTEGER DEFAULT 0,

  -- Player preferences
  preferred_position player_position_type DEFAULT 'versatile',
  is_goalkeeper_capable BOOLEAN DEFAULT FALSE,

  -- Contact info
  phone TEXT,
  whatsapp TEXT,

  -- Geolocation (optional)
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',
  location GEOGRAPHY(POINT, 4326), -- PostGIS

  -- Notifications preferences
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": true,
    "whatsapp": false,
    "event_reminders": true,
    "payment_alerts": true,
    "achievement_notifications": true
  }'::jsonb,

  -- Privacy settings
  privacy_settings JSONB DEFAULT '{
    "profile_visibility": "public",
    "show_stats": true,
    "show_contact": false
  }'::jsonb,

  -- Platform metadata
  onboarding_completed BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
  CONSTRAINT valid_whatsapp CHECK (whatsapp IS NULL OR whatsapp ~ '^\+?[1-9]\d{1,14}$')
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_code ON profiles(code);
CREATE INDEX idx_profiles_platform_role ON profiles(platform_role);
CREATE INDEX idx_profiles_can_create_groups ON profiles(can_create_groups) WHERE can_create_groups = TRUE;
CREATE INDEX idx_profiles_full_name_trgm ON profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_profiles_display_name_trgm ON profiles USING GIN (display_name gin_trgm_ops);
CREATE INDEX idx_profiles_location ON profiles USING GIST (location) WHERE location IS NOT NULL;
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- USER_ROLES TABLE (granular permissions)
-- =====================================================

CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role details
  role_name TEXT NOT NULL,
  role_description TEXT,

  -- Permissions (JSONB for flexibility)
  permissions JSONB DEFAULT '{}'::jsonb,

  -- Scope (platform-wide or specific resource)
  scope TEXT DEFAULT 'platform', -- 'platform', 'group', 'event'
  scope_id BIGINT, -- Reference to specific group/event if scoped

  -- Timestamps
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,

  -- Soft delete
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES profiles(id),

  UNIQUE(user_id, role_name, scope, scope_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_scope ON user_roles(scope, scope_id);
CREATE INDEX idx_user_roles_active ON user_roles(revoked_at) WHERE revoked_at IS NULL;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate unique user code (P-00001, P-00002, etc.)
CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_code TEXT;
BEGIN
  -- Get next number from sequence
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM profiles
  WHERE code ~ '^P-\d+$';

  -- Format as P-XXXXX (5 digits)
  new_code := 'P-' || LPAD(next_num::TEXT, 5, '0');

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate code before insert
CREATE OR REPLACE FUNCTION trigger_generate_user_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_user_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_profile_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_user_code();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_profile_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Check if user is organizer or higher
CREATE OR REPLACE FUNCTION is_organizer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND platform_role IN ('organizer', 'admin', 'super_admin')
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin or higher
CREATE OR REPLACE FUNCTION is_platform_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND platform_role IN ('admin', 'super_admin')
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with multi-group management';
COMMENT ON COLUMN profiles.platform_role IS 'User role at platform level (player, organizer, admin, super_admin)';
COMMENT ON COLUMN profiles.can_create_groups IS 'Generated: TRUE if user can create groups (organizer+)';
COMMENT ON COLUMN profiles.can_manage_platform IS 'Generated: TRUE if user can manage platform (admin+)';
COMMENT ON COLUMN profiles.total_groups_owned IS 'Counter: number of groups user owns';
COMMENT ON COLUMN profiles.total_groups_member IS 'Counter: number of groups user is member of';

COMMENT ON TABLE user_roles IS 'Granular permissions system for custom roles';
COMMENT ON COLUMN user_roles.scope IS 'Permission scope: platform, group, or event';
COMMENT ON COLUMN user_roles.permissions IS 'JSONB object with specific permissions';
