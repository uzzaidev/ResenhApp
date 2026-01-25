-- =====================================================
-- Migration: Promotional Coupons System
-- Version: 2.0
-- Date: 2026-02-27
-- Description: Add promotional coupons for credit purchases
-- =====================================================

-- =====================================================
-- PROMOTIONAL COUPONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Coupon details
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  
  -- Discount configuration
  discount_type VARCHAR(20) NOT NULL 
    CHECK (discount_type IN ('percentage', 'fixed_credits', 'fixed_amount')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  
  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  max_uses_per_group INTEGER DEFAULT 1, -- NULL = unlimited per group
  current_uses INTEGER DEFAULT 0,
  
  -- Validity period
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_promo_coupons_code ON promo_coupons(code) WHERE is_active = TRUE;
CREATE INDEX idx_promo_coupons_active ON promo_coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_promo_coupons_valid_until ON promo_coupons(valid_until) WHERE valid_until IS NOT NULL;

COMMENT ON TABLE promo_coupons IS 'Promotional coupons for credit purchases';
COMMENT ON COLUMN promo_coupons.discount_type IS 'Type: percentage (10 = 10%), fixed_credits (100 = +100 credits), fixed_amount (1000 = -R$10.00)';
COMMENT ON COLUMN promo_coupons.max_uses IS 'Maximum total uses across all groups. NULL = unlimited';
COMMENT ON COLUMN promo_coupons.max_uses_per_group IS 'Maximum uses per group. Default 1 = single use per group';

-- =====================================================
-- COUPON USAGE TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  coupon_id UUID NOT NULL REFERENCES promo_coupons(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES credit_transactions(id) ON DELETE SET NULL,
  
  -- Discount applied
  discount_applied INTEGER NOT NULL, -- Credits or cents discounted
  
  -- Audit
  used_by UUID NOT NULL REFERENCES profiles(id),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one coupon per group (if max_uses_per_group = 1)
  UNIQUE(coupon_id, group_id)
);

-- Indexes
CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_group_id ON coupon_usages(group_id);
CREATE INDEX idx_coupon_usages_used_at ON coupon_usages(used_at DESC);

COMMENT ON TABLE coupon_usages IS 'Track coupon usage per group';
COMMENT ON COLUMN coupon_usages.discount_applied IS 'Actual discount applied (credits or cents)';

-- =====================================================
-- FUNCTION: Validate Coupon
-- =====================================================

CREATE OR REPLACE FUNCTION validate_promo_coupon(
  p_code VARCHAR(50),
  p_group_id UUID,
  p_package_price_cents INTEGER DEFAULT NULL
)
RETURNS TABLE(
  is_valid BOOLEAN,
  coupon_id UUID,
  discount_type VARCHAR(20),
  discount_value INTEGER,
  discount_applied INTEGER,
  final_price_cents INTEGER,
  bonus_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_usage_count INTEGER;
  v_group_usage_count INTEGER;
  v_discount_applied INTEGER := 0;
  v_final_price INTEGER := p_package_price_cents;
  v_bonus_credits INTEGER := 0;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM promo_coupons
  WHERE code = p_code AND is_active = TRUE;
  
  -- Check if coupon exists
  IF v_coupon.id IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, NULL::UUID, NULL::VARCHAR(20), NULL::INTEGER, 
      0, p_package_price_cents, 0, 'Cupom não encontrado ou inativo'::TEXT;
    RETURN;
  END IF;
  
  -- Check validity period
  IF v_coupon.valid_from > NOW() THEN
    RETURN QUERY SELECT 
      FALSE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value,
      0, p_package_price_cents, 0, 'Cupom ainda não está válido'::TEXT;
    RETURN;
  END IF;
  
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
    RETURN QUERY SELECT 
      FALSE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value,
      0, p_package_price_cents, 0, 'Cupom expirado'::TEXT;
    RETURN;
  END IF;
  
  -- Check max uses (global)
  IF v_coupon.max_uses IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usage_count FROM coupon_usages WHERE coupon_id = v_coupon.id;
    IF v_usage_count >= v_coupon.max_uses THEN
      RETURN QUERY SELECT 
        FALSE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value,
        0, p_package_price_cents, 0, 'Cupom esgotado (limite global atingido)'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Check max uses per group
  IF v_coupon.max_uses_per_group IS NOT NULL THEN
    SELECT COUNT(*) INTO v_group_usage_count 
    FROM coupon_usages 
    WHERE coupon_id = v_coupon.id AND group_id = p_group_id;
    
    IF v_group_usage_count >= v_coupon.max_uses_per_group THEN
      RETURN QUERY SELECT 
        FALSE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value,
        0, p_package_price_cents, 0, 'Cupom já utilizado por este grupo'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    -- Percentage discount on price
    IF p_package_price_cents IS NOT NULL THEN
      v_discount_applied := (p_package_price_cents * v_coupon.discount_value / 100);
      v_final_price := p_package_price_cents - v_discount_applied;
      v_final_price := GREATEST(v_final_price, 0); -- Não pode ser negativo
    END IF;
    
  ELSIF v_coupon.discount_type = 'fixed_amount' THEN
    -- Fixed amount discount (cents)
    IF p_package_price_cents IS NOT NULL THEN
      v_discount_applied := v_coupon.discount_value;
      v_final_price := p_package_price_cents - v_discount_applied;
      v_final_price := GREATEST(v_final_price, 0); -- Não pode ser negativo
    END IF;
    
  ELSIF v_coupon.discount_type = 'fixed_credits' THEN
    -- Bonus credits (no price discount)
    v_bonus_credits := v_coupon.discount_value;
    v_discount_applied := v_coupon.discount_value; -- For tracking
    v_final_price := p_package_price_cents; -- Price unchanged
  END IF;
  
  -- Return success
  RETURN QUERY SELECT 
    TRUE, 
    v_coupon.id, 
    v_coupon.discount_type, 
    v_coupon.discount_value,
    v_discount_applied,
    v_final_price,
    v_bonus_credits,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_promo_coupon IS 'Validate promotional coupon and calculate discount';

-- =====================================================
-- FUNCTION: Apply Coupon
-- =====================================================

CREATE OR REPLACE FUNCTION apply_promo_coupon(
  p_coupon_id UUID,
  p_group_id UUID,
  p_transaction_id UUID,
  p_discount_applied INTEGER,
  p_used_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Record coupon usage
  INSERT INTO coupon_usages (
    coupon_id,
    group_id,
    transaction_id,
    discount_applied,
    used_by
  ) VALUES (
    p_coupon_id,
    p_group_id,
    p_transaction_id,
    p_discount_applied,
    p_used_by
  )
  RETURNING id INTO v_usage_id;
  
  -- Increment coupon usage count
  UPDATE promo_coupons
  SET current_uses = current_uses + 1
  WHERE id = p_coupon_id;
  
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION apply_promo_coupon IS 'Record coupon usage and increment counter';

-- =====================================================
-- FUNCTION: Get Group Coupon History
-- =====================================================

CREATE OR REPLACE FUNCTION get_group_coupon_history(p_group_id UUID)
RETURNS TABLE(
  coupon_code VARCHAR(50),
  coupon_description TEXT,
  discount_applied INTEGER,
  used_at TIMESTAMPTZ,
  used_by_name VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.code,
    pc.description,
    cu.discount_applied,
    cu.used_at,
    p.name
  FROM coupon_usages cu
  INNER JOIN promo_coupons pc ON cu.coupon_id = pc.id
  INNER JOIN profiles p ON cu.used_by = p.id
  WHERE cu.group_id = p_group_id
  ORDER BY cu.used_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_group_coupon_history IS 'Get coupon usage history for a group';

-- =====================================================
-- TRIGGER: Update updated_at on promo_coupons
-- =====================================================

CREATE OR REPLACE FUNCTION update_promo_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promo_coupons_updated_at
  BEFORE UPDATE ON promo_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_coupons_updated_at();

-- =====================================================
-- INSERT SAMPLE COUPONS (for testing)
-- =====================================================

INSERT INTO promo_coupons (code, description, discount_type, discount_value, max_uses, max_uses_per_group, valid_until) VALUES
  -- Percentage discounts
  ('WELCOME10', 'Desconto de 10% na primeira compra', 'percentage', 10, NULL, 1, NULL),
  ('PROMO20', 'Desconto de 20% - Promoção de lançamento', 'percentage', 20, 100, 1, NOW() + INTERVAL '30 days'),
  
  -- Fixed amount discounts
  ('SAVE500', 'R$ 5,00 de desconto', 'fixed_amount', 500, 50, 1, NOW() + INTERVAL '15 days'),
  
  -- Bonus credits
  ('BONUS50', '+50 créditos bônus', 'fixed_credits', 50, NULL, 1, NULL),
  ('BONUS100', '+100 créditos bônus - Oferta especial', 'fixed_credits', 100, 200, 1, NOW() + INTERVAL '7 days');

COMMENT ON TABLE promo_coupons IS 'Sample coupons created for testing';


