-- =====================================================
-- Migration: Row Level Security (RLS) Policies
-- Version: 1.0
-- Date: 2026-01-27
-- Description: Comprehensive RLS policies for all tables
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Check if user is group owner
CREATE OR REPLACE FUNCTION is_group_owner(user_id UUID, group_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_id_param
    AND created_by = user_id
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is group admin (owner or admin role)
CREATE OR REPLACE FUNCTION is_group_admin(user_id UUID, group_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND user_id = user_id
    AND role IN ('owner', 'admin')
    AND is_active = TRUE
  ) OR is_group_owner(user_id, group_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is group member (any role, active)
CREATE OR REPLACE FUNCTION is_group_member(user_id UUID, group_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND user_id = user_id
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can create groups (organizer+)
CREATE OR REPLACE FUNCTION can_create_groups(user_id UUID)
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

-- Check if user has platform access (admin+)
CREATE OR REPLACE FUNCTION has_platform_access(user_id UUID)
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

-- Check if user has group permission
CREATE OR REPLACE FUNCTION has_group_permission(
  user_id UUID,
  group_id_param BIGINT,
  permission_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Owners and platform admins have all permissions
  IF is_group_owner(user_id, group_id_param) OR has_platform_access(user_id) THEN
    RETURN TRUE;
  END IF;

  -- Check specific permission in JSONB
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND user_id = user_id
    AND is_active = TRUE
    AND (permissions->permission_name)::BOOLEAN = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (
  deleted_at IS NULL
  AND (privacy_settings->>'profile_visibility' = 'public' OR id = auth.uid())
);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Users can insert own profile (during signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Platform admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (has_platform_access(auth.uid()));

-- =====================================================
-- USER_ROLES POLICIES
-- =====================================================

-- Users can view own roles
CREATE POLICY "Users can view own roles"
ON user_roles FOR SELECT
USING (user_id = auth.uid());

-- Platform admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON user_roles FOR ALL
USING (has_platform_access(auth.uid()));

-- =====================================================
-- GROUPS POLICIES
-- =====================================================

-- Organizers can create groups
CREATE POLICY "Organizers can create groups"
ON groups FOR INSERT
WITH CHECK (
  can_create_groups(auth.uid())
  AND created_by = auth.uid()
);

-- Anyone can view public/active groups
CREATE POLICY "Public groups are viewable"
ON groups FOR SELECT
USING (
  deleted_at IS NULL
  AND is_active = TRUE
  AND (
    privacy = 'public'
    OR is_group_member(auth.uid(), id)
    OR has_platform_access(auth.uid())
  )
);

-- Owners and admins can update groups
CREATE POLICY "Owners and admins can update groups"
ON groups FOR UPDATE
USING (
  is_group_admin(auth.uid(), id)
  OR has_platform_access(auth.uid())
);

-- Only owners can delete groups
CREATE POLICY "Owners can delete groups"
ON groups FOR DELETE
USING (
  is_group_owner(auth.uid(), id)
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- GROUP_MEMBERS POLICIES
-- =====================================================

-- Group members can view other members
CREATE POLICY "Group members can view members"
ON group_members FOR SELECT
USING (
  is_group_member(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Admins can add members
CREATE POLICY "Admins can add members"
ON group_members FOR INSERT
WITH CHECK (
  is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Admins can update members
CREATE POLICY "Admins can update members"
ON group_members FOR UPDATE
USING (
  is_group_admin(auth.uid(), group_id)
  OR user_id = auth.uid() -- Users can update own membership
  OR has_platform_access(auth.uid())
);

-- Admins can remove members
CREATE POLICY "Admins can remove members"
ON group_members FOR DELETE
USING (
  is_group_admin(auth.uid(), group_id)
  OR user_id = auth.uid() -- Users can leave group
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- INVITES POLICIES
-- =====================================================

-- Anyone can view active invites (to join groups)
CREATE POLICY "Active invites are viewable"
ON invites FOR SELECT
USING (
  is_active = TRUE
  AND (expires_at IS NULL OR expires_at > NOW())
  AND (max_uses IS NULL OR uses_count < max_uses)
);

-- Admins can create invites
CREATE POLICY "Admins can create invites"
ON invites FOR INSERT
WITH CHECK (
  has_group_permission(auth.uid(), group_id, 'manage_members')
  OR has_platform_access(auth.uid())
);

-- Creators and admins can update invites
CREATE POLICY "Creators can update invites"
ON invites FOR UPDATE
USING (
  created_by = auth.uid()
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Creators and admins can delete invites
CREATE POLICY "Creators can delete invites"
ON invites FOR DELETE
USING (
  created_by = auth.uid()
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- VENUES POLICIES
-- =====================================================

-- Group members can view group venues
CREATE POLICY "Group members can view venues"
ON venues FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    group_id IS NULL -- Public venues
    OR is_group_member(auth.uid(), group_id)
    OR has_platform_access(auth.uid())
  )
);

-- Group admins can create venues
CREATE POLICY "Admins can create venues"
ON venues FOR INSERT
WITH CHECK (
  group_id IS NULL -- Anyone can create public venues
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Group admins can update venues
CREATE POLICY "Admins can update venues"
ON venues FOR UPDATE
USING (
  group_id IS NULL
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Group admins can delete venues
CREATE POLICY "Admins can delete venues"
ON venues FOR DELETE
USING (
  group_id IS NULL
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- EVENTS POLICIES
-- =====================================================

-- Group members can view group events
CREATE POLICY "Group members can view events"
ON events FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    privacy = 'public'
    OR is_group_member(auth.uid(), group_id)
    OR has_platform_access(auth.uid())
  )
);

-- Users with permission can create events
CREATE POLICY "Authorized users can create events"
ON events FOR INSERT
WITH CHECK (
  (
    has_group_permission(auth.uid(), group_id, 'manage_events')
    OR is_group_admin(auth.uid(), group_id)
  )
  AND created_by = auth.uid()
);

-- Creators and admins can update events
CREATE POLICY "Creators and admins can update events"
ON events FOR UPDATE
USING (
  created_by = auth.uid()
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Creators and admins can delete events
CREATE POLICY "Creators and admins can delete events"
ON events FOR DELETE
USING (
  created_by = auth.uid()
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- EVENT_ATTENDANCE POLICIES
-- =====================================================

-- Users can view attendance for events they can see
CREATE POLICY "Users can view event attendance"
ON event_attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendance.event_id
    AND (
      events.privacy = 'public'
      OR is_group_member(auth.uid(), events.group_id)
    )
  )
);

-- Users can RSVP to events
CREATE POLICY "Users can RSVP to events"
ON event_attendance FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND is_group_member(auth.uid(), group_id)
);

-- Users can update own RSVP
CREATE POLICY "Users can update own RSVP"
ON event_attendance FOR UPDATE
USING (
  user_id = auth.uid()
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Users can delete own RSVP
CREATE POLICY "Users can delete own RSVP"
ON event_attendance FOR DELETE
USING (
  user_id = auth.uid()
  OR is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- TEAMS POLICIES
-- =====================================================

-- Users can view teams for events they can see
CREATE POLICY "Users can view teams"
ON teams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = teams.event_id
    AND (
      events.privacy = 'public'
      OR is_group_member(auth.uid(), events.group_id)
    )
  )
);

-- Event creators and admins can create teams
CREATE POLICY "Admins can create teams"
ON teams FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_id
    AND (
      events.created_by = auth.uid()
      OR is_group_admin(auth.uid(), events.group_id)
    )
  )
);

-- Event creators and admins can update teams
CREATE POLICY "Admins can update teams"
ON teams FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_id
    AND (
      events.created_by = auth.uid()
      OR is_group_admin(auth.uid(), events.group_id)
    )
  )
);

-- =====================================================
-- TEAM_MEMBERS POLICIES
-- =====================================================

-- Users can view team members for events they can see
CREATE POLICY "Users can view team members"
ON team_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = team_members.event_id
    AND (
      events.privacy = 'public'
      OR is_group_member(auth.uid(), events.group_id)
    )
  )
);

-- Event creators and admins can assign team members
CREATE POLICY "Admins can manage team members"
ON team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = team_members.event_id
    AND (
      events.created_by = auth.uid()
      OR is_group_admin(auth.uid(), events.group_id)
    )
  )
);

-- =====================================================
-- EVENT_ACTIONS POLICIES
-- =====================================================

-- Users can view actions for events they can see
CREATE POLICY "Users can view event actions"
ON event_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_actions.event_id
    AND (
      events.privacy = 'public'
      OR is_group_member(auth.uid(), events.group_id)
    )
  )
);

