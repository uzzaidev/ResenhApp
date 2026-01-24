-- =====================================================
-- Migration: Athlete Modalities (Many-to-Many)
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Create athlete_modalities table for athletes participating in multiple modalities
-- =====================================================

-- =====================================================
-- ATHLETE MODALITIES TABLE (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS athlete_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  modality_id UUID NOT NULL REFERENCES sport_modalities(id) ON DELETE CASCADE,
  
  -- Position preferences
  preferred_position VARCHAR(50), -- Primary position in this modality
  secondary_position VARCHAR(50), -- Secondary position (optional)
  
  -- Rating
  base_rating INTEGER DEFAULT 5 CHECK (base_rating >= 1 AND base_rating <= 10),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, modality_id),
  CONSTRAINT valid_base_rating CHECK (base_rating >= 1 AND base_rating <= 10)
);

-- Indexes
CREATE INDEX idx_athlete_modalities_user_id ON athlete_modalities(user_id);
CREATE INDEX idx_athlete_modalities_modality_id ON athlete_modalities(modality_id);
CREATE INDEX idx_athlete_modalities_active ON athlete_modalities(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_athlete_modalities_user_active ON athlete_modalities(user_id, is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE athlete_modalities IS 'Many-to-many relationship: athletes can participate in multiple sport modalities';
COMMENT ON COLUMN athlete_modalities.preferred_position IS 'Primary position in this modality (e.g., "GK", "Forward", "Setter")';
COMMENT ON COLUMN athlete_modalities.secondary_position IS 'Secondary position (optional)';
COMMENT ON COLUMN athlete_modalities.base_rating IS 'Base rating (1-10) for this athlete in this modality';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_athlete_modalities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_athlete_modalities_updated_at
  BEFORE UPDATE ON athlete_modalities
  FOR EACH ROW
  EXECUTE FUNCTION update_athlete_modalities_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get modalities for an athlete
CREATE OR REPLACE FUNCTION get_athlete_modalities(p_user_id UUID)
RETURNS TABLE (
  modality_id UUID,
  modality_name VARCHAR(50),
  preferred_position VARCHAR(50),
  secondary_position VARCHAR(50),
  base_rating INTEGER,
  is_active BOOLEAN,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.modality_id,
    sm.name AS modality_name,
    am.preferred_position,
    am.secondary_position,
    am.base_rating,
    am.is_active,
    am.joined_at
  FROM athlete_modalities am
  INNER JOIN sport_modalities sm ON am.modality_id = sm.id
  WHERE am.user_id = p_user_id
    AND am.is_active = TRUE
  ORDER BY sm.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_athlete_modalities IS 'Get all active modalities for a specific athlete';

-- Function: Get athletes for a modality
CREATE OR REPLACE FUNCTION get_modality_athletes(p_modality_id UUID)
RETURNS TABLE (
  user_id UUID,
  preferred_position VARCHAR(50),
  secondary_position VARCHAR(50),
  base_rating INTEGER,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.user_id,
    am.preferred_position,
    am.secondary_position,
    am.base_rating,
    am.joined_at
  FROM athlete_modalities am
  WHERE am.modality_id = p_modality_id
    AND am.is_active = TRUE
  ORDER BY am.base_rating DESC, am.joined_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_modality_athletes IS 'Get all active athletes for a specific modality';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS get_modality_athletes(UUID);
-- DROP FUNCTION IF EXISTS get_athlete_modalities(UUID);
-- DROP TRIGGER IF EXISTS trigger_update_athlete_modalities_updated_at ON athlete_modalities;
-- DROP FUNCTION IF EXISTS update_athlete_modalities_updated_at();
-- DROP INDEX IF EXISTS idx_athlete_modalities_user_active;
-- DROP INDEX IF EXISTS idx_athlete_modalities_active;
-- DROP INDEX IF EXISTS idx_athlete_modalities_modality_id;
-- DROP INDEX IF EXISTS idx_athlete_modalities_user_id;
-- DROP TABLE IF EXISTS athlete_modalities;

