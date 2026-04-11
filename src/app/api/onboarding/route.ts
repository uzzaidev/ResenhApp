import { NextRequest, NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import {
  completeOnboardingAndProcessReferral,
  ensureUserReferralCode,
  referralsSchemaReady,
} from "@/lib/referrals";

function parseStoredModalities(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function GET() {
  try {
    const user = await requireAuth();
    const ready = await referralsSchemaReady(sql);
    if (!ready) {
      return NextResponse.json({
        deferred: true,
        schemaReady: false,
        onboardingCompleted: false,
      });
    }

    let row:
      | {
          onboarding_completed: boolean;
          referral_code: string | null;
          onboarding_modalities?: unknown;
        }
      | undefined;

    try {
      const result = await sql<
        {
          onboarding_completed: boolean;
          referral_code: string | null;
          onboarding_modalities: unknown;
        }[]
      >`
        SELECT onboarding_completed, referral_code, onboarding_modalities
        FROM users
        WHERE id = ${user.id}::UUID
        LIMIT 1
      `;
      row = result[0];
    } catch (columnError: any) {
      if (columnError?.code === "42703") {
        const fallback = await sql<{ onboarding_completed: boolean; referral_code: string | null }[]>`
          SELECT onboarding_completed, referral_code
          FROM users
          WHERE id = ${user.id}::UUID
          LIMIT 1
        `;
        row = fallback[0];
      } else {
        throw columnError;
      }
    }

    const onboardingModalities = parseStoredModalities(row?.onboarding_modalities);
    const referralCode =
      row?.referral_code || (await ensureUserReferralCode(sql, user.id, user.name));

    return NextResponse.json({
      deferred: false,
      schemaReady: true,
      onboardingCompleted: Boolean(row?.onboarding_completed),
      onboardingModalities,
      referralCode,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching onboarding status");
    return NextResponse.json(
      { error: "Erro ao buscar onboarding" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ready = await referralsSchemaReady(sql);
    if (!ready) {
      return NextResponse.json(
        {
          deferred: true,
          schemaReady: false,
          error: "Migration pendente para onboarding/referral",
        },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const complete = body.complete !== false;
    if (!complete) {
      return NextResponse.json({ ok: true, changed: false });
    }

    const groupMembershipCount = await sql<{ count: number }[]>`
      SELECT COUNT(*)::INTEGER as count
      FROM group_members
      WHERE user_id = ${user.id}::UUID
    `;
    const hasGroup = Number(groupMembershipCount[0]?.count || 0) > 0;
    if (!hasGroup) {
      return NextResponse.json(
        { error: "Voce precisa criar ou entrar em um grupo antes de concluir." },
        { status: 400 }
      );
    }

    let hasModalities = false;
    try {
      const modalityQuery = await sql<{ onboarding_modalities: unknown }[]>`
        SELECT onboarding_modalities
        FROM users
        WHERE id = ${user.id}::UUID
        LIMIT 1
      `;
      hasModalities = parseStoredModalities(modalityQuery[0]?.onboarding_modalities).length > 0;
    } catch (columnError: any) {
      if (columnError?.code === "42703") {
        // Compatibility mode while onboarding_modalities migration is pending.
        hasModalities = true;
      } else {
        throw columnError;
      }
    }

    if (!hasModalities) {
      return NextResponse.json(
        { error: "Selecione ao menos uma modalidade para concluir o onboarding." },
        { status: 400 }
      );
    }

    const completion = await completeOnboardingAndProcessReferral(sql, user.id);
    if (!completion.completed && !completion.deferred) {
      return NextResponse.json(
        { error: completion.reason || "Falha ao concluir onboarding" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      onboardingCompleted: completion.completed,
      referralRewarded: completion.rewarded,
      deferred: completion.deferred,
      reason: completion.reason,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error updating onboarding status");
    return NextResponse.json(
      { error: "Erro ao atualizar onboarding" },
      { status: 500 }
    );
  }
}

