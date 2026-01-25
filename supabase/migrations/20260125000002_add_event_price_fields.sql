-- =====================================================
-- Migration: Add Price Fields to Events
-- Version: 1.0
-- Date: 2026-01-25
-- Description: Add price, receiver_profile_id, and auto_charge_on_rsvp to events table
-- Sprint 2: RSVP → Charge Automática
-- =====================================================

-- =====================================================
-- ADD COLUMNS TO EVENTS TABLE
-- =====================================================

-- Add price column (DECIMAL(10,2))
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'price'
  ) THEN
    ALTER TABLE events ADD COLUMN price DECIMAL(10,2);
  END IF;
END $$;

-- Add receiver_profile_id column (UUID, references receiver_profiles)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'receiver_profile_id'
  ) THEN
    ALTER TABLE events 
    ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add auto_charge_on_rsvp column (BOOLEAN, default true)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'auto_charge_on_rsvp'
  ) THEN
    ALTER TABLE events 
    ADD COLUMN auto_charge_on_rsvp BOOLEAN DEFAULT true;
  END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for events with price > 0 (for queries filtering paid events)
CREATE INDEX IF NOT EXISTS idx_events_price ON events(price) WHERE price > 0;

-- Index for receiver_profile_id
CREATE INDEX IF NOT EXISTS idx_events_receiver_profile ON events(receiver_profile_id) 
WHERE receiver_profile_id IS NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN events.price IS 'Price per athlete for this event (null if free)';
COMMENT ON COLUMN events.receiver_profile_id IS 'Who receives the payment (receiver profile)';
COMMENT ON COLUMN events.auto_charge_on_rsvp IS 'Automatically create charge when athlete confirms RSVP';

