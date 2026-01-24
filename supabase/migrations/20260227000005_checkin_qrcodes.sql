-- =====================================================
-- Migration: Check-in QR Codes
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Create system for QR Code check-in at events
-- =====================================================

-- =====================================================
-- CHECK-IN QR CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS checkin_qrcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event relationship
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- QR Code data
  qr_code_data TEXT NOT NULL UNIQUE, -- Unique QR code string
  qr_code_hash TEXT NOT NULL UNIQUE, -- Hash for quick lookup
  
  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0, -- How many times it was scanned (for validation)
  max_uses INTEGER DEFAULT 1, -- Maximum number of uses (usually 1 for security)
  
  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checkin_qrcodes_event_id ON checkin_qrcodes(event_id);
CREATE INDEX idx_checkin_qrcodes_hash ON checkin_qrcodes(qr_code_hash);
CREATE INDEX idx_checkin_qrcodes_active ON checkin_qrcodes(is_active, expires_at) WHERE is_active = TRUE;
-- Note: Cannot use NOW() in index predicate (not immutable). Filter in queries instead.
CREATE INDEX idx_checkin_qrcodes_expires_at ON checkin_qrcodes(expires_at);

-- Comments
COMMENT ON TABLE checkin_qrcodes IS 'QR Codes generated for event check-in';
COMMENT ON COLUMN checkin_qrcodes.qr_code_data IS 'Full QR code data (encrypted or signed)';
COMMENT ON COLUMN checkin_qrcodes.qr_code_hash IS 'Hash of QR code for quick validation';
COMMENT ON COLUMN checkin_qrcodes.expires_at IS 'Expiration time for the QR code';
COMMENT ON COLUMN checkin_qrcodes.max_uses IS 'Maximum number of times the QR code can be used (usually 1)';

-- =====================================================
-- CHECKINS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Check-in method
  checkin_method VARCHAR(20) NOT NULL 
    CHECK (checkin_method IN ('qrcode', 'manual')),
  
  -- QR Code reference (if used)
  qr_code_id UUID REFERENCES checkin_qrcodes(id) ON DELETE SET NULL,
  
  -- Timestamps
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(event_id, user_id), -- One check-in per user per event
  CONSTRAINT valid_checkin_method CHECK (checkin_method IN ('qrcode', 'manual'))
);

-- Indexes
CREATE INDEX idx_checkins_event_id ON checkins(event_id);
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_qr_code_id ON checkins(qr_code_id) WHERE qr_code_id IS NOT NULL;
CREATE INDEX idx_checkins_checked_in_at ON checkins(checked_in_at DESC);
CREATE INDEX idx_checkins_method ON checkins(checkin_method);

-- Comments
COMMENT ON TABLE checkins IS 'Event check-ins (via QR Code or manual)';
COMMENT ON COLUMN checkins.checkin_method IS 'Method: qrcode (scanned QR), manual (admin entered)';

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Validate and process QR Code check-in
CREATE OR REPLACE FUNCTION process_qrcode_checkin(
  p_qr_code_hash TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  event_id UUID,
  checked_in_at TIMESTAMPTZ
) AS $$
DECLARE
  qr_code_record RECORD;
  existing_checkin UUID;
BEGIN
  -- Find QR code
  SELECT * INTO qr_code_record
  FROM checkin_qrcodes
  WHERE qr_code_hash = p_qr_code_hash
    AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'QR Code não encontrado ou inativo'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Check expiration
  IF qr_code_record.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, 'QR Code expirado'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF qr_code_record.usage_count >= qr_code_record.max_uses THEN
    RETURN QUERY SELECT FALSE, 'QR Code já foi utilizado'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Check if user already checked in
  SELECT id INTO existing_checkin
  FROM checkins
  WHERE event_id = qr_code_record.event_id
    AND user_id = p_user_id;
  
  IF existing_checkin IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'Usuário já fez check-in neste evento'::TEXT, qr_code_record.event_id, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Process check-in
  INSERT INTO checkins (
    event_id,
    user_id,
    checkin_method,
    qr_code_id,
    checked_in_at
  ) VALUES (
    qr_code_record.event_id,
    p_user_id,
    'qrcode',
    qr_code_record.id,
    NOW()
  );
  
  -- Update QR code usage
  UPDATE checkin_qrcodes
  SET usage_count = usage_count + 1
  WHERE id = qr_code_record.id;
  
  -- Return success
  RETURN QUERY SELECT 
    TRUE, 
    'Check-in realizado com sucesso'::TEXT,
    qr_code_record.event_id,
    NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_qrcode_checkin IS 'Validate and process a QR Code check-in. Returns success status and event info.';

-- Function: Create QR Code for event
CREATE OR REPLACE FUNCTION create_event_qrcode(
  p_event_id UUID,
  p_user_id UUID,
  p_expires_in_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
  qr_code_id UUID,
  qr_code_data TEXT,
  qr_code_hash TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  qr_data TEXT;
  qr_hash TEXT;
  expires TIMESTAMPTZ;
BEGIN
  -- Generate unique QR code data (event_id + timestamp + random)
  qr_data := 'EVENT:' || p_event_id::TEXT || ':' || EXTRACT(EPOCH FROM NOW())::TEXT || ':' || gen_random_uuid()::TEXT;
  
  -- Generate hash (using MD5 for simplicity, can be upgraded to SHA256)
  qr_hash := MD5(qr_data);
  
  -- Calculate expiration
  expires := NOW() + (p_expires_in_minutes || ' minutes')::INTERVAL;
  
  -- Insert QR code
  INSERT INTO checkin_qrcodes (
    event_id,
    qr_code_data,
    qr_code_hash,
    expires_at,
    created_by
  ) VALUES (
    p_event_id,
    qr_data,
    qr_hash,
    expires,
    p_user_id
  )
  RETURNING id, qr_code_data, qr_code_hash, expires_at
  INTO qr_code_id, qr_data, qr_hash, expires;
  
  RETURN QUERY SELECT qr_code_id, qr_data, qr_hash, expires;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_event_qrcode IS 'Create a new QR Code for an event. Returns QR code data and hash.';

-- Function: Get check-ins for an event
CREATE OR REPLACE FUNCTION get_event_checkins(p_event_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  checkin_method VARCHAR(20),
  checked_in_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.user_id,
    p.full_name AS user_name,
    c.checkin_method,
    c.checked_in_at
  FROM checkins c
  INNER JOIN profiles p ON c.user_id = p.id
  WHERE c.event_id = p_event_id
  ORDER BY c.checked_in_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_event_checkins IS 'Get all check-ins for an event with user names';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS get_event_checkins(UUID);
-- DROP FUNCTION IF EXISTS create_event_qrcode(UUID, INTEGER, UUID);
-- DROP FUNCTION IF EXISTS process_qrcode_checkin(TEXT, UUID);
-- DROP INDEX IF EXISTS idx_checkins_method;
-- DROP INDEX IF EXISTS idx_checkins_checked_in_at;
-- DROP INDEX IF EXISTS idx_checkins_qr_code_id;
-- DROP INDEX IF EXISTS idx_checkins_user_id;
-- DROP INDEX IF EXISTS idx_checkins_event_id;
-- DROP TABLE IF EXISTS checkins;
-- DROP INDEX IF EXISTS idx_checkin_qrcodes_expires_at;
-- DROP INDEX IF EXISTS idx_checkin_qrcodes_active;
-- DROP INDEX IF EXISTS idx_checkin_qrcodes_hash;
-- DROP INDEX IF EXISTS idx_checkin_qrcodes_event_id;
-- DROP TABLE IF EXISTS checkin_qrcodes;

