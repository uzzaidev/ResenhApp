-- =====================================================
-- Migration: Receiver Profiles
-- Version: 1.0
-- Date: 2026-01-25
-- Description: Create receiver_profiles table for Pix payment receivers
-- Sprint 2: RSVP → Charge Automática
-- =====================================================

-- =====================================================
-- RECEIVER_PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS receiver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type of receiver (institution or user)
  type TEXT NOT NULL CHECK (type IN ('institution', 'user')),
  
  -- Entity ID (institution_id or user_id)
  entity_id UUID NOT NULL,
  
  -- Pix Key details
  pix_key TEXT NOT NULL,
  pix_type TEXT NOT NULL CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  
  -- Display information
  name TEXT NOT NULL, -- Name to display on QR Code
  city TEXT NOT NULL, -- Required for static Pix
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(pix_key, pix_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receiver_profiles_entity ON receiver_profiles(type, entity_id);
CREATE INDEX IF NOT EXISTS idx_receiver_profiles_pix_key ON receiver_profiles(pix_key);

-- Comments
COMMENT ON TABLE receiver_profiles IS 'Pix payment receiver profiles (who receives payments)';
COMMENT ON COLUMN receiver_profiles.type IS 'Type: institution or user';
COMMENT ON COLUMN receiver_profiles.entity_id IS 'ID of the institution or user';
COMMENT ON COLUMN receiver_profiles.pix_key IS 'Pix key (CPF, CNPJ, email, phone, or random)';
COMMENT ON COLUMN receiver_profiles.pix_type IS 'Type of Pix key';
COMMENT ON COLUMN receiver_profiles.name IS 'Name to display on QR Code';
COMMENT ON COLUMN receiver_profiles.city IS 'City (required for static Pix)';

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE receiver_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view receiver profiles for their groups/institutions
CREATE POLICY "Users can view receiver profiles"
ON receiver_profiles FOR SELECT
USING (
  -- User can view their own profile
  (type = 'user' AND entity_id = auth.uid())
  -- Or if they are admin of a group/institution
  OR EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.user_id = auth.uid()
    AND gm.role = 'admin'
  )
);

-- Admins can create receiver profiles
CREATE POLICY "Admins can create receiver profiles"
ON receiver_profiles FOR INSERT
WITH CHECK (
  -- User can create their own profile
  (type = 'user' AND entity_id = auth.uid())
  -- Or if they are admin
  OR EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.user_id = auth.uid()
    AND gm.role = 'admin'
  )
);

-- Admins can update receiver profiles
CREATE POLICY "Admins can update receiver profiles"
ON receiver_profiles FOR UPDATE
USING (
  (type = 'user' AND entity_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.user_id = auth.uid()
    AND gm.role = 'admin'
  )
);

