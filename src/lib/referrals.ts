import logger from "@/lib/logger";
import { earnCredits } from "@/lib/credit-earning";

type SqlLike = any;

async function tableExists(db: SqlLike, tableName: string): Promise<boolean> {
  const result = await db<{ exists: string | null }[]>`
    SELECT to_regclass(${`public.${tableName}`})::TEXT AS exists
  `;
  return Boolean(result[0]?.exists);
}

async function columnExists(
  db: SqlLike,
  tableName: string,
  columnName: string
): Promise<boolean> {
  const result = await db<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
    ) AS exists
  `;
  return Boolean(result[0]?.exists);
}

export async function referralsSchemaReady(db: SqlLike): Promise<boolean> {
  const checks = await Promise.all([
    tableExists(db, "users"),
    tableExists(db, "referrals"),
    columnExists(db, "users", "referral_code"),
    columnExists(db, "users", "referred_by"),
    columnExists(db, "users", "onboarding_completed"),
  ]);
  return checks.every(Boolean);
}

export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 32);
}

function buildReferralCodeSeed(name: string | null | undefined): string {
  const base = (name || "PLAYER")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return base || "PLAYER";
}

export async function ensureUserReferralCode(
  db: SqlLike,
  userId: string,
  userName?: string | null
): Promise<string | null> {
  try {
    const ready = await referralsSchemaReady(db);
    if (!ready) return null;

    const current = await db<{ referral_code: string | null; name: string | null }[]>`
      SELECT referral_code, name
      FROM users
      WHERE id = ${userId}::UUID
      LIMIT 1
    `;
    if (current.length === 0) return null;

    const existing = current[0]?.referral_code;
    if (existing) return existing;

    const nameSeed = buildReferralCodeSeed(userName ?? current[0]?.name);
    const generated = normalizeReferralCode(
      `${nameSeed}_${Math.random().toString(36).slice(2, 8)}`
    );

    const updated = await db<{ referral_code: string }[]>`
      UPDATE users
      SET referral_code = ${generated}
      WHERE id = ${userId}::UUID
      RETURNING referral_code
    `;
    return updated[0]?.referral_code ?? null;
  } catch (error) {
    logger.error({ error, userId }, "Error ensuring user referral code");
    return null;
  }
}

export async function registerSignupReferral(
  db: SqlLike,
  referredUserId: string,
  referralCodeRaw: string
): Promise<{ linked: boolean; deferred: boolean; reason?: string }> {
  try {
    const ready = await referralsSchemaReady(db);
    if (!ready) {
      return { linked: false, deferred: true, reason: "Referral schema not ready" };
    }

    const referralCode = normalizeReferralCode(referralCodeRaw);
    if (!referralCode) {
      return { linked: false, deferred: false, reason: "Invalid referral code" };
    }

    const referrerQuery = await db<{ id: string }[]>`
      SELECT id
      FROM users
      WHERE referral_code = ${referralCode}
      LIMIT 1
    `;
    const referrer = referrerQuery[0];
    if (!referrer || referrer.id === referredUserId) {
      return { linked: false, deferred: false, reason: "Referrer not found" };
    }

    await db.begin(async (tx: SqlLike) => {
      await tx`
        UPDATE users
        SET referred_by = ${referrer.id}::UUID
        WHERE id = ${referredUserId}::UUID
      `;

      await tx`
        INSERT INTO referrals (referrer_id, referred_id, referral_code, status)
        VALUES (${referrer.id}::UUID, ${referredUserId}::UUID, ${referralCode}, 'pending')
        ON CONFLICT (referred_id)
        DO NOTHING
      `;
    });

    return { linked: true, deferred: false };
  } catch (error) {
    logger.error({ error, referredUserId }, "Error registering signup referral");
    return { linked: false, deferred: false, reason: "Failed to register referral" };
  }
}

export async function completeOnboardingAndProcessReferral(
  db: SqlLike,
  userId: string
): Promise<{ completed: boolean; rewarded: boolean; deferred: boolean; reason?: string }> {
  try {
    const ready = await referralsSchemaReady(db);
    if (!ready) {
      return { completed: false, rewarded: false, deferred: true, reason: "Referral schema not ready" };
    }

    await db`
      UPDATE users
      SET onboarding_completed = TRUE, updated_at = NOW()
      WHERE id = ${userId}::UUID
    `;

    const referralRows = await db<{ id: string; referrer_id: string; status: string }[]>`
      SELECT id, referrer_id, status
      FROM referrals
      WHERE referred_id = ${userId}::UUID
      LIMIT 1
    `;
    const referral = referralRows[0];
    if (!referral) {
      return { completed: true, rewarded: false, deferred: false };
    }

    if (referral.status === "rewarded") {
      return { completed: true, rewarded: true, deferred: false };
    }

    await db`
      UPDATE referrals
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${referral.id}::UUID
        AND status = 'pending'
    `;

    const earning = await earnCredits(db, referral.referrer_id, "invite_friend", referral.id);
    if (earning.awarded) {
      await db`
        UPDATE referrals
        SET status = 'rewarded'
        WHERE id = ${referral.id}::UUID
      `;
      return { completed: true, rewarded: true, deferred: false };
    }

    return {
      completed: true,
      rewarded: false,
      deferred: Boolean(earning.deferred),
      reason: earning.reason,
    };
  } catch (error) {
    logger.error({ error, userId }, "Error completing onboarding/referral");
    return { completed: false, rewarded: false, deferred: false, reason: "Failed to complete onboarding" };
  }
}
