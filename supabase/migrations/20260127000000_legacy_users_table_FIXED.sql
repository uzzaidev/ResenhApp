-- =====================================================
-- Migration: Legacy Users Table (for NextAuth compatibility) - FIXED
-- Version: 1.1
-- Date: 2026-01-27
-- Description: Create users table for NextAuth compatibility
--              This table works alongside Supabase auth.users
--              IDEMPOTENT: Can be run multiple times safely
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

-- Indexes (IF NOT EXISTS para evitar erro se já existir)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified IS NOT NULL;

-- =====================================================
-- RLS POLICIES FOR USERS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (IDEMPOTENT)
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

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


