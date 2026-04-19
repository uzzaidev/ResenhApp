import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { checkRateLimit, RateLimitPresets } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  const { limited } = await checkRateLimit(request, RateLimitPresets.AUTH);
  if (limited) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um momento." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const tokens = await sql`
    SELECT id, user_id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `;

  if (tokens.length === 0) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
  }

  const record = tokens[0];

  if (record.used_at) {
    return NextResponse.json({ error: "Este link já foi utilizado." }, { status: 400 });
  }

  if (new Date(record.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expirado. Solicite um novo." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await sql`
    UPDATE users SET password_hash = ${passwordHash}, updated_at = NOW()
    WHERE id = ${record.user_id}
  `;

  await sql`
    UPDATE password_reset_tokens SET used_at = NOW()
    WHERE id = ${record.id}
  `;

  return NextResponse.json({ ok: true }, { status: 200 });
}
