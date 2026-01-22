-- =====================================================
-- Migration: Financial System (Wallets, Charges, Pix)
-- Version: 1.0
-- Date: 2026-02-04
-- Description: Financial management and Pix payment integration
-- =====================================================

-- =====================================================
-- WALLETS TABLE
-- =====================================================

CREATE TABLE wallets (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- W-001, W-002, etc.

  -- Owner (can be user or group)
  owner_type TEXT NOT NULL CHECK (owner_type IN ('user', 'group')),
  owner_id BIGINT NOT NULL, -- References profiles.id or groups.id
  owner_uuid UUID, -- For user wallets (references profiles.id)

  -- Balance
  balance DECIMAL(12, 2) DEFAULT 0.00,
  pending_balance DECIMAL(12, 2) DEFAULT 0.00,

  -- Currency
  currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD')),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_balance CHECK (balance >= 0),
  CONSTRAINT valid_pending CHECK (pending_balance >= 0),
  UNIQUE(owner_type, owner_id)
);

-- Indexes
CREATE INDEX idx_wallets_code ON wallets(code);
CREATE INDEX idx_wallets_owner ON wallets(owner_type, owner_id);
CREATE INDEX idx_wallets_owner_uuid ON wallets(owner_uuid);
CREATE INDEX idx_wallets_is_active ON wallets(is_active) WHERE is_active = TRUE;

-- =====================================================
-- CHARGES TABLE
-- =====================================================

CREATE TABLE charges (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- CH-00001

  -- Associated entity
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,

  -- Charge details
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1, -- How many items/people

  -- Total calculation
  total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount * quantity) STORED,

  -- Due date
  due_date DATE,

  -- Split configuration
  split_type TEXT DEFAULT 'equal' CHECK (
    split_type IN ('equal', 'custom', 'percentage')
  ),
  split_config JSONB DEFAULT '{}'::jsonb,

  -- Status
  status payment_status_type DEFAULT 'pending',

  -- Stats (updated by triggers)
  total_paid DECIMAL(10, 2) DEFAULT 0.00,
  total_pending DECIMAL(10, 2),
  paid_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,

  -- Created by
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_quantity CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX idx_charges_code ON charges(code);
CREATE INDEX idx_charges_group_id ON charges(group_id);
CREATE INDEX idx_charges_event_id ON charges(event_id);
CREATE INDEX idx_charges_status ON charges(status);
CREATE INDEX idx_charges_due_date ON charges(due_date);
CREATE INDEX idx_charges_created_by ON charges(created_by);

-- =====================================================
-- CHARGE_SPLITS TABLE
-- =====================================================

CREATE TABLE charge_splits (
  id BIGSERIAL PRIMARY KEY,
  charge_id BIGINT NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Amount owed by this user
  amount DECIMAL(10, 2) NOT NULL,

  -- Payment status
  status payment_status_type DEFAULT 'pending',

  -- Payment details
  paid_amount DECIMAL(10, 2) DEFAULT 0.00,
  paid_at TIMESTAMPTZ,

  -- Payment method
  payment_method TEXT, -- 'pix', 'cash', 'card', etc.
  payment_proof_url TEXT, -- Supabase Storage: receipts bucket

  -- Pix QR (if applicable)
  pix_qr_id BIGINT, -- References pix_payments table

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(charge_id, user_id),
  CONSTRAINT valid_split_amount CHECK (amount > 0),
  CONSTRAINT valid_paid_amount CHECK (paid_amount >= 0 AND paid_amount <= amount)
);

