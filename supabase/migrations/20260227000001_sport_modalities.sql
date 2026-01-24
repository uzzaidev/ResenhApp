-- =====================================================
-- Migration: Sport Modalities
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Create sport_modalities table for managing multiple sport modalities per group
-- =====================================================

-- =====================================================
-- SPORT MODALITIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sport_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50), -- Icon identifier (e.g., 'futsal', 'volleyball', 'basketball')
  color VARCHAR(7), -- Hex color code (e.g., '#1ABC9C')
  
  -- Group relationship
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  
  -- Configuration
  positions JSONB DEFAULT '[]'::jsonb, -- Array of position names for this modality
  trainings_per_week INTEGER DEFAULT 1 CHECK (trainings_per_week >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(group_id, name),
  CONSTRAINT valid_trainings_per_week CHECK (trainings_per_week >= 0)
);

-- Indexes
CREATE INDEX idx_sport_modalities_group_id ON sport_modalities(group_id);
CREATE INDEX idx_sport_modalities_name ON sport_modalities(name);

-- Comments
COMMENT ON TABLE sport_modalities IS 'Sport modalities per group. Groups can have multiple modalities (Futsal, Vôlei, Basquete, etc.)';
COMMENT ON COLUMN sport_modalities.positions IS 'JSONB array of position names. Example: ["GK", "Defender", "Midfielder", "Forward"]';
COMMENT ON COLUMN sport_modalities.trainings_per_week IS 'Default number of trainings per week for this modality';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sport_modalities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sport_modalities_updated_at
  BEFORE UPDATE ON sport_modalities
  FOR EACH ROW
  EXECUTE FUNCTION update_sport_modalities_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get modalities for a group
CREATE OR REPLACE FUNCTION get_group_modalities(p_group_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(50),
  icon VARCHAR(50),
  color VARCHAR(7),
  positions JSONB,
  trainings_per_week INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.name,
    sm.icon,
    sm.color,
    sm.positions,
    sm.trainings_per_week,
    sm.created_at
  FROM sport_modalities sm
  WHERE sm.group_id = p_group_id
  ORDER BY sm.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_group_modalities IS 'Get all modalities for a specific group';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS get_group_modalities(UUID);
-- DROP TRIGGER IF EXISTS trigger_update_sport_modalities_updated_at ON sport_modalities;
-- DROP FUNCTION IF EXISTS update_sport_modalities_updated_at();
-- DROP INDEX IF EXISTS idx_sport_modalities_group_active;
-- DROP INDEX IF EXISTS idx_sport_modalities_name;
-- DROP INDEX IF EXISTS idx_sport_modalities_group_id;
-- DROP TABLE IF EXISTS sport_modalities;

