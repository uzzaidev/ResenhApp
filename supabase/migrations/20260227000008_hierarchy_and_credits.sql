-- =====================================================
-- Migration: Hierarchy and Credits System
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Add hierarchy (parent_group_id), group types, credits system, and Pix codes
-- =====================================================

-- =====================================================
-- ALTER GROUPS TABLE - Add Hierarchy and Credits
-- =====================================================

-- Add hierarchy columns
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS parent_group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS group_type VARCHAR(20) DEFAULT 'pelada' 
    CHECK (group_type IN ('athletic', 'pelada')),
  ADD COLUMN IF NOT EXISTS pix_code TEXT,
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_purchased INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_consumed INTEGER DEFAULT 0;

-- Create indexes for hierarchy and credits
CREATE INDEX IF NOT EXISTS idx_groups_parent_group_id ON groups(parent_group_id) WHERE parent_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups(group_type);
CREATE INDEX IF NOT EXISTS idx_groups_credits ON groups(credits_balance) WHERE credits_balance > 0;
CREATE INDEX IF NOT EXISTS idx_groups_pix_code ON groups(pix_code) WHERE pix_code IS NOT NULL;

-- Add comments
COMMENT ON COLUMN groups.parent_group_id IS 'Reference to parent group (athletic). NULL for top-level groups.';
COMMENT ON COLUMN groups.group_type IS 'Type of group: athletic (full system) or pelada (simple).';
COMMENT ON COLUMN groups.pix_code IS 'Pix code for payments. Priority: athletic > group.';
COMMENT ON COLUMN groups.credits_balance IS 'Current credit balance for premium features.';
COMMENT ON COLUMN groups.credits_purchased IS 'Total credits purchased (lifetime).';
COMMENT ON COLUMN groups.credits_consumed IS 'Total credits consumed (lifetime).';

-- =====================================================
-- CREDIT TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(20) NOT NULL 
    CHECK (transaction_type IN ('purchase', 'consumption', 'refund')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  description TEXT,
  
  -- Context
  feature_used VARCHAR(50), -- Feature that consumed credits (if applicable)
  event_id UUID REFERENCES events(id) ON DELETE SET NULL, -- Event related (if applicable)
  
  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('purchase', 'consumption', 'refund'))
);

