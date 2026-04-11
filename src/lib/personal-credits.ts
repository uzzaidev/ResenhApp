type SqlLike = any;

export interface PersonalWallet {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface CreditHistoryItem {
  id: string;
  amount: number;
  direction: "earn" | "spend";
  actionType: string;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

async function tableExists(db: SqlLike, tableName: string): Promise<boolean> {
  const result = await db<{ exists: string | null }[]>`
    SELECT to_regclass(${`public.${tableName}`})::TEXT AS exists
  `;
  return Boolean(result[0]?.exists);
}

export async function personalCreditsSchemaReady(db: SqlLike): Promise<boolean> {
  const checks = await Promise.all([
    tableExists(db, "user_wallets"),
    tableExists(db, "user_credit_transactions"),
  ]);
  return checks.every(Boolean);
}

export async function getOrInitPersonalWallet(
  db: SqlLike,
  userId: string
): Promise<PersonalWallet | null> {
  await db`
    INSERT INTO user_wallets (user_id)
    VALUES (${userId}::UUID)
    ON CONFLICT (user_id) DO NOTHING
  `;

  const wallet = await db<{
    balance: number;
    lifetime_earned: number;
    lifetime_spent: number;
  }[]>`
    SELECT
      balance::INTEGER AS balance,
      lifetime_earned::INTEGER AS lifetime_earned,
      lifetime_spent::INTEGER AS lifetime_spent
    FROM user_wallets
    WHERE user_id = ${userId}::UUID
    LIMIT 1
  `;

  const row = wallet[0];
  if (!row) return null;

  return {
    balance: Number(row.balance || 0),
    lifetimeEarned: Number(row.lifetime_earned || 0),
    lifetimeSpent: Number(row.lifetime_spent || 0),
  };
}

export async function getPersonalCreditHistory(
  db: SqlLike,
  userId: string,
  limit: number
): Promise<CreditHistoryItem[]> {
  const rows = await db<{
    id: string;
    amount: number;
    direction: "earn" | "spend";
    action_type: string;
    description: string | null;
    reference_id: string | null;
    created_at: string;
  }[]>`
    SELECT
      id::TEXT AS id,
      amount::INTEGER AS amount,
      direction,
      action_type,
      description,
      reference_id,
      created_at::TEXT AS created_at
    FROM user_credit_transactions
    WHERE user_id = ${userId}::UUID
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return rows.map((row: {
    id: string;
    amount: number;
    direction: "earn" | "spend";
    action_type: string;
    description: string | null;
    reference_id: string | null;
    created_at: string;
  }) => ({
    id: row.id,
    amount: Number(row.amount || 0),
    direction: row.direction,
    actionType: row.action_type,
    description: row.description,
    referenceId: row.reference_id,
    createdAt: row.created_at,
  }));
}