-- Group members can record actions
CREATE POLICY "Members can record actions"
ON event_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_id
    AND is_group_member(auth.uid(), events.group_id)
  )
);

-- Recorders and admins can update actions
CREATE POLICY "Recorders can update actions"
ON event_actions FOR UPDATE
USING (
  recorded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_actions.event_id
    AND is_group_admin(auth.uid(), events.group_id)
  )
);

-- Recorders and admins can delete actions
CREATE POLICY "Recorders can delete actions"
ON event_actions FOR DELETE
USING (
  recorded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_actions.event_id
    AND is_group_admin(auth.uid(), events.group_id)
  )
);

-- =====================================================
-- VOTES POLICIES
-- =====================================================

-- Users can view votes for events they participated in
CREATE POLICY "Users can view votes"
ON votes FOR SELECT
USING (
  voter_id = auth.uid()
  OR voted_for_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM events
    WHERE events.id = votes.event_id
    AND is_group_admin(auth.uid(), events.group_id)
  )
);

-- Users can vote on events they attended
CREATE POLICY "Users can vote"
ON votes FOR INSERT
WITH CHECK (
  voter_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM event_attendance
    WHERE event_attendance.event_id = votes.event_id
    AND event_attendance.user_id = auth.uid()
    AND event_attendance.checked_in = TRUE
  )
);

-- Users can update own votes
CREATE POLICY "Users can update own votes"
ON votes FOR UPDATE
USING (voter_id = auth.uid());

-- Users can delete own votes
CREATE POLICY "Users can delete own votes"
ON votes FOR DELETE
USING (voter_id = auth.uid());

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION is_group_owner IS 'Check if user is the owner of a group';
COMMENT ON FUNCTION is_group_admin IS 'Check if user is owner or admin of a group';
COMMENT ON FUNCTION is_group_member IS 'Check if user is an active member of a group';
COMMENT ON FUNCTION can_create_groups IS 'Check if user can create groups (organizer+)';
COMMENT ON FUNCTION has_platform_access IS 'Check if user has platform-level access (admin+)';
COMMENT ON FUNCTION has_group_permission IS 'Check if user has specific permission in a group';
