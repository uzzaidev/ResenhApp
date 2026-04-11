import logger from "@/lib/logger";

type SqlLike = any;

export type CreditActionType =
  | "post_training_photo"
  | "react_to_post"
  | "comment_on_post"
  | "rsvp_yes"
  | "attend_event"
  | "receive_mvp"
  | "complete_profile"
  | "invite_friend"
  | "first_event_created"
  | "attendance_streak_10"
  | "achievement_unlocked";

export interface EarnCreditsResult {
  awarded: boolean;
  deferred: boolean;
  amount: number;
  reason?: string;
}

async function tableExists(db: SqlLike, tableName: string): Promise<boolean> {
  const result = await db<{ exists: string | null }[]>`
    SELECT to_regclass(${`public.${tableName}`})::TEXT AS exists
  `;
  return Boolean(result[0]?.exists);
}

async function schemaReady(db: SqlLike): Promise<boolean> {
  const checks = await Promise.all([
    tableExists(db, "user_wallets"),
    tableExists(db, "credit_earning_rules"),
    tableExists(db, "daily_credit_earnings"),
    tableExists(db, "user_credit_transactions"),
  ]);
  return checks.every(Boolean);
}

export async function earnCredits(
  db: SqlLike,
  userId: string,
  actionType: CreditActionType,
  referenceId?: string | number | null
): Promise<EarnCreditsResult> {
  try {
    const ready = await schemaReady(db);
    if (!ready) {
      return {
        awarded: false,
        deferred: true,
        amount: 0,
        reason: "Credit earning schema not available yet",
      };
    }

    const ruleQuery = await db<{
      credits_awarded: number;
      daily_limit: number | null;
      is_active: boolean;
    }[]>`
      SELECT credits_awarded, daily_limit, is_active
      FROM credit_earning_rules
      WHERE action_type = ${actionType}
      LIMIT 1
    `;
    const rule = ruleQuery[0];
    if (!rule || !rule.is_active) {
      return {
        awarded: false,
        deferred: false,
        amount: 0,
        reason: "No active earning rule for action",
      };
    }

    const amount = Number(rule.credits_awarded || 0);
    if (amount <= 0) {
      return { awarded: false, deferred: false, amount: 0, reason: "Zero amount rule" };
    }

    const refText =
      referenceId === undefined || referenceId === null ? null : String(referenceId);

    if (refText) {
      const duplicateCheck = await db`
        SELECT 1
        FROM user_credit_transactions
        WHERE user_id = ${userId}::UUID
          AND action_type = ${actionType}
          AND reference_id = ${refText}
        LIMIT 1
      `;
      if (duplicateCheck.length > 0) {
        return {
          awarded: false,
          deferred: false,
          amount: 0,
          reason: "Already awarded for this reference",
        };
      }
    }

    if (rule.daily_limit !== null && rule.daily_limit !== undefined) {
      const daily = await db<{ used_count: number }[]>`
        SELECT COALESCE(SUM(earned_count), 0)::INTEGER AS used_count
        FROM daily_credit_earnings
        WHERE user_id = ${userId}::UUID
          AND action_type = ${actionType}
          AND date = CURRENT_DATE
      `;
      const usedCount = Number(daily[0]?.used_count || 0);
      if (usedCount >= Number(rule.daily_limit)) {
        return {
          awarded: false,
          deferred: false,
          amount: 0,
          reason: "Daily limit reached",
        };
      }
    }

    await db.begin(async (tx: SqlLike) => {
      await tx`
        UPDATE user_wallets
        SET
          balance = balance + ${amount},
          lifetime_earned = lifetime_earned + ${amount},
          updated_at = NOW()
        WHERE user_id = ${userId}::UUID
      `;

      await tx`
        INSERT INTO daily_credit_earnings (
          user_id,
          action_type,
          earned_count,
          earned_credits,
          date
        )
        VALUES (${userId}::UUID, ${actionType}, 1, ${amount}, CURRENT_DATE)
        ON CONFLICT (user_id, action_type, date)
        DO UPDATE SET
          earned_count = daily_credit_earnings.earned_count + 1,
          earned_credits = daily_credit_earnings.earned_credits + ${amount}
      `;

      await tx`
        INSERT INTO user_credit_transactions (
          user_id,
          amount,
          direction,
          action_type,
          description,
          reference_id
        )
        VALUES (
          ${userId}::UUID,
          ${amount},
          'earn',
          ${actionType},
          ${`Earned credits from ${actionType}`},
          ${refText}
        )
      `;
    });

    return { awarded: true, deferred: false, amount };
  } catch (error) {
    logger.error({ error, userId, actionType }, "Error earning credits");
    return {
      awarded: false,
      deferred: false,
      amount: 0,
      reason: "Failed to earn credits",
    };
  }
}
