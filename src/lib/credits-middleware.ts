/**
 * Credits Middleware
 *
 * Helper para integrar verificacao de quota em features premium.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import {
  checkAndConsumeCredits,
  hasEnoughCredits,
  type FeatureType,
} from "@/lib/credits";
import logger from "@/lib/logger";

export interface CreditsCheckOptions {
  /** Se deve consumir quota automaticamente (default: true) */
  autoConsume?: boolean;
  /** ID do evento relacionado (opcional) */
  eventId?: string;
  /** Descricao customizada da transacao */
  description?: string;
  /** Verificar se usuario e admin do grupo (default: false) */
  requireAdmin?: boolean;
}

/**
 * Wrapper para rotas que requerem quota.
 */
export async function withCreditsCheck<T = any>(
  request: NextRequest,
  feature: FeatureType,
  handler: (
    user: any,
    groupId: string,
    eventId?: string
  ) => Promise<NextResponse<T> | NextResponse<{ error: string }>>,
  options: CreditsCheckOptions = {}
): Promise<NextResponse> {
  const { autoConsume = true, eventId, description, requireAdmin = false } = options;

  try {
    const user = await requireAuth();

    let groupId: string | null = null;
    let requestEventId: string | undefined = eventId;

    if (request.method === "GET") {
      const { searchParams } = new URL(request.url);
      groupId = searchParams.get("group_id");
      requestEventId = requestEventId || searchParams.get("event_id") || undefined;
    } else {
      try {
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        groupId = body.groupId || body.group_id;
        requestEventId = requestEventId || body.eventId || body.event_id;
      } catch {
        const { searchParams } = new URL(request.url);
        groupId = searchParams.get("group_id");
        requestEventId = requestEventId || searchParams.get("event_id") || undefined;
      }
    }

    if (!groupId) {
      return NextResponse.json({ error: "group_id e obrigatorio" }, { status: 400 });
    }

    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json({ error: "Voce nao e membro deste grupo" }, { status: 403 });
    }

    if (requireAdmin && membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem usar esta feature" },
        { status: 403 }
      );
    }

    if (autoConsume) {
      const result = await checkAndConsumeCredits(
        groupId,
        feature,
        user.id,
        requestEventId,
        description
      );

      if (!result.success) {
        let requiredCredits: number | undefined;
        let currentBalance: number | undefined;

        try {
          const snapshot = await hasEnoughCredits(groupId, feature);
          requiredCredits = snapshot.required;
          currentBalance = snapshot.current;
        } catch (snapshotError) {
          logger.warn(
            { groupId, feature, userId: user.id, snapshotError },
            "Failed to fetch quota snapshot for insufficient credits response"
          );
        }

        const normalizedError = String(result.error || "Quota insuficiente").replace(
          /cr[eé]ditos?/gi,
          "quota"
        );

        logger.warn(
          { groupId, feature, userId: user.id, error: result.error },
          "Insufficient credits for feature"
        );

        return NextResponse.json(
          {
            error: normalizedError,
            code: "INSUFFICIENT_CREDITS",
            feature,
            requiredCredits,
            currentBalance,
          },
          { status: 402 }
        );
      }

      logger.info(
        {
          groupId,
          feature,
          userId: user.id,
          newBalance: result.newBalance,
        },
        "Credits consumed for feature"
      );
    }

    return await handler(user, groupId, requestEventId);
  } catch (error) {
    if (
      error instanceof Error &&
      /nao autenticado|não autenticado/i.test(error.message)
    ) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error, feature }, "Error in credits middleware");
    return NextResponse.json({ error: "Erro ao processar requisicao" }, { status: 500 });
  }
}

export async function checkCreditsOnly(
  groupId: string,
  feature: FeatureType
): Promise<{ hasCredits: boolean; required: number; current: number }> {
  return hasEnoughCredits(groupId, feature);
}
