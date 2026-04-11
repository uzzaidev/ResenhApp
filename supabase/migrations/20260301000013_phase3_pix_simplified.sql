-- =====================================================
-- Migration: Phase 3 - PIX simplificado + status de confirmação manual
-- Date: 2026-03-01
-- Description:
--   - adiciona novos status de pagamento (self_reported, denied)
--   - adiciona trilha de auditoria de confirmação/negação em charges
--   - adiciona campos opcionais no receiver_profiles para UX do PIX estático
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_status_type'
      AND e.enumlabel = 'self_reported'
  ) THEN
    ALTER TYPE payment_status_type ADD VALUE 'self_reported';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_status_type'
      AND e.enumlabel = 'denied'
  ) THEN
    ALTER TYPE payment_status_type ADD VALUE 'denied';
  END IF;
END$$;

ALTER TABLE charges
  ADD COLUMN IF NOT EXISTS self_reported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_confirmed_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS admin_denial_reason TEXT;

ALTER TABLE receiver_profiles
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS instructions TEXT;

CREATE INDEX IF NOT EXISTS idx_charges_status_self_reported
  ON charges (status)
  WHERE status = 'self_reported';

CREATE INDEX IF NOT EXISTS idx_charges_admin_confirmed_by
  ON charges (admin_confirmed_by)
  WHERE admin_confirmed_by IS NOT NULL;

COMMENT ON COLUMN charges.self_reported_at IS
  'Timestamp when participant reported payment as done.';
COMMENT ON COLUMN charges.admin_confirmed_at IS
  'Timestamp when admin confirmed or denied payment.';
COMMENT ON COLUMN charges.admin_confirmed_by IS
  'Admin user who confirmed or denied payment.';
COMMENT ON COLUMN charges.admin_denial_reason IS
  'Reason informed by admin when payment is denied.';
COMMENT ON COLUMN receiver_profiles.bank_name IS
  'Optional bank name shown to participants in PIX instructions.';
COMMENT ON COLUMN receiver_profiles.instructions IS
  'Optional free-form payment instructions for participants.';
