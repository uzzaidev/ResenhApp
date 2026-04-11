import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import logger from "@/lib/logger";
import { checkRateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { ensureUserReferralCode, registerSignupReferral } from "@/lib/referrals";

const signupSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
  referralCode: z.string().trim().min(3).max(32).optional(),
});

export async function POST(request: NextRequest) {
  let requestBody: any = null;

  try {
    const rateLimit = await checkRateLimit(request, RateLimitPresets.AUTH);
    if (rateLimit.limited) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${retryAfter} segundos.` },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": RateLimitPresets.AUTH.maxRequests.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    requestBody = body;
    const { name, email, password, referralCode } = signupSchema.parse(body);

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email ja cadastrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let inserted;
    try {
      inserted = await sql`
        INSERT INTO users (name, email, password_hash, onboarding_completed)
        VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, FALSE)
        RETURNING id, name, email
      `;
    } catch (insertError: any) {
      if (insertError?.code === "42703") {
        inserted = await sql`
          INSERT INTO users (name, email, password_hash)
          VALUES (${name}, ${email.toLowerCase()}, ${passwordHash})
          RETURNING id, name, email
        `;
      } else {
        throw insertError;
      }
    }

    const user = inserted[0] as { id: string; name: string; email: string };
    const createdReferralCode = await ensureUserReferralCode(sql, user.id, user.name);
    const referral = referralCode
      ? await registerSignupReferral(sql, user.id, referralCode)
      : { linked: false, deferred: false };

    logger.info({ userId: user.id }, "Novo usuario criado");

    return NextResponse.json(
      {
        success: true,
        user,
        referral: {
          code: createdReferralCode,
          linked: referral.linked,
          deferred: referral.deferred,
          reason: referral.reason,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    if (error?.code === "23505") {
      return NextResponse.json({ error: "Email ja cadastrado" }, { status: 400 });
    }

    logger.error(
      {
        error: {
          name: error?.constructor?.name || "Unknown",
          message: error?.message || "No message",
          code: error?.code,
          detail: error?.detail,
        },
        context: {
          email: requestBody?.email,
          name: requestBody?.name,
          hasPassword: !!requestBody?.password,
        },
      },
      "Erro ao criar usuario"
    );

    const message = error?.message
      ? `Erro: ${error.message}`
      : "Erro ao criar conta. Verifique os logs.";

    return NextResponse.json(
      { error: message, debug: error?.code || error?.constructor?.name },
      { status: 500 }
    );
  }
}
