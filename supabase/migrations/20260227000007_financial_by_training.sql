-- =====================================================
-- Migration: Financial by Training
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Add financial tracking per training event with views and functions
-- =====================================================

-- =====================================================
-- ALTER CHARGES TABLE (if event_id doesn't exist)
-- =====================================================

-- Note: event_id may already exist from previous migration
-- This is safe to run multiple times
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'charges' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE charges ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_charges_event_id ON charges(event_id) WHERE event_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN charges.event_id IS 'Associated event (training or game) for this charge';

-- =====================================================
-- VIEW: Training Payments Summary
-- =====================================================

CREATE OR REPLACE VIEW v_training_payments AS
SELECT
  e.id AS event_id,
  -- Use created_at as event_date (date column may not exist in all schemas)
  (e.created_at)::DATE AS event_date,
  sm.name AS modality_name,
  g.id AS group_id,
  g.name AS group_name,
  
  -- Attendance
  COUNT(DISTINCT ea.user_id) FILTER (WHERE ea.status = 'yes') AS confirmed_attendance,
  COUNT(DISTINCT ea.user_id) AS total_rsvp,
  
  -- Financial (ajustado para schema antigo - usa amount_cents)
  c.id AS charge_id,
  -- Convert amount_cents to decimal (schema antigo)
  CASE WHEN c.amount_cents IS NOT NULL THEN (c.amount_cents::DECIMAL / 100.0) ELSE 0 END AS amount_per_person,
  (CASE WHEN c.amount_cents IS NOT NULL THEN (c.amount_cents::DECIMAL / 100.0) ELSE 0 END * COUNT(DISTINCT ea.user_id) FILTER (WHERE ea.status = 'yes')) AS expected_amount,
  -- Note: total_paid, paid_count, pending_count não existem no schema antigo
  -- Usar 0 como placeholder até migration de financial_system ser aplicada
  0 AS received_amount,
  0 AS paid_count,
  0 AS pending_count,
  
  -- Percentage (simplificado - sempre 0 até migration ser aplicada)
  0 AS payment_percentage,
  
  -- Status (simplificado)
  CASE
    WHEN COUNT(DISTINCT ea.user_id) FILTER (WHERE ea.status = 'yes') = 0 THEN 'no_attendance'
    WHEN c.id IS NULL THEN 'no_charge'
    ELSE 'pending'
  END AS payment_status,
  
  -- Timestamps
  e.created_at AS event_created_at,
  c.created_at AS charge_created_at

FROM events e
LEFT JOIN sport_modalities sm ON e.modality_id = sm.id
LEFT JOIN groups g ON e.group_id = g.id
LEFT JOIN event_attendance ea ON e.id = ea.event_id
LEFT JOIN charges c ON e.id = c.event_id
LEFT JOIN wallets w ON c.group_id = w.owner_id AND w.owner_type = 'group'
WHERE e.id IS NOT NULL
GROUP BY 
  e.id, 
  (e.created_at)::DATE,
  sm.name, g.id, g.name,
  c.id, c.amount_cents,
  e.created_at, c.created_at;

COMMENT ON VIEW v_training_payments IS 'Summary of payments per training event with attendance and payment statistics';

-- =====================================================
-- VIEW: Training Payment Details
-- =====================================================

CREATE OR REPLACE VIEW v_training_payment_details AS
SELECT
  e.id AS event_id,
  -- Use created_at as event_date (date column may not exist in all schemas)
  (e.created_at)::DATE AS event_date,
  p.id AS user_id,
  p.full_name AS user_name,
  NULL::TEXT AS user_email, -- Email not available in profiles table (would need to join with auth.users)
  ea.status AS rsvp_status,
  c.id AS charge_id,
  -- Convert amount_cents to decimal (schema antigo)
  CASE WHEN c.amount_cents IS NOT NULL THEN (c.amount_cents::DECIMAL / 100.0) ELSE 0 END AS amount_per_person,
  c.id AS transaction_id, -- Use charge_id as transaction_id (charge_splits não existe)
  c.status::TEXT AS payment_status,
  0 AS paid_amount, -- paid_amount não existe no schema antigo
  c.created_at AS paid_at,
  CASE
    WHEN ea.status = 'yes' AND c.status::TEXT = 'paid' THEN 'paid'
    WHEN ea.status = 'yes' AND (c.status IS NULL OR c.status::TEXT != 'paid') THEN 'pending'
    WHEN ea.status != 'yes' THEN 'not_attending'
    ELSE 'unknown'
  END AS payment_state
FROM events e
INNER JOIN event_attendance ea ON e.id = ea.event_id
INNER JOIN profiles p ON ea.user_id = p.id
LEFT JOIN charges c ON e.id = c.event_id
WHERE e.id IS NOT NULL
ORDER BY (e.created_at)::DATE DESC, p.full_name;

COMMENT ON VIEW v_training_payment_details IS 'Detailed view of payments per user per training event';

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get payment summary for a training event
CREATE OR REPLACE FUNCTION get_training_payment_summary(p_event_id UUID)
  RETURNS TABLE (
    event_id UUID,
    event_name TEXT,
    event_date DATE,
    confirmed_count INTEGER,
    expected_amount DECIMAL(10, 2),
    received_amount DECIMAL(10, 2),
    paid_count INTEGER,
    pending_count INTEGER,
    payment_percentage DECIMAL(5, 2),
    payment_status TEXT
  ) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vtp.event_id,
    e.title AS event_name,
    vtp.event_date,
    vtp.confirmed_attendance::INTEGER,
    vtp.expected_amount,
    vtp.received_amount,
    vtp.paid_count::INTEGER,
    vtp.pending_count::INTEGER,
    vtp.payment_percentage,
    vtp.payment_status
  FROM v_training_payments vtp
  INNER JOIN events e ON vtp.event_id = e.id
  WHERE vtp.event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_training_payment_summary IS 'Get payment summary for a specific training event';

-- Function: Get pending payments for a training event
CREATE OR REPLACE FUNCTION get_training_pending_payments(p_event_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  amount DECIMAL(10, 2),
  charge_id UUID  -- Schema antigo usa UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vtd.user_id,
    vtd.user_name,
    vtd.user_email,
    vtd.amount_per_person,
    vtd.charge_id
  FROM v_training_payment_details vtd
  WHERE vtd.event_id = p_event_id
    AND vtd.payment_state = 'pending'
  ORDER BY vtd.user_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_training_pending_payments IS 'Get list of users with pending payments for a training event';

-- Function: Create charge for a training event
CREATE OR REPLACE FUNCTION create_training_charge(
  p_event_id UUID,
  p_amount_per_person DECIMAL(10, 2),
  p_user_id UUID,
  p_description TEXT DEFAULT NULL
)
  RETURNS UUID AS $$  -- Schema antigo usa UUID, não BIGINT
DECLARE
  event_record RECORD;
  charge_id UUID;  -- Schema antigo usa UUID
  confirmed_count INTEGER;
BEGIN
  -- Get event info
  SELECT * INTO event_record
  FROM events
  WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found: %', p_event_id;
  END IF;
  
  -- Count confirmed attendance
  SELECT COUNT(*) INTO confirmed_count
  FROM event_attendance
  WHERE event_id = p_event_id
    AND status = 'yes';
  
  -- Create charge (ajustado para schema antigo - usa amount_cents)
  INSERT INTO charges (
    group_id,
    event_id,
    type,
    amount_cents,
    due_date,
    status,
    created_at
  ) VALUES (
    event_record.group_id,
    p_event_id,
    'other', -- type do schema antigo
    (p_amount_per_person * 100)::INTEGER, -- Convert decimal to cents
    (event_record.created_at)::DATE, -- Use created_at as due_date (date column may not exist)
    'pending', -- status do schema antigo (não usa payment_status_type)
    NOW()
  )
  RETURNING id INTO charge_id;
  
  RETURN charge_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_training_charge IS 'Create a charge for a training event based on confirmed attendance';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS create_training_charge(UUID, DECIMAL, TEXT, UUID);
-- DROP FUNCTION IF EXISTS get_training_pending_payments(UUID);
-- DROP FUNCTION IF EXISTS get_training_payment_summary(UUID);
-- DROP VIEW IF EXISTS v_training_payment_details;
-- DROP VIEW IF EXISTS v_training_payments;
-- DROP INDEX IF EXISTS idx_charges_event_id;
-- ALTER TABLE charges DROP COLUMN IF EXISTS event_id;

