import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { createInAppNotification } from "@/lib/notifications";

type Params = Promise<{ chargeId: string }>;

/**
 * POST /api/charges/:chargeId/self-report
 * Participant marks their own payment as done ("Já paguei").
 */
export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { chargeId } = await params;
    const user = await requireAuth();
    const chargeIdNum = BigInt(chargeId);

    if (!chargeIdNum || chargeIdNum <= BigInt(0)) {
      return NextResponse.json(
        { error: "ID de cobrança inválido" },
        { status: 400 }
      );
    }

    const chargeIdText = chargeIdNum.toString();

    // Preferred flow: split-level self report for the current user.
    const splitQuery = await sql`
      SELECT id, status
      FROM charge_splits
      WHERE charge_id = ${chargeIdText}::BIGINT
        AND user_id = ${user.id}
      LIMIT 1
    `;
    const split = splitQuery[0] as { id: string; status: string } | undefined;

    if (split) {
      if (split.status === "paid") {
        return NextResponse.json(
          { error: "Pagamento já foi confirmado" },
          { status: 409 }
        );
      }

      if (split.status === "self_reported") {
        return NextResponse.json({
          ok: true,
          status: "self_reported",
          alreadyReported: true,
        });
      }

      try {
        await sql`
          UPDATE charge_splits
          SET status = 'self_reported', updated_at = NOW()
          WHERE id = ${split.id}::BIGINT
        `;
      } catch (error) {
        logger.warn(
          { error, chargeId: chargeIdText, userId: user.id },
          "self_reported is not available in charge_splits yet"
        );
        return NextResponse.json(
          {
            deferred: true,
            error: "Migration pendente para status self_reported",
          },
          { status: 409 }
        );
      }

      // Best effort: keep charge-level status in sync if schema already has new fields.
      try {
        await sql`
          UPDATE charges
          SET
            status = 'self_reported',
            self_reported_at = COALESCE(self_reported_at, NOW()),
            updated_at = NOW()
          WHERE id = ${chargeIdText}::BIGINT
            AND status = 'pending'
        `;
      } catch {
        // Migration can still be pending at charge level, ignore.
      }

      const admins = await sql<{ user_id: string }[]>`
        SELECT user_id
        FROM group_members gm
        INNER JOIN charges c ON c.group_id = gm.group_id
        WHERE c.id = ${chargeIdText}::BIGINT
          AND gm.role = 'admin'
      `;
      await Promise.all(
        admins.map((admin) =>
          createInAppNotification(sql, {
            userId: admin.user_id,
            type: "payment_request",
            title: "Pagamento reportado",
            body: "Um participante marcou uma cobrança como paga. Revise para confirmar.",
            actionUrl: `/financeiro/charges/${chargeIdText}`,
            relatedType: "charge",
            relatedId: chargeIdText,
          })
        )
      );

      return NextResponse.json({ ok: true, status: "self_reported" });
    }

    // Legacy fallback: charge assigned directly to user.
    const chargeQuery = await sql`
      SELECT id, status, user_id
      FROM charges
      WHERE id = ${chargeIdText}::BIGINT
      LIMIT 1
    `;
    const charge = chargeQuery[0] as
      | { id: string; status: string; user_id?: string | null }
      | undefined;

    if (!charge) {
      return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
    }

    if (charge.user_id && charge.user_id !== user.id) {
      return NextResponse.json(
        { error: "Você só pode reportar suas próprias cobranças" },
        { status: 403 }
      );
    }

    if (charge.status === "paid") {
      return NextResponse.json(
        { error: "Pagamento já foi confirmado" },
        { status: 409 }
      );
    }

    try {
      await sql`
        UPDATE charges
        SET
          status = 'self_reported',
          self_reported_at = COALESCE(self_reported_at, NOW()),
          updated_at = NOW()
        WHERE id = ${chargeIdText}::BIGINT
      `;
    } catch (error) {
      logger.warn(
        { error, chargeId: chargeIdText, userId: user.id },
        "self_reported is not available in charges yet"
      );
      return NextResponse.json(
        {
          deferred: true,
          error: "Migration pendente para status self_reported",
        },
        { status: 409 }
      );
    }

    const admins = await sql<{ user_id: string }[]>`
      SELECT gm.user_id
      FROM group_members gm
      INNER JOIN charges c ON c.group_id = gm.group_id
      WHERE c.id = ${chargeIdText}::BIGINT
        AND gm.role = 'admin'
    `;
    await Promise.all(
      admins.map((admin) =>
        createInAppNotification(sql, {
          userId: admin.user_id,
          type: "payment_request",
          title: "Pagamento reportado",
          body: "Um participante marcou uma cobrança como paga. Revise para confirmar.",
          actionUrl: `/financeiro/charges/${chargeIdText}`,
          relatedType: "charge",
          relatedId: chargeIdText,
        })
      )
    );

    return NextResponse.json({ ok: true, status: "self_reported" });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error self-reporting charge payment");
    return NextResponse.json(
      { error: "Erro ao reportar pagamento" },
      { status: 500 }
    );
  }
}
