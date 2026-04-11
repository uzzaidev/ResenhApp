import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import bcrypt from "bcryptjs";

type InviteFixture = {
  groupId: string;
  inviteCode: string;
  creatorId: string;
};

export type AuthUserFixture = {
  userId: string;
  groupId: string;
  email: string;
  password: string;
  chargeId?: string;
  eventId?: string;
};

function loadEnvVar(name: string): string | undefined {
  if (process.env[name]) {
    return process.env[name];
  }

  const envFiles = [".env.local", ".env"];
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const key = match[1];
      const value = match[2];
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  return process.env[name];
}

function getDbUrl() {
  const dbUrl = loadEnvVar("SUPABASE_DB_URL") || loadEnvVar("DATABASE_URL");
  if (!dbUrl) {
    throw new Error("SUPABASE_DB_URL/DATABASE_URL nao configurado para testes E2E.");
  }
  return dbUrl;
}

function createClient() {
  return postgres(getDbUrl(), {
    max: 1,
    ssl: "require",
    prepare: false,
    connect_timeout: 15,
    idle_timeout: 10,
  });
}

export async function createInviteFixture(prefix = "e2e"): Promise<InviteFixture> {
  const sql = createClient();
  try {
    const creatorRows = await sql<{ id: string }[]>`
      SELECT id
      FROM users
      ORDER BY created_at ASC
      LIMIT 1
    `;

    const creatorId = creatorRows[0]?.id;
    if (!creatorId) {
      throw new Error("Nenhum usuario disponivel para criar fixture de convite.");
    }

    const now = Date.now();
    const groupRows = await sql<{ id: string }[]>`
      INSERT INTO groups (name, description, privacy, created_by)
      VALUES (
        ${`E2E ${prefix} ${now}`},
        ${"Grupo de smoke test onboarding"},
        'private',
        ${creatorId}::UUID
      )
      RETURNING id
    `;
    const groupId = groupRows[0].id;

    await sql`
      INSERT INTO group_members (user_id, group_id, role)
      VALUES (${creatorId}::UUID, ${groupId}::UUID, 'admin')
    `;

    const inviteCode = `E2E${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await sql`
      INSERT INTO invites (group_id, code, created_by, max_uses, used_count, expires_at)
      VALUES (
        ${groupId}::UUID,
        ${inviteCode},
        ${creatorId}::UUID,
        50,
        0,
        ${expiresAt.toISOString()}
      )
    `;

    return { groupId, inviteCode, creatorId };
  } finally {
    await sql.end();
  }
}

export async function cleanupInviteFixture(groupId: string, userEmail?: string): Promise<void> {
  const sql = createClient();
  try {
    await sql`DELETE FROM groups WHERE id = ${groupId}::UUID`;

    if (userEmail) {
      await sql`DELETE FROM users WHERE email = ${userEmail.toLowerCase()}`;
    }
  } finally {
    await sql.end();
  }
}

export async function createAuthUserFixture(
  prefix = "auth",
  options?: { withPendingCharge?: boolean; withUpcomingEvent?: boolean }
): Promise<AuthUserFixture> {
  const sql = createClient();
  try {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `e2e-${prefix}-${unique}@example.com`;
    const password = "password123";
    const passwordHash = await bcrypt.hash(password, 10);

    const userRows = await sql<{ id: string }[]>`
      INSERT INTO users (name, email, password_hash, onboarding_completed)
      VALUES (${`E2E ${prefix} ${unique}`}, ${email}, ${passwordHash}, TRUE)
      RETURNING id
    `;
    const userId = userRows[0]?.id;

    if (!userId) {
      throw new Error("Nao foi possivel criar usuario de fixture E2E.");
    }

    try {
      await sql`
        UPDATE users
        SET onboarding_modalities = '["Futsal"]'::jsonb
        WHERE id = ${userId}::UUID
      `;
    } catch (error: any) {
      // Compatibilidade com bancos que ainda nao tem onboarding_modalities.
      if (error?.code !== "42703") {
        throw error;
      }
    }

    const groupRows = await sql<{ id: string }[]>`
      INSERT INTO groups (name, description, privacy, created_by)
      VALUES (
        ${`E2E Grupo ${prefix} ${unique}`},
        ${"Grupo de fixture para login E2E"},
        'private',
        ${userId}::UUID
      )
      RETURNING id
    `;
    const groupId = groupRows[0]?.id;

    if (!groupId) {
      throw new Error("Nao foi possivel criar grupo de fixture E2E.");
    }

    await sql`
      INSERT INTO group_members (user_id, group_id, role)
      VALUES (${userId}::UUID, ${groupId}::UUID, 'admin')
      ON CONFLICT (user_id, group_id) DO NOTHING
    `;

    let eventId: string | undefined;
    if (options?.withUpcomingEvent) {
      const eventRows = await sql<{ id: string }[]>`
        INSERT INTO events (group_id, starts_at, status)
        VALUES (
          ${groupId}::UUID,
          NOW() + INTERVAL '2 days',
          'scheduled'
        )
        RETURNING id
      `;
      eventId = eventRows[0]?.id;
    }

    let chargeId: string | undefined;
    if (options?.withPendingCharge) {
      const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const chargeRows = await sql<{ id: string }[]>`
        INSERT INTO charges (
          group_id,
          user_id,
          type,
          amount_cents,
          due_date,
          status,
          pix_payload,
          qr_image_url,
          pix_generated_at
        )
        VALUES (
          ${groupId}::UUID,
          ${userId}::UUID,
          'other',
          2500,
          ${dueDate},
          'pending',
          ${`e2e-pix-${unique}`},
          ${`https://example.com/e2e-qr-${unique}.png`},
          NOW()
        )
        RETURNING id
      `;
      chargeId = chargeRows[0]?.id;
    }

    return { userId, groupId, email, password, chargeId, eventId };
  } finally {
    await sql.end();
  }
}

export async function cleanupAuthUserFixture(fixture: AuthUserFixture): Promise<void> {
  const sql = createClient();
  try {
    await sql`DELETE FROM groups WHERE id = ${fixture.groupId}::UUID`;
    await sql`DELETE FROM users WHERE id = ${fixture.userId}::UUID`;
  } finally {
    await sql.end();
  }
}
