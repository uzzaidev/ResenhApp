import logger from "@/lib/logger";
import type { CanonicalGroupType } from "@/lib/group-type";
import { GROUP_CREATION_COSTS } from "@/lib/credits-config";

const CREATION_COST: Record<CanonicalGroupType, number> = GROUP_CREATION_COSTS;

type SqlLike = any;

export function getGroupCreationCost(groupType: CanonicalGroupType): number {
  return CREATION_COST[groupType] ?? 0;
}

async function hasUserWalletSchema(db: SqlLike): Promise<boolean> {
  const tableCheck = await db<{ exists: string | null }[]>`
    SELECT to_regclass('public.user_wallets')::TEXT AS exists
  `;
  return Boolean(tableCheck[0]?.exists);
}

export async function ensureCreditsForGroupCreation(
  db: SqlLike,
  userId: string,
  groupType: CanonicalGroupType
): Promise<{
  allowed: boolean;
  required: number;
  balance?: number;
  deferred: boolean;
  reason?: string;
}> {
  const required = getGroupCreationCost(groupType);
  if (required <= 0) {
    return { allowed: true, required, deferred: false, balance: 0 };
  }

  const walletSchemaReady = await hasUserWalletSchema(db);
  if (!walletSchemaReady) {
    return {
      allowed: true,
      required,
      deferred: true,
      reason: "user_wallets schema not available yet",
    };
  }

  const wallet = await db<{ balance: number }[]>`
    SELECT balance::INTEGER AS balance
    FROM user_wallets
    WHERE user_id = ${userId}::UUID
    LIMIT 1
  `;

  const balance = wallet[0]?.balance ?? 0;
  if (balance < required) {
    return {
      allowed: false,
      required,
      balance,
      deferred: false,
      reason: "Créditos insuficientes para criação",
    };
  }

  return { allowed: true, required, balance, deferred: false };
}

export async function consumeCreditsForGroupCreation(
  db: SqlLike,
  userId: string,
  groupType: CanonicalGroupType
): Promise<{ charged: boolean; amount: number; deferred: boolean }> {
  const amount = getGroupCreationCost(groupType);
  if (amount <= 0) {
    return { charged: false, amount: 0, deferred: false };
  }

  const walletSchemaReady = await hasUserWalletSchema(db);
  if (!walletSchemaReady) {
    logger.warn(
      { userId, groupType, amount },
      "Skipping credit consumption: user_wallets schema not available"
    );
    return { charged: false, amount, deferred: true };
  }

  await db`
    UPDATE user_wallets
    SET
      balance = balance - ${amount},
      lifetime_spent = lifetime_spent + ${amount},
      updated_at = NOW()
    WHERE user_id = ${userId}::UUID
  `;

  return { charged: true, amount, deferred: false };
}