-- Indexes for credit_transactions
CREATE INDEX idx_credit_transactions_group_id ON credit_transactions(group_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_feature ON credit_transactions(feature_used) WHERE feature_used IS NOT NULL;
CREATE INDEX idx_credit_transactions_event ON credit_transactions(event_id) WHERE event_id IS NOT NULL;

COMMENT ON TABLE credit_transactions IS 'All credit transactions (purchases, consumptions, refunds)';
COMMENT ON COLUMN credit_transactions.feature_used IS 'Feature that consumed credits: recurring_training, qrcode_checkin, convocation, analytics, split_pix, tactical_board';

-- =====================================================
-- CREDIT PACKAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Package details
  name VARCHAR(50) NOT NULL UNIQUE,
  credits_amount INTEGER NOT NULL CHECK (credits_amount > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credit_packages_active ON credit_packages(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE credit_packages IS 'Available credit packages for purchase';

-- Insert default packages
INSERT INTO credit_packages (name, credits_amount, price_cents) VALUES
  ('Básico', 100, 2000),        -- R$ 20,00 = 100 créditos
  ('Intermediário', 300, 5000), -- R$ 50,00 = 300 créditos (economia 10%)
  ('Premium', 700, 10000),       -- R$ 100,00 = 700 créditos (economia 20%)
  ('Mensal', 200, 3000)          -- R$ 30,00/mês = 200 créditos/mês
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Consume credits
CREATE OR REPLACE FUNCTION consume_credits(
  p_group_id UUID,
  p_amount INTEGER,
  p_feature VARCHAR(50),
  p_user_id UUID,
  p_event_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Check current balance
  SELECT credits_balance INTO current_balance
  FROM groups
  WHERE id = p_group_id;
  
  -- Validate balance
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Group not found: %', p_group_id;
  END IF;
  
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Debit credits
  UPDATE groups
  SET 
    credits_balance = credits_balance - p_amount,
    credits_consumed = credits_consumed + p_amount,
    updated_at = NOW()
  WHERE id = p_group_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    group_id,
    transaction_type,
    amount,
    description,
    feature_used,
    event_id,
    created_by
  ) VALUES (
    p_group_id,
    'consumption',
    p_amount,
    'Créditos consumidos para: ' || p_feature,
    p_feature,
    p_event_id,
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION consume_credits IS 'Consume credits from a group. Returns TRUE if successful, FALSE if insufficient credits.';

-- Function: Add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_group_id UUID,
  p_amount INTEGER,
  p_user_id UUID,
  p_package_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  package_name TEXT;
BEGIN
  -- Get package name if provided
  IF p_package_id IS NOT NULL THEN
    SELECT name INTO package_name
    FROM credit_packages
    WHERE id = p_package_id;
  END IF;
  
  -- Add credits
  UPDATE groups
  SET 
    credits_balance = credits_balance + p_amount,
    credits_purchased = credits_purchased + p_amount,
    updated_at = NOW()
  WHERE id = p_group_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    group_id,
    transaction_type,
    amount,
    description,
    created_by
  ) VALUES (
    p_group_id,
    'purchase',
    p_amount,
    COALESCE(package_name, 'Compra de créditos'),
    p_user_id
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_credits IS 'Add credits to a group. Used for purchases.';

-- Function: Get Pix code for group (priority: athletic > group)
CREATE OR REPLACE FUNCTION get_pix_code_for_group(p_group_id UUID)
RETURNS TEXT AS $$
DECLARE
  athletic_pix TEXT;
  group_pix TEXT;
  parent_id UUID;
BEGIN
  -- Get parent group ID
  SELECT parent_group_id INTO parent_id
  FROM groups
  WHERE id = p_group_id;
  
  -- Get Pix code from athletic (parent) if exists
  IF parent_id IS NOT NULL THEN
    SELECT pix_code INTO athletic_pix
    FROM groups
    WHERE id = parent_id
      AND pix_code IS NOT NULL
      AND pix_code != '';
  END IF;
  
  -- Get Pix code from group itself
  SELECT pix_code INTO group_pix
  FROM groups
  WHERE id = p_group_id
    AND pix_code IS NOT NULL
    AND pix_code != '';
  
  -- Return priority: athletic > group
  RETURN COALESCE(athletic_pix, group_pix);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_pix_code_for_group IS 'Get Pix code for a group. Priority: athletic (parent) > group itself.';

-- Function: Check if user can manage group (considering hierarchy)
CREATE OR REPLACE FUNCTION can_manage_group(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  is_group_admin BOOLEAN;
  is_athletic_admin BOOLEAN;
  parent_id UUID;
BEGIN
  -- Check if user is admin of the group
  SELECT EXISTS(
    SELECT 1
    FROM group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND role = 'admin'
      AND is_active = TRUE
  ) INTO is_group_admin;
  
  IF is_group_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is admin of parent athletic
  SELECT parent_group_id INTO parent_id
  FROM groups
  WHERE id = p_group_id;
  
  IF parent_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1
      FROM group_members
      WHERE group_id = parent_id
        AND user_id = p_user_id
        AND role = 'admin'
        AND is_active = TRUE
    ) INTO is_athletic_admin;
    
    IF is_athletic_admin THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_manage_group IS 'Check if user can manage a group (as admin of group or parent athletic).';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at for credit_packages
CREATE OR REPLACE FUNCTION update_credit_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_packages_updated_at();

-- =====================================================
-- VALIDATION
-- =====================================================

-- Ensure no circular references in hierarchy
CREATE OR REPLACE FUNCTION check_hierarchy_cycle()
RETURNS TRIGGER AS $$
DECLARE
  current_id UUID;
  parent_id UUID;
  depth INTEGER := 0;
BEGIN
  -- Only check if parent_group_id is being set
  IF NEW.parent_group_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Prevent self-reference
  IF NEW.parent_group_id = NEW.id THEN
    RAISE EXCEPTION 'Group cannot be its own parent';
  END IF;
  
  -- Check for cycles (max depth 10 to prevent infinite loops)
  current_id := NEW.parent_group_id;
  WHILE current_id IS NOT NULL AND depth < 10 LOOP
    SELECT parent_group_id INTO parent_id
    FROM groups
    WHERE id = current_id;
    
    IF parent_id = NEW.id THEN
      RAISE EXCEPTION 'Circular reference detected in group hierarchy';
    END IF;
    
    current_id := parent_id;
    depth := depth + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_hierarchy_cycle
  BEFORE INSERT OR UPDATE ON groups
  FOR EACH ROW
  WHEN (NEW.parent_group_id IS NOT NULL)
  EXECUTE FUNCTION check_hierarchy_cycle();

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS trigger_check_hierarchy_cycle ON groups;
-- DROP TRIGGER IF EXISTS trigger_update_credit_packages_updated_at ON credit_packages;
-- DROP FUNCTION IF EXISTS check_hierarchy_cycle();
-- DROP FUNCTION IF EXISTS update_credit_packages_updated_at();
-- DROP FUNCTION IF EXISTS can_manage_group(UUID, UUID);
-- DROP FUNCTION IF EXISTS get_pix_code_for_group(UUID);
-- DROP FUNCTION IF EXISTS add_credits(UUID, INTEGER, UUID, UUID);
-- DROP FUNCTION IF EXISTS consume_credits(UUID, INTEGER, VARCHAR, UUID, UUID);
-- DROP TABLE IF EXISTS credit_transactions;
-- DROP TABLE IF EXISTS credit_packages;
-- ALTER TABLE groups DROP COLUMN IF EXISTS credits_consumed;
-- ALTER TABLE groups DROP COLUMN IF EXISTS credits_purchased;
-- ALTER TABLE groups DROP COLUMN IF EXISTS credits_balance;
-- ALTER TABLE groups DROP COLUMN IF EXISTS pix_code;
-- ALTER TABLE groups DROP COLUMN IF EXISTS group_type;
-- ALTER TABLE groups DROP COLUMN IF EXISTS parent_group_id;
-- DROP INDEX IF EXISTS idx_groups_pix_code;
-- DROP INDEX IF EXISTS idx_groups_credits;
-- DROP INDEX IF EXISTS idx_groups_group_type;
-- DROP INDEX IF EXISTS idx_groups_parent_group_id;

