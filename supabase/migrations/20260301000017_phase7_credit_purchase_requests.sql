-- =====================================================
-- Migration: Phase 7 - Manual credit purchase requests
-- Date: 2026-03-01
-- Description: request queue for manual PIX confirmation of credit purchases
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_code TEXT NOT NULL,
  credits_amount INTEGER NOT NULL CHECK (credits_amount > 0),
  price_brl NUMERIC(10, 2) NOT NULL CHECK (price_brl > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_purchase_requests_user
  ON credit_purchase_requests (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_purchase_requests_status
  ON credit_purchase_requests (status, created_at DESC);
