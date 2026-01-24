-- =====================================================
-- Migration: Game Convocations
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Create system for official game convocations with position requirements
-- =====================================================

-- =====================================================
-- GAME CONVOCATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS game_convocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event relationship (one convocation per event)
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  
  -- Position requirements (JSONB)
  -- Example: {"GK": 1, "Defender": 4, "Midfielder": 4, "Forward": 2}
  required_positions JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  
  -- Additional info
  notes TEXT, -- Additional notes for the convocation
  deadline TIMESTAMPTZ, -- Deadline for responses
  
  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_game_convocations_event_id ON game_convocations(event_id);
CREATE INDEX idx_game_convocations_status ON game_convocations(status);
CREATE INDEX idx_game_convocations_created_at ON game_convocations(created_at DESC);
CREATE INDEX idx_game_convocations_required_positions ON game_convocations USING GIN (required_positions);

-- Comments
COMMENT ON TABLE game_convocations IS 'Official game convocations with position requirements';
COMMENT ON COLUMN game_convocations.required_positions IS 'JSONB object with position names as keys and required counts as values. Example: {"GK": 1, "Defender": 4}';
COMMENT ON COLUMN game_convocations.status IS 'Status: pending (waiting for responses), confirmed (enough players), cancelled';

-- =====================================================
-- CONVOCATION RESPONSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS convocation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  convocation_id UUID NOT NULL REFERENCES game_convocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Response
  response VARCHAR(20) DEFAULT 'pending' 
    CHECK (response IN ('confirmed', 'declined', 'pending')),
  
  -- Position preference
  position VARCHAR(50), -- Position the player wants to play
  
  -- Timestamps
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(convocation_id, user_id),
  CONSTRAINT valid_response CHECK (response IN ('confirmed', 'declined', 'pending'))
);

-- Indexes
CREATE INDEX idx_convocation_responses_convocation_id ON convocation_responses(convocation_id);
CREATE INDEX idx_convocation_responses_user_id ON convocation_responses(user_id);
CREATE INDEX idx_convocation_responses_response ON convocation_responses(response);
CREATE INDEX idx_convocation_responses_pending ON convocation_responses(convocation_id, response) WHERE response = 'pending';

-- Comments
COMMENT ON TABLE convocation_responses IS 'Player responses to game convocations';
COMMENT ON COLUMN convocation_responses.response IS 'Response: confirmed (will play), declined (will not play), pending (no response yet)';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at for game_convocations
CREATE OR REPLACE FUNCTION update_game_convocations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_game_convocations_updated_at
  BEFORE UPDATE ON game_convocations
  FOR EACH ROW
  EXECUTE FUNCTION update_game_convocations_updated_at();

-- Trigger: Update updated_at for convocation_responses
CREATE OR REPLACE FUNCTION update_convocation_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.response != 'pending' AND OLD.response = 'pending' THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_convocation_responses_updated_at
  BEFORE UPDATE ON convocation_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_convocation_responses_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get convocation statistics
CREATE OR REPLACE FUNCTION get_convocation_stats(p_convocation_id UUID)
RETURNS TABLE (
  total_required INTEGER,
  confirmed_count INTEGER,
  pending_count INTEGER,
  declined_count INTEGER,
  positions_filled JSONB,
  positions_needed JSONB
) AS $$
DECLARE
  required_positions_json JSONB;
  confirmed_positions JSONB := '{}'::jsonb;
  position_key TEXT;
  position_count INTEGER;
  confirmed_for_position INTEGER;
BEGIN
  -- Get required positions
  SELECT required_positions INTO required_positions_json
  FROM game_convocations
  WHERE id = p_convocation_id;
  
  IF required_positions_json IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculate total required
  SELECT SUM(value::INTEGER) INTO position_count
  FROM jsonb_each(required_positions_json);
  
  -- Count responses
  SELECT 
    COUNT(*) FILTER (WHERE response = 'confirmed'),
    COUNT(*) FILTER (WHERE response = 'pending'),
    COUNT(*) FILTER (WHERE response = 'declined')
  INTO 
    confirmed_count,
    pending_count,
    declined_count
  FROM convocation_responses
  WHERE convocation_id = p_convocation_id;
  
  -- Calculate positions filled
  FOR position_key, position_count IN SELECT * FROM jsonb_each(required_positions_json)
  LOOP
    SELECT COUNT(*) INTO confirmed_for_position
    FROM convocation_responses
    WHERE convocation_id = p_convocation_id
      AND response = 'confirmed'
      AND position = position_key;
    
    confirmed_positions := confirmed_positions || jsonb_build_object(position_key, confirmed_for_position);
  END LOOP;
  
  -- Calculate positions needed
  positions_needed := required_positions_json - confirmed_positions;
  
  RETURN QUERY SELECT
    COALESCE(position_count, 0)::INTEGER,
    COALESCE(confirmed_count, 0)::INTEGER,
    COALESCE(pending_count, 0)::INTEGER,
    COALESCE(declined_count, 0)::INTEGER,
    confirmed_positions,
    positions_needed;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_convocation_stats IS 'Get statistics for a convocation: counts, positions filled, positions needed';

-- Function: Check if convocation is complete (all positions filled)
CREATE OR REPLACE FUNCTION is_convocation_complete(p_convocation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  stats RECORD;
BEGIN
  SELECT * INTO stats FROM get_convocation_stats(p_convocation_id);
  
  -- Check if all required positions are filled
  RETURN (
    stats.total_required > 0 
    AND stats.confirmed_count >= stats.total_required
    AND (stats.positions_needed IS NULL OR stats.positions_needed = '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_convocation_complete IS 'Check if a convocation has all required positions filled';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS is_convocation_complete(UUID);
-- DROP FUNCTION IF EXISTS get_convocation_stats(UUID);
-- DROP TRIGGER IF EXISTS trigger_update_convocation_responses_updated_at ON convocation_responses;
-- DROP TRIGGER IF EXISTS trigger_update_game_convocations_updated_at ON game_convocations;
-- DROP FUNCTION IF EXISTS update_convocation_responses_updated_at();
-- DROP FUNCTION IF EXISTS update_game_convocations_updated_at();
-- DROP INDEX IF EXISTS idx_convocation_responses_pending;
-- DROP INDEX IF EXISTS idx_convocation_responses_response;
-- DROP INDEX IF EXISTS idx_convocation_responses_user_id;
-- DROP INDEX IF EXISTS idx_convocation_responses_convocation_id;
-- DROP TABLE IF EXISTS convocation_responses;
-- DROP INDEX IF EXISTS idx_game_convocations_required_positions;
-- DROP INDEX IF EXISTS idx_game_convocations_created_at;
-- DROP INDEX IF EXISTS idx_game_convocations_status;
-- DROP INDEX IF EXISTS idx_game_convocations_event_id;
-- DROP TABLE IF EXISTS game_convocations;

