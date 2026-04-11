-- =====================================================
-- Migration: Phase 4 - Social core
-- Date: 2026-03-01
-- Description: base schema for social feed, reactions, comments and reports
-- =====================================================

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NULL REFERENCES groups(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('training_photo', 'match_result', 'achievement', 'milestone', 'text_update')),
  content TEXT,
  media_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  event_id UUID NULL REFERENCES events(id) ON DELETE SET NULL,
  privacy TEXT NOT NULL DEFAULT 'group' CHECK (privacy IN ('public', 'atletica', 'group', 'private')),
  credits_pending BOOLEAN NOT NULL DEFAULT TRUE,
  credits_awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS social_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'fire', 'goal', 'awesome')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID NULL REFERENCES social_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(trim(content)) >= 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS social_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  comment_id UUID NULL REFERENCES social_comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (length(trim(reason)) >= 3),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID NULL REFERENCES users(id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_social_posts_group_created
  ON social_posts (group_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_social_posts_author_created
  ON social_posts (author_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_social_reactions_post
  ON social_reactions (post_id);

CREATE INDEX IF NOT EXISTS idx_social_comments_post
  ON social_comments (post_id, created_at ASC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_social_reports_status
  ON social_reports (status, created_at DESC);
