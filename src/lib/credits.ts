/**
 * Credits System - Business Logic
 * 
 * Gerencia créditos, cupons promocionais e consumo de features premium.
 * 
 * Features:
 * - Verificação de saldo
 * - Consumo de créditos
 * - Validação de cupons
 * - Histórico de transações
 */

import { sql } from "@/db/client";
import logger from "@/lib/logger";

// =====================================================
// TYPES
// =====================================================

export type FeatureType =
  | "recurring_training"    // 5 créditos
  | "qrcode_checkin"        // 2 créditos
  | "convocation"           // 3 créditos
  | "analytics"             // 10 créditos/mês
  | "split_pix"             // 15 créditos/evento
  | "tactical_board";       // 1 crédito/salvar

export const FEATURE_COSTS: Record<FeatureType, number> = {
  recurring_training: 5,
  qrcode_checkin: 2,
  convocation: 3,
  analytics: 10,
  split_pix: 15,
  tactical_board: 1,
};

export interface CreditBalance {
  groupId: string;
  balance: number;
  purchased: number;
  consumed: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  creditsAmount: number;
  priceCents: number;
  isActive: boolean;
}

export interface CouponValidation {
  isValid: boolean;
  couponId?: string;
  discountType?: "percentage" | "fixed_credits" | "fixed_amount";
  discountValue?: number;
  discountApplied?: number;
  finalPriceCents?: number;
  bonusCredits?: number;
  errorMessage?: string;
}

export interface CreditTransaction {
  id: string;
  groupId: string;
  transactionType: "purchase" | "consumption" | "refund";
  amount: number;
  description?: string;
  featureUsed?: FeatureType;
  eventId?: string;
  createdBy: string;
  createdAt: Date;
}

// =====================================================
// BALANCE OPERATIONS
// =====================================================

/**
 * Get credit balance for a group
 */
export async function getCreditBalance(groupId: string): Promise<CreditBalance | null> {
  try {
    const result = await sql`
      SELECT 
        id as "groupId",
        credits_balance as balance,
        credits_purchased as purchased,
        credits_consumed as consumed
      FROM groups
      WHERE id = ${groupId}
    `;

    if (!result || result.length === 0) {
      return null;
    }

    return result[0] as CreditBalance;
  } catch (error) {
    logger.error({ error, groupId }, "Error getting credit balance");
    throw error;
  }
}

/**
 * Check if group has enough credits for a feature
 */
export async function hasEnoughCredits(
  groupId: string,
  feature: FeatureType
): Promise<{ hasCredits: boolean; required: number; current: number }> {
  const required = FEATURE_COSTS[feature];
  const balance = await getCreditBalance(groupId);

  if (!balance) {
    return { hasCredits: false, required, current: 0 };
  }

  return {
    hasCredits: balance.balance >= required,
    required,
    current: balance.balance,
  };
}

// =====================================================
// CREDIT CONSUMPTION
// =====================================================

/**
 * Check and consume credits for a feature
 * Returns true if successful, false if insufficient credits
 */
export async function checkAndConsumeCredits(
  groupId: string,
  feature: FeatureType,
  userId: string,
  eventId?: string,
  description?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const cost = FEATURE_COSTS[feature];

  try {
    // Call SQL function to consume credits (atomic operation)
    const result = await sql`
      SELECT consume_credits(
        ${groupId}::UUID,
        ${cost}::INTEGER,
        ${feature}::VARCHAR(50),
        ${userId}::UUID,
        ${eventId || null}::UUID,
        ${description || `Uso de feature: ${feature}`}::TEXT
      ) as new_balance
    `;

    if (!result || result.length === 0) {
      return {
        success: false,
        newBalance: 0,
        error: "Erro ao consumir créditos",
      };
    }

    const newBalance = result[0].new_balance;

    if (newBalance === null) {
      return {
        success: false,
        newBalance: 0,
        error: "Créditos insuficientes",
      };
    }

    logger.info(
      { groupId, feature, cost, newBalance, userId },
      "Credits consumed successfully"
    );

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    logger.error({ error, groupId, feature }, "Error consuming credits");
    return {
      success: false,
      newBalance: 0,
      error: "Erro ao consumir créditos",
    };
  }
}

// =====================================================
// CREDIT PACKAGES
// =====================================================

/**
 * Get available credit packages
 */
