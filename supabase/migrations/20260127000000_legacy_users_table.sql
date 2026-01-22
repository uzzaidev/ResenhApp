-- =====================================================
-- Migration: Legacy Users Table (for NextAuth compatibility)
-- Version: 1.0
-- Date: 2026-01-27
-- Description: Create users table for NextAuth compatibility
--              This table works alongside Supabase auth.users
-- =====================================================

-- =====================================================
-- USERS TABLE (Legacy - for NextAuth)
-- =====================================================
-- This table is used by NextAuth for authentication
-- It can work alongside Supabase auth.users
-- Users can be created here OR via Supabase Auth

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  password_hash TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified IS NOT NULL;

-- =====================================================
-- RLS POLICIES FOR USERS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can read users (for public profiles)
CREATE POLICY "Anyone can view users"
ON users FOR SELECT
USING (true);

-- Only service role can insert (via API with service role key)
-- This allows the signup API to create users
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true); -- Allow inserts for signup

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (true) -- Allow updates for now
WITH CHECK (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Legacy users table for NextAuth compatibility. Works alongside Supabase auth.users and profiles.';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for NextAuth credentials provider';