-- Indexes
CREATE INDEX idx_charge_splits_charge_id ON charge_splits(charge_id);
CREATE INDEX idx_charge_splits_user_id ON charge_splits(user_id);
CREATE INDEX idx_charge_splits_status ON charge_splits(status);
CREATE INDEX idx_charge_splits_pix_qr_id ON charge_splits(pix_qr_id);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- TX-00001

  -- Wallets involved
  from_wallet_id BIGINT REFERENCES wallets(id),
  to_wallet_id BIGINT REFERENCES wallets(id),

  -- Transaction details
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type transaction_type_type NOT NULL,

  -- Related entities
  charge_id BIGINT REFERENCES charges(id),
  event_id BIGINT REFERENCES events(id),
  group_id BIGINT REFERENCES groups(id),
  user_id UUID REFERENCES profiles(id),

  -- Description
  description TEXT,

  -- Status
  status payment_status_type DEFAULT 'pending',

  -- Payment method
  payment_method TEXT,
  external_reference TEXT, -- External transaction ID

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  CONSTRAINT valid_transaction_amount CHECK (amount > 0),
  CONSTRAINT valid_wallets CHECK (
    from_wallet_id IS NOT NULL OR to_wallet_id IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_transactions_code ON transactions(code);
CREATE INDEX idx_transactions_from_wallet ON transactions(from_wallet_id);
CREATE INDEX idx_transactions_to_wallet ON transactions(to_wallet_id);
CREATE INDEX idx_transactions_charge_id ON transactions(charge_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- =====================================================
-- PIX_PAYMENTS TABLE (QR Code Storage)
-- =====================================================

CREATE TABLE pix_payments (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- PIX-00001

  -- Associated entities
  charge_split_id BIGINT REFERENCES charge_splits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),

  -- Pix details
  pix_key TEXT NOT NULL,
  pix_key_type pix_key_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,

  -- QR Code data
  qr_code_payload TEXT NOT NULL, -- EMV format
  qr_code_image_url TEXT, -- Base64 or Storage URL

  -- Transaction ID (txid)
  transaction_id TEXT UNIQUE,

  -- Merchant info
  merchant_name TEXT,
  merchant_city TEXT,

  -- Status
  status payment_status_type DEFAULT 'pending',

  -- Payment confirmation
  paid_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_pix_amount CHECK (amount > 0)
);

-- Indexes
CREATE INDEX idx_pix_payments_code ON pix_payments(code);
CREATE INDEX idx_pix_payments_charge_split_id ON pix_payments(charge_split_id);
CREATE INDEX idx_pix_payments_user_id ON pix_payments(user_id);
CREATE INDEX idx_pix_payments_status ON pix_payments(status);
CREATE INDEX idx_pix_payments_transaction_id ON pix_payments(transaction_id);
CREATE INDEX idx_pix_payments_expires_at ON pix_payments(expires_at);

-- =====================================================
-- GROUP_PIX_CONFIG TABLE (Pix Settings per Group)
-- =====================================================

CREATE TABLE group_pix_config (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT UNIQUE NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Pix Key to receive payments
  pix_key TEXT NOT NULL,
  pix_key_type pix_key_type NOT NULL,

  -- Merchant info
  merchant_name TEXT NOT NULL,
  merchant_city TEXT DEFAULT 'São Paulo',
  merchant_category_code TEXT DEFAULT '0000',

  -- Auto-confirmation settings
  auto_confirm_payments BOOLEAN DEFAULT FALSE,
  require_proof BOOLEAN DEFAULT TRUE,

  -- Is active
  is_active BOOLEAN DEFAULT TRUE,

  -- Created by
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_group_pix_config_group_id ON group_pix_config(group_id);
CREATE INDEX idx_group_pix_config_is_active ON group_pix_config(is_active) WHERE is_active = TRUE;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate unique wallet code
CREATE OR REPLACE FUNCTION generate_wallet_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_code TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM wallets
  WHERE code ~ '^W-\d+$';

  new_code := 'W-' || LPAD(next_num::TEXT, 3, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate wallet code
CREATE OR REPLACE FUNCTION trigger_generate_wallet_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_wallet_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_wallet_code
BEFORE INSERT ON wallets
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_wallet_code();

-- Generate charge code
CREATE OR REPLACE FUNCTION generate_charge_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM charges
  WHERE code ~ '^CH-\d+$';

  RETURN 'CH-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate transaction code
CREATE OR REPLACE FUNCTION generate_transaction_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM transactions
  WHERE code ~ '^TX-\d+$';

  RETURN 'TX-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate Pix payment code
CREATE OR REPLACE FUNCTION generate_pix_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM pix_payments
  WHERE code ~ '^PIX-\d+$';

  RETURN 'PIX-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-generate codes (triggers)
CREATE OR REPLACE FUNCTION trigger_generate_financial_codes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    CASE TG_TABLE_NAME
      WHEN 'wallets' THEN NEW.code := generate_wallet_code();
      WHEN 'charges' THEN NEW.code := generate_charge_code();
      WHEN 'transactions' THEN NEW.code := generate_transaction_code();
      WHEN 'pix_payments' THEN NEW.code := generate_pix_code();
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_charge_code
BEFORE INSERT ON charges
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_financial_codes();

CREATE TRIGGER before_insert_transaction_code
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_financial_codes();

CREATE TRIGGER before_insert_pix_code
BEFORE INSERT ON pix_payments
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_financial_codes();

-- Update charge statistics when splits change
CREATE OR REPLACE FUNCTION trigger_update_charge_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE charges
  SET
    total_paid = (
      SELECT COALESCE(SUM(paid_amount), 0)
      FROM charge_splits
      WHERE charge_id = COALESCE(NEW.charge_id, OLD.charge_id)
    ),
    paid_count = (
      SELECT COUNT(*)
      FROM charge_splits
      WHERE charge_id = COALESCE(NEW.charge_id, OLD.charge_id)
      AND status = 'paid'
    ),
    pending_count = (
      SELECT COUNT(*)
      FROM charge_splits
      WHERE charge_id = COALESCE(NEW.charge_id, OLD.charge_id)
      AND status = 'pending'
    )
  WHERE id = COALESCE(NEW.charge_id, OLD.charge_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_change_charge_split
AFTER INSERT OR UPDATE OR DELETE ON charge_splits
FOR EACH ROW
EXECUTE FUNCTION trigger_update_charge_stats();

-- =====================================================
-- RLS POLICIES (Financial)
-- =====================================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_pix_config ENABLE ROW LEVEL SECURITY;

-- Wallets: Users can view own wallet
CREATE POLICY "Users can view own wallet"
ON wallets FOR SELECT
USING (
  (owner_type = 'user' AND owner_uuid = auth.uid())
  OR (owner_type = 'group' AND is_group_member(auth.uid(), owner_id))
  OR has_platform_access(auth.uid())
);

-- Charges: Group members can view group charges
CREATE POLICY "Group members can view charges"
ON charges FOR SELECT
USING (
  is_group_member(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- Charges: Admins can create charges
CREATE POLICY "Admins can create charges"
ON charges FOR INSERT
WITH CHECK (
  has_group_permission(auth.uid(), group_id, 'manage_finances')
  OR is_group_admin(auth.uid(), group_id)
);

-- Charge Splits: Users can view own splits
CREATE POLICY "Users can view own splits"
ON charge_splits FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM charges
    WHERE charges.id = charge_splits.charge_id
    AND is_group_admin(auth.uid(), charges.group_id)
  )
);

-- Charge Splits: Users can update own splits
CREATE POLICY "Users can update own splits"
ON charge_splits FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM charges
    WHERE charges.id = charge_splits.charge_id
    AND is_group_admin(auth.uid(), charges.group_id)
  )
);

-- Pix Payments: Users can view own payments
CREATE POLICY "Users can view own pix payments"
ON pix_payments FOR SELECT
USING (
  user_id = auth.uid()
  OR has_platform_access(auth.uid())
);

-- Group Pix Config: Group admins can manage
CREATE POLICY "Admins can manage pix config"
ON group_pix_config FOR ALL
USING (
  is_group_admin(auth.uid(), group_id)
  OR has_platform_access(auth.uid())
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE wallets IS 'Wallet system for users and groups';
COMMENT ON TABLE charges IS 'Financial charges for events and groups';
COMMENT ON TABLE charge_splits IS 'Individual payment splits per user';
COMMENT ON TABLE transactions IS 'Transaction ledger for all financial operations';
COMMENT ON TABLE pix_payments IS 'Pix QR code payments (Brazilian instant payment)';
COMMENT ON TABLE group_pix_config IS 'Pix configuration per group (receiver key)';
