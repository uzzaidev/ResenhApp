-- =====================================================
-- Migration: Backfill Financial Core (UUID-compatible)
-- Date: 2026-03-02
-- Replaces legacy intent from:
--   - 20260204000001_financial_system.sql (partial)
-- =====================================================

-- Keep charges status aligned with current app flows.
ALTER TABLE public.charges
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Expand status check to support simplified PIX flow.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'charges_status_check'
      AND conrelid = 'public.charges'::regclass
  ) THEN
    ALTER TABLE public.charges DROP CONSTRAINT charges_status_check;
  END IF;
END $$;

ALTER TABLE public.charges
  ADD CONSTRAINT charges_status_check
  CHECK (status IN ('pending', 'paid', 'canceled', 'self_reported', 'denied'));

-- Split payments per participant.
CREATE TABLE IF NOT EXISTS public.charge_splits (
  id BIGSERIAL PRIMARY KEY,
  charge_id UUID NOT NULL REFERENCES public.charges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'canceled', 'self_reported', 'denied')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (charge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_charge_splits_charge_id ON public.charge_splits(charge_id);
CREATE INDEX IF NOT EXISTS idx_charge_splits_user_id ON public.charge_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_charge_splits_status ON public.charge_splits(status);

-- Basic financial ledger.
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  charge_id UUID REFERENCES public.charges(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  method TEXT CHECK (method IN ('cash', 'pix', 'card', 'transfer', 'other')),
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_charge_id ON public.transactions(charge_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Optional PIX payment audit table.
CREATE TABLE IF NOT EXISTS public.pix_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id UUID NOT NULL REFERENCES public.charges(id) ON DELETE CASCADE,
  payer_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  txid TEXT,
  amount_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pix_payments_charge_id ON public.pix_payments(charge_id);
CREATE INDEX IF NOT EXISTS idx_pix_payments_status ON public.pix_payments(status);

-- Optional group-level PIX configuration.
CREATE TABLE IF NOT EXISTS public.group_pix_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL UNIQUE REFERENCES public.groups(id) ON DELETE CASCADE,
  receiver_profile_id UUID REFERENCES public.receiver_profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_pix_config_group_id ON public.group_pix_config(group_id);

