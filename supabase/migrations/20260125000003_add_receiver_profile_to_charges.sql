-- =====================================================
-- Migration: Add receiver_profile_id to charges
-- Version: 1.0
-- Date: 2026-01-25
-- Description: Add receiver_profile_id to charges table for Pix payments
-- Sprint 2: RSVP → Charge Automática
-- =====================================================

-- Add receiver_profile_id column to charges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'charges' AND column_name = 'receiver_profile_id'
  ) THEN
    ALTER TABLE charges 
    ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_charges_receiver_profile ON charges(receiver_profile_id) 
WHERE receiver_profile_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN charges.receiver_profile_id IS 'Who receives the payment (receiver profile for Pix)';

