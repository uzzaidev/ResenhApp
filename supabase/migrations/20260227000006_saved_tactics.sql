-- =====================================================
-- Migration: Saved Tactics
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Create system for saving tactical board configurations
-- =====================================================

-- =====================================================
-- SAVED TACTICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_tactics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  modality_id UUID NOT NULL REFERENCES sport_modalities(id) ON DELETE CASCADE,
  
  -- Basic info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Formation
  formation VARCHAR(20), -- e.g., "2-2", "1-2-1", "4-3-3"
  
  -- Field data (JSONB)
  -- Structure:
  -- {
  --   "teamA": [
  --     {"playerId": "uuid", "position": {"x": 10, "y": 48}, "label": "GK", "color": "#1ABC9C"}
  --   ],
  --   "teamB": [...],
  --   "drawings": [
  --     {"type": "line", "points": [[x1, y1], [x2, y2]], "color": "#1ABC9C", "width": 2}
  --   ]
  -- }
  field_data JSONB NOT NULL DEFAULT '{"teamA": [], "teamB": [], "drawings": []}'::jsonb,
  
  -- Settings
  is_public BOOLEAN DEFAULT FALSE, -- Can be shared with other groups
  is_template BOOLEAN DEFAULT FALSE, -- Is a template (can be reused)
  
  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saved_tactics_group_id ON saved_tactics(group_id);
CREATE INDEX idx_saved_tactics_modality_id ON saved_tactics(modality_id);
CREATE INDEX idx_saved_tactics_created_by ON saved_tactics(created_by);
CREATE INDEX idx_saved_tactics_public ON saved_tactics(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_saved_tactics_template ON saved_tactics(is_template) WHERE is_template = TRUE;
CREATE INDEX idx_saved_tactics_field_data ON saved_tactics USING GIN (field_data);

-- Comments
COMMENT ON TABLE saved_tactics IS 'Saved tactical board configurations';
COMMENT ON COLUMN saved_tactics.formation IS 'Formation identifier (e.g., "2-2", "1-2-1", "4-3-3")';
COMMENT ON COLUMN saved_tactics.field_data IS 'JSONB with team positions and drawings. Structure: {teamA: [], teamB: [], drawings: []}';
COMMENT ON COLUMN saved_tactics.is_public IS 'If true, can be shared with other groups';
COMMENT ON COLUMN saved_tactics.is_template IS 'If true, is a reusable template';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_tactics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saved_tactics_updated_at
  BEFORE UPDATE ON saved_tactics
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_tactics_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get tactics for a group
CREATE OR REPLACE FUNCTION get_group_tactics(
  p_group_id UUID,
  p_modality_id UUID DEFAULT NULL
)
  RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    description TEXT,
    formation VARCHAR(20),
    modality_id UUID,
    modality_name VARCHAR(50),
    is_public BOOLEAN,
    is_template BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
  ) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.name,
    st.description,
    st.formation,
    st.modality_id,
    sm.name AS modality_name,
    st.is_public,
    st.is_template,
    st.created_at,
    st.updated_at
  FROM saved_tactics st
  INNER JOIN sport_modalities sm ON st.modality_id = sm.id
  WHERE st.group_id = p_group_id
    AND (p_modality_id IS NULL OR st.modality_id = p_modality_id)
  ORDER BY st.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_group_tactics IS 'Get all tactics for a group, optionally filtered by modality';

-- Function: Get public tactics (templates)
CREATE OR REPLACE FUNCTION get_public_tactics(
  p_modality_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  description TEXT,
  formation VARCHAR(20),
    modality_id UUID,
    modality_name VARCHAR(50),
    group_id UUID,
    group_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.name,
    st.description,
    st.formation,
    st.modality_id,
    sm.name AS modality_name,
    st.group_id,
    g.name AS group_name,
    st.created_at
  FROM saved_tactics st
  INNER JOIN sport_modalities sm ON st.modality_id = sm.id
  INNER JOIN groups g ON st.group_id = g.id
  WHERE st.is_public = TRUE
    AND (p_modality_id IS NULL OR st.modality_id = p_modality_id)
  ORDER BY st.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_public_tactics IS 'Get public tactics (templates) that can be shared, optionally filtered by modality';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS get_public_tactics(UUID);
-- DROP FUNCTION IF EXISTS get_group_tactics(UUID, UUID);
-- DROP TRIGGER IF EXISTS trigger_update_saved_tactics_updated_at ON saved_tactics;
-- DROP FUNCTION IF EXISTS update_saved_tactics_updated_at();
-- DROP INDEX IF EXISTS idx_saved_tactics_field_data;
-- DROP INDEX IF EXISTS idx_saved_tactics_template;
-- DROP INDEX IF EXISTS idx_saved_tactics_public;
-- DROP INDEX IF EXISTS idx_saved_tactics_created_by;
-- DROP INDEX IF EXISTS idx_saved_tactics_modality_id;
-- DROP INDEX IF EXISTS idx_saved_tactics_group_id;
-- DROP TABLE IF EXISTS saved_tactics;

