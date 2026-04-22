import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/client";
import { Resend } from "resend";
import { z } from "zod";
import crypto from "crypto";
import { checkRateLimit, RateLimitPresets } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { limited } = await checkRateLimit(request, RateLimitPresets.AUTH);
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde um momento." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const { email } = parsed.data;

    const users = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[FORGOT_PASSWORD] RESEND_API_KEY não configurada.");
      return NextResponse.json(
        { error: "Serviço de recuperação indisponível no momento." },
        { status: 503 }
      );
    }

    const userId = users[0].id;
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql`
      DELETE FROM password_reset_tokens WHERE user_id = ${userId}
    `;

    await sql`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, ${expiresAt})
    `;

    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@resenhafc.com.br",
      to: email,
      subject: "Recuperação de senha - ResenhaFC",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1a3a2a;">Recuperação de senha</h2>
          <p>Você solicitou a redefinição de senha da sua conta ResenhaFC.</p>
          <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
          <a href="${resetUrl}"
            style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Redefinir senha
          </a>
          <p style="color: #666; font-size: 13px;">Se você não solicitou isso, ignore este email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">ResenhaFC &mdash; Organize seus treinos de forma profissional</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[FORGOT_PASSWORD] Erro ao processar recuperação de senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar recuperação de senha." },
      { status: 500 }
    );
  }
}