export async function getCreditPackages(): Promise<CreditPackage[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        credits_amount as "creditsAmount",
        price_cents as "priceCents",
        is_active as "isActive"
      FROM credit_packages
      WHERE is_active = TRUE
      ORDER BY credits_amount ASC
    `;

    return result as CreditPackage[];
  } catch (error) {
    logger.error({ error }, "Error getting credit packages");
    throw error;
  }
}

// =====================================================
// COUPON OPERATIONS
// =====================================================

/**
 * Validate promotional coupon
 */
export async function validateCoupon(
  code: string,
  groupId: string,
  packagePriceCents?: number
): Promise<CouponValidation> {
  try {
    const result = await sql`
      SELECT * FROM validate_promo_coupon(
        ${code}::VARCHAR(50),
        ${groupId}::UUID,
        ${packagePriceCents || null}::INTEGER
      )
    `;

    if (!result || result.length === 0) {
      return {
        isValid: false,
        errorMessage: "Erro ao validar cupom",
      };
    }

    const validation = result[0];

    return {
      isValid: validation.is_valid,
      couponId: validation.coupon_id,
      discountType: validation.discount_type,
      discountValue: validation.discount_value,
      discountApplied: validation.discount_applied,
      finalPriceCents: validation.final_price_cents,
      bonusCredits: validation.bonus_credits,
      errorMessage: validation.error_message,
    };
  } catch (error) {
    logger.error({ error, code, groupId }, "Error validating coupon");
    return {
      isValid: false,
      errorMessage: "Erro ao validar cupom",
    };
  }
}

/**
 * Apply coupon after purchase
 */
export async function applyCoupon(
  couponId: string,
  groupId: string,
  transactionId: string,
  discountApplied: number,
  userId: string
): Promise<string | null> {
  try {
    const result = await sql`
      SELECT apply_promo_coupon(
        ${couponId}::UUID,
        ${groupId}::UUID,
        ${transactionId}::UUID,
        ${discountApplied}::INTEGER,
        ${userId}::UUID
      ) as usage_id
    `;

    if (!result || result.length === 0) {
      return null;
    }

    logger.info(
      { couponId, groupId, transactionId, userId },
      "Coupon applied successfully"
    );

    return result[0].usage_id;
  } catch (error) {
    logger.error({ error, couponId, groupId }, "Error applying coupon");
    return null;
  }
}

/**
 * Get coupon usage history for a group
 */
export async function getCouponHistory(groupId: string) {
  try {
    const result = await sql`
      SELECT * FROM get_group_coupon_history(${groupId}::UUID)
    `;

    return result.map((row) => ({
      couponCode: row.coupon_code,
      couponDescription: row.coupon_description,
      discountApplied: row.discount_applied,
      usedAt: row.used_at,
      usedByName: row.used_by_name,
    }));
  } catch (error) {
    logger.error({ error, groupId }, "Error getting coupon history");
    return [];
  }
}

// =====================================================
// PURCHASE OPERATIONS
// =====================================================

/**
 * Purchase credits (with optional coupon)
 * Returns transaction ID if successful
 */
export async function purchaseCredits(
  groupId: string,
  packageId: string,
  userId: string,
  couponCode?: string
): Promise<{
  success: boolean;
  transactionId?: string;
  creditsAdded?: number;
  bonusCredits?: number;
  finalPrice?: number;
  error?: string;
}> {
  try {
    // Get package details
    const packageResult = await sql`
      SELECT * FROM credit_packages WHERE id = ${packageId} AND is_active = TRUE
    `;

    if (!packageResult || packageResult.length === 0) {
      return { success: false, error: "Pacote não encontrado" };
    }

    const pkg = packageResult[0];
    let finalPrice = pkg.price_cents;
    let bonusCredits = 0;
    let couponValidation: CouponValidation | null = null;

    // Validate coupon if provided
    if (couponCode) {
      couponValidation = await validateCoupon(couponCode, groupId, pkg.price_cents);

      if (!couponValidation.isValid) {
        return {
          success: false,
          error: couponValidation.errorMessage || "Cupom inválido",
        };
      }

      finalPrice = couponValidation.finalPriceCents || pkg.price_cents;
      bonusCredits = couponValidation.bonusCredits || 0;
    }

    // Add credits using SQL function
    const addResult = await sql`
      SELECT add_credits(
        ${groupId}::UUID,
        ${pkg.credits_amount}::INTEGER,
        ${userId}::UUID,
        ${`Compra de pacote: ${pkg.name}`}::TEXT
      ) as new_balance
    `;

    if (!addResult || addResult.length === 0) {
      return { success: false, error: "Erro ao adicionar créditos" };
    }

    // Get transaction ID (last credit_transaction for this group)
    const transactionResult = await sql`
      SELECT id FROM credit_transactions
      WHERE group_id = ${groupId} AND transaction_type = 'purchase'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const transactionId = transactionResult[0]?.id;

    // Apply bonus credits if coupon provides them
    if (bonusCredits > 0) {
      await sql`
        SELECT add_credits(
          ${groupId}::UUID,
          ${bonusCredits}::INTEGER,
          ${userId}::UUID,
          ${`Bônus do cupom: ${couponCode}`}::TEXT
        )
      `;
    }

    // Apply coupon if validated
    if (couponValidation?.isValid && couponValidation.couponId && transactionId) {
      await applyCoupon(
        couponValidation.couponId,
        groupId,
        transactionId,
        couponValidation.discountApplied || 0,
        userId
      );
    }

    logger.info(
      {
        groupId,
        packageId,
        userId,
        creditsAdded: pkg.credits_amount,
        bonusCredits,
        finalPrice,
        couponCode,
      },
      "Credits purchased successfully"
    );

    return {
      success: true,
      transactionId,
      creditsAdded: pkg.credits_amount,
      bonusCredits,
      finalPrice,
    };
  } catch (error) {
    logger.error({ error, groupId, packageId }, "Error purchasing credits");
    return { success: false, error: "Erro ao comprar créditos" };
  }
}

// =====================================================
// TRANSACTION HISTORY
// =====================================================

/**
 * Get credit transaction history for a group
 */
export async function getCreditTransactions(
  groupId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        group_id as "groupId",
        transaction_type as "transactionType",
        amount,
        description,
        feature_used as "featureUsed",
        event_id as "eventId",
        created_by as "createdBy",
        created_at as "createdAt"
      FROM credit_transactions
      WHERE group_id = ${groupId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result as CreditTransaction[];
  } catch (error) {
    logger.error({ error, groupId }, "Error getting credit transactions");
    return [];
  }
}

