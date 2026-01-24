/**
 * Credits Middleware
 * 
 * Helper para integrar verificação de créditos em features premium.
 * 
 * Usage:
 * ```typescript
 * import { withCreditsCheck } from "@/lib/credits-middleware";
 * 
 * export async function POST(request: NextRequest) {
 *   return withCreditsCheck(
 *     request,
 *     "recurring_training",
 *     async (user, groupId) => {
 *       // Your feature logic here
 *       return NextResponse.json({ success: true });
 *     }
 *   );
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { checkAndConsumeCredits, type FeatureType } from "@/lib/credits";
import logger from "@/lib/logger";

export interface CreditsCheckOptions {
  /** Se deve consumir créditos automaticamente (default: true) */
  autoConsume?: boolean;
  /** ID do evento relacionado (opcional) */
  eventId?: string;
  /** Descrição customizada da transação */
  description?: string;
  /** Verificar se usuário é admin do grupo (default: false) */
  requireAdmin?: boolean;
}

/**
 * Wrapper para rotas que requerem créditos
 * 
 * Verifica automaticamente:
 * 1. Autenticação do usuário
 * 2. Membership no grupo
 * 3. Créditos suficientes
 * 4. Consome créditos (se autoConsume = true)
 * 
 * @param request - NextRequest
 * @param feature - Feature type (recurring_training, qrcode_checkin, etc.)
 * @param handler - Handler function que recebe (user, groupId, eventId?)
 * @param options - Opções adicionais
 */
export async function withCreditsCheck<T = any>(
  request: NextRequest,
  feature: FeatureType,
  handler: (user: any, groupId: string, eventId?: string) => Promise<NextResponse<T>>,
  options: CreditsCheckOptions = {}
): Promise<NextResponse> {
  const {
    autoConsume = true,
    eventId,
    description,
    requireAdmin = false,
  } = options;

  try {
    // 1. Authenticate user
    const user = await requireAuth();

    // 2. Get groupId from request (body or query)
    let groupId: string | null = null;
    let requestEventId: string | undefined = eventId;

    if (request.method === "GET") {
      const { searchParams } = new URL(request.url);
      groupId = searchParams.get("group_id");
      requestEventId = requestEventId || searchParams.get("event_id") || undefined;
    } else {
      const body = await request.json();
      groupId = body.groupId || body.group_id;
      requestEventId = requestEventId || body.eventId || body.event_id;
    }

    if (!groupId) {
      return NextResponse.json(
        { error: "group_id é obrigatório" },
        { status: 400 }
      );
    }

    // 3. Check membership
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // 4. Check if admin is required
    if (requireAdmin && membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem usar esta feature" },
        { status: 403 }
      );
    }

    // 5. Check and consume credits
    if (autoConsume) {
      const result = await checkAndConsumeCredits(
        groupId,
        feature,
        user.id,
        requestEventId,
        description
      );

      if (!result.success) {
        logger.warn(
          { groupId, feature, userId: user.id, error: result.error },
          "Insufficient credits for feature"
        );

        return NextResponse.json(
          {
            error: result.error || "Créditos insuficientes",
            code: "INSUFFICIENT_CREDITS",
            feature,
            required: result.newBalance, // Actually contains error info
          },
          { status: 402 } // 402 Payment Required
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

    // 6. Execute handler
    return await handler(user, groupId, requestEventId);
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    logger.error({ error, feature }, "Error in credits middleware");
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

/**
 * Verificar créditos sem consumir
 * 
 * Útil para pré-validação antes de ações complexas
 */
export async function checkCreditsOnly(
  groupId: string,
  feature: FeatureType
): Promise<{ hasCredits: boolean; required: number; current: number }> {
  const { hasEnoughCredits } = await import("@/lib/credits");
  return hasEnoughCredits(groupId, feature);
}

