-- =====================================================
-- Migration: Recurring Trainings
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Add support for recurring events/trainings
-- =====================================================

-- =====================================================
-- ALTER EVENTS TABLE - Add Recurrence Support
-- =====================================================

-- Add recurrence columns
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
  ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'training' 
    CHECK (event_type IN ('training', 'official_game', 'friendly')),
  ADD COLUMN IF NOT EXISTS parent_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS modality_id UUID REFERENCES sport_modalities(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON events(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_recurrence_pattern ON events USING GIN (recurrence_pattern) WHERE recurrence_pattern IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_parent_event_id ON events(parent_event_id) WHERE parent_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_modality_id ON events(modality_id) WHERE modality_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN events.is_recurring IS 'Indicates if this event is part of a recurring series';
COMMENT ON COLUMN events.recurrence_pattern IS 'JSONB pattern: {"type": "weekly", "day": "thursday", "interval": 1, "endDate": "2026-12-31", "count": 10}';
COMMENT ON COLUMN events.event_type IS 'Type: training (regular), official_game (competition), friendly (friendly match)';
COMMENT ON COLUMN events.parent_event_id IS 'Reference to the original recurring event template';
COMMENT ON COLUMN events.modality_id IS 'Sport modality for this event (if group has multiple modalities)';

-- =====================================================
-- RECURRENCE PATTERN STRUCTURE
-- =====================================================

-- Example recurrence_pattern JSONB:
-- {
--   "type": "weekly",        -- weekly, biweekly, monthly
--   "day": "thursday",       -- monday, tuesday, wednesday, thursday, friday, saturday, sunday
--   "interval": 1,           -- Every X weeks/months
--   "endDate": "2026-12-31", -- End date (optional, ISO format)
--   "count": 10              -- Number of occurrences (optional)
-- }

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Generate recurring events from a template
CREATE OR REPLACE FUNCTION generate_recurring_events(
  p_template_event_id UUID,
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL,
  p_max_occurrences INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  template_event RECORD;
  current_occurrence_date DATE;  -- Renamed from current_date (reserved word)
  occurrence_count INTEGER := 0;
  pattern_type TEXT;
  pattern_day TEXT;
  pattern_interval INTEGER;
  pattern_end_date DATE;
  pattern_count INTEGER;
  next_date DATE;
BEGIN
  -- Get template event
  SELECT * INTO template_event
  FROM events
  WHERE id = p_template_event_id
    AND is_recurring = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template event not found or not recurring: %', p_template_event_id;
  END IF;
  
  -- Parse recurrence pattern
  pattern_type := template_event.recurrence_pattern->>'type';
  pattern_day := template_event.recurrence_pattern->>'day';
  pattern_interval := COALESCE((template_event.recurrence_pattern->>'interval')::INTEGER, 1);
  pattern_end_date := CASE 
    WHEN template_event.recurrence_pattern->>'endDate' IS NOT NULL 
    THEN (template_event.recurrence_pattern->>'endDate')::DATE
    ELSE NULL
  END;
  pattern_count := COALESCE((template_event.recurrence_pattern->>'count')::INTEGER, NULL);
  
  -- Determine end date
  IF p_end_date IS NOT NULL THEN
    pattern_end_date := LEAST(pattern_end_date, p_end_date);
  END IF;
  
  -- Start from template date or provided start date
  current_occurrence_date := GREATEST(template_event.date, p_start_date);
  
  -- Generate events based on pattern
  WHILE (pattern_end_date IS NULL OR current_occurrence_date <= pattern_end_date)
    AND (pattern_count IS NULL OR occurrence_count < pattern_count)
    AND (p_max_occurrences IS NULL OR occurrence_count < p_max_occurrences)
  LOOP
    -- Calculate next occurrence date
    CASE pattern_type
      WHEN 'weekly' THEN
        -- Find next occurrence of the specified day
        next_date := current_occurrence_date + (7 * pattern_interval) * INTERVAL '1 day';
        -- Adjust to the correct day of week
        WHILE EXTRACT(DOW FROM next_date) != 
          CASE pattern_day
            WHEN 'sunday' THEN 0
            WHEN 'monday' THEN 1
            WHEN 'tuesday' THEN 2
            WHEN 'wednesday' THEN 3
            WHEN 'thursday' THEN 4
            WHEN 'friday' THEN 5
            WHEN 'saturday' THEN 6
          END
        LOOP
          next_date := next_date + INTERVAL '1 day';
        END LOOP;
        
      WHEN 'biweekly' THEN
        next_date := current_occurrence_date + (14 * pattern_interval) * INTERVAL '1 day';
        
      WHEN 'monthly' THEN
        next_date := current_occurrence_date + (pattern_interval || ' months')::INTERVAL;
        
      ELSE
        RAISE EXCEPTION 'Unsupported recurrence type: %', pattern_type;
    END CASE;
    
    -- Check if we've passed the end date
    IF pattern_end_date IS NOT NULL AND next_date > pattern_end_date THEN
      EXIT;
    END IF;
    
    -- Create event instance
    INSERT INTO events (
      code,
      group_id,
      title,
      description,
      date,
      time,
      duration,
      venue_id,
      location_name,
      location_address,
      max_players,
      max_goalkeepers,
      cost_per_player,
      total_cost,
      status,
      privacy,
      rsvp_deadline,
      allow_waitlist,
      auto_confirm_from_waitlist,
      created_by,
      is_recurring,
      parent_event_id,
      event_type,
      modality_id
    )
    SELECT
      'E-' || TO_CHAR(next_date, 'YYYY-MM-DD') || '-' || LPAD((occurrence_count + 1)::TEXT, 3, '0'),
      template_event.group_id,
      template_event.title,
      template_event.description,
      next_date,
      template_event.time,
      template_event.duration,
      template_event.venue_id,
      template_event.location_name,
      template_event.location_address,
      template_event.max_players,
      template_event.max_goalkeepers,
      template_event.cost_per_player,
      template_event.total_cost,
      'scheduled',
      template_event.privacy,
      template_event.rsvp_deadline,
      template_event.allow_waitlist,
      template_event.auto_confirm_from_waitlist,
      template_event.created_by,
      FALSE, -- Instance is not recurring itself
      p_template_event_id,
      template_event.event_type,
      template_event.modality_id
    WHERE NOT EXISTS (
      SELECT 1 FROM events 
      WHERE group_id = template_event.group_id 
        AND date = next_date 
        AND time = template_event.time
    );
    
    occurrence_count := occurrence_count + 1;
    current_occurrence_date := next_date;
  END LOOP;
  
  RETURN occurrence_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_recurring_events IS 'Generate recurring event instances from a template event. Returns number of events created.';

-- Function: Get next occurrence date for a recurring event
CREATE OR REPLACE FUNCTION get_next_recurrence_date(
  p_template_event_id UUID
)
RETURNS DATE AS $$
DECLARE
  template_event RECORD;
  last_occurrence DATE;
  pattern_type TEXT;
  pattern_day TEXT;
  pattern_interval INTEGER;
  next_date DATE;
BEGIN
  -- Get template event
  SELECT * INTO template_event
  FROM events
  WHERE id = p_template_event_id
    AND is_recurring = TRUE;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get last occurrence date
  SELECT MAX(date) INTO last_occurrence
  FROM events
  WHERE parent_event_id = p_template_event_id;
  
  IF last_occurrence IS NULL THEN
    last_occurrence := template_event.date;
  END IF;
  
  -- Parse pattern
  pattern_type := template_event.recurrence_pattern->>'type';
  pattern_day := template_event.recurrence_pattern->>'day';
  pattern_interval := COALESCE((template_event.recurrence_pattern->>'interval')::INTEGER, 1);
  
  -- Calculate next date
  CASE pattern_type
    WHEN 'weekly' THEN
      next_date := last_occurrence + (7 * pattern_interval) * INTERVAL '1 day';
      -- Adjust to correct day of week
      WHILE EXTRACT(DOW FROM next_date) != 
        CASE pattern_day
          WHEN 'sunday' THEN 0
          WHEN 'monday' THEN 1
          WHEN 'tuesday' THEN 2
          WHEN 'wednesday' THEN 3
          WHEN 'thursday' THEN 4
          WHEN 'friday' THEN 5
          WHEN 'saturday' THEN 6
        END
      LOOP
        next_date := next_date + INTERVAL '1 day';
      END LOOP;
      
    WHEN 'biweekly' THEN
      next_date := last_occurrence + (14 * pattern_interval) * INTERVAL '1 day';
      
    WHEN 'monthly' THEN
      next_date := last_occurrence + (pattern_interval || ' months')::INTERVAL;
      
    ELSE
      RETURN NULL;
  END CASE;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_recurrence_date IS 'Get the next occurrence date for a recurring event template.';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS get_next_recurrence_date(UUID);
-- DROP FUNCTION IF EXISTS generate_recurring_events(UUID, DATE, DATE, INTEGER);
-- DROP INDEX IF EXISTS idx_events_modality_id;
-- DROP INDEX IF EXISTS idx_events_parent_event_id;
-- DROP INDEX IF EXISTS idx_events_event_type;
-- DROP INDEX IF EXISTS idx_events_recurrence_pattern;
-- DROP INDEX IF EXISTS idx_events_is_recurring;
-- ALTER TABLE events DROP COLUMN IF EXISTS modality_id;
-- ALTER TABLE events DROP COLUMN IF EXISTS parent_event_id;
-- ALTER TABLE events DROP COLUMN IF EXISTS event_type;
-- ALTER TABLE events DROP COLUMN IF EXISTS recurrence_pattern;
-- ALTER TABLE events DROP COLUMN IF EXISTS is_recurring;

