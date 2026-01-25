-- =====================================================
-- Migration: Add Pix Fields to Charges
-- Version: 1.0
-- Date: 2026-01-25
-- Description: Add Pix QR Code fields to charges table
-- Sprint 3: Pix QR Code + ReceiverProfiles
-- =====================================================

-- =====================================================
-- ADD PIX FIELDS TO CHARGES
-- =====================================================

ALTER TABLE charges
  ADD COLUMN IF NOT EXISTS pix_payload TEXT, -- EMV QR Code payload (copia-e-cola)
  ADD COLUMN IF NOT EXISTS qr_image_url TEXT, -- Base64 or URL of QR Code image
  ADD COLUMN IF NOT EXISTS pix_generated_at TIMESTAMPTZ; -- When Pix was generated

-- Indexes
CREATE INDEX IF NOT EXISTS idx_charges_pix_payload ON charges(pix_payload) WHERE pix_payload IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_charges_pix_generated ON charges(pix_generated_at) WHERE pix_generated_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN charges.pix_payload IS 'Pix EMV QR Code payload (BR Code format)';
COMMENT ON COLUMN charges.qr_image_url IS 'QR Code image URL or base64 data';
COMMENT ON COLUMN charges.pix_generated_at IS 'Timestamp when Pix QR Code was generated';

