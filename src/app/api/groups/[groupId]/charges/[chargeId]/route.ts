import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { updateChargeStatusSchema } from "@/lib/validations-charges";
import { earnCredits } from "@/lib/credit-earning";
import { createInAppNotification } from "@/lib/notifications";
import { normalizeChargeStatus, validateDeniedStatusReason } from "@/lib/charge-status";

type Params = Promise<{ groupId: string; chargeId: string }>;

// PATCH /api/groups/:groupId/charges/:chargeId - Update charge status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { groupId, chargeId } = await params;
    const user = await requireAuth();

    // Check if current user is admin
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;
    const membership = membershipQuery[0];

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas admins podem atualizar cobranças" },
        { status: 403 }
      );
    }

    // Check if charge exists and belongs to the group
    const existingChargeQuery = await sql`
      SELECT * FROM charges
      WHERE id = ${chargeId} AND group_id = ${groupId}
    `;
    const existingCharge = existingChargeQuery[0];

    if (!existingCharge) {
      return NextResponse.json(
        { error: "Cobrança não encontrada" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateChargeStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.errors },
        { status: 400 }
      );
    }

    const normalizedStatus = normalizeChargeStatus(validation.data.status);
    const denialReason = validation.data.denialReason?.trim();

    const denialValidation = validateDeniedStatusReason(normalizedStatus, denialReason);
    if (!denialValidation.valid) {
      return NextResponse.json(
        { error: denialValidation.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    let updatedCharge: any;
    try {
      const updatedChargeQuery = await sql`
        UPDATE charges
        SET
          status = ${normalizedStatus},
          paid_at = CASE
            WHEN ${normalizedStatus} = 'paid' THEN NOW()
            ELSE NULL
          END,
          self_reported_at = CASE
            WHEN ${normalizedStatus} = 'self_reported' THEN COALESCE(self_reported_at, NOW())
            ELSE self_reported_at
          END,
          admin_confirmed_at = CASE
            WHEN ${normalizedStatus} IN ('paid', 'denied') THEN NOW()
            ELSE admin_confirmed_at
          END,
          admin_confirmed_by = CASE
            WHEN ${normalizedStatus} IN ('paid', 'denied') THEN ${user.id}::UUID
            ELSE admin_confirmed_by
          END,
          admin_denial_reason = CASE
            WHEN ${normalizedStatus} = 'denied' THEN ${denialReason || null}
            ELSE NULL
          END,
          updated_at = NOW()
        WHERE id = ${chargeId}
        RETURNING *
      `;
      updatedCharge = updatedChargeQuery[0];
    } catch (migrationError) {
      logger.warn(
        { migrationError, chargeId, status: normalizedStatus },
        "Falling back to legacy charge status update"
      );

      const updatedChargeQuery = await sql`
        UPDATE charges
        SET
          status = ${normalizedStatus},
          paid_at = CASE
            WHEN ${normalizedStatus} = 'paid' THEN NOW()
            ELSE NULL
          END,
          updated_at = NOW()
        WHERE id = ${chargeId}
        RETURNING *
      `;
      updatedCharge = updatedChargeQuery[0];
    }

    logger.info(
      { groupId, chargeId, status: normalizedStatus, updatedBy: user.id },
      "Charge status updated"
    );

    // Get user info
    const userInfoQuery = await sql`
      SELECT id, name, image FROM users WHERE id = ${updatedCharge.user_id}
    `;
    const userInfo = userInfoQuery[0];

    if (normalizedStatus === "paid" && updatedCharge?.user_id) {
      const earning = await earnCredits(
        sql,
        updatedCharge.user_id,
        "attend_event",
        String(updatedCharge.event_id || updatedCharge.id)
      );
      if (earning.deferred || !earning.awarded) {
        logger.info(
          {
            userId: updatedCharge.user_id,
            chargeId,
            deferred: earning.deferred,
            reason: earning.reason,
          },
          "Attend-event credit not awarded on charge confirmation"
        );
      }

      await createInAppNotification(sql, {
        userId: updatedCharge.user_id,
        type: "payment_received",
        title: "Pagamento confirmado",
        body: "Seu pagamento foi confirmado pelo admin do grupo.",
        actionUrl: `/financeiro/charges/${chargeId}`,
        relatedType: "charge",
        relatedId: chargeId,
      });
    }

    if (normalizedStatus === "denied" && updatedCharge?.user_id) {
      await createInAppNotification(sql, {
        userId: updatedCharge.user_id,
        type: "payment_request",
        title: "Pagamento negado",
        body: denialReason
          ? `Seu pagamento foi negado: ${denialReason}`
          : "Seu pagamento foi negado pelo admin. Verifique os detalhes da cobrança.",
        actionUrl: `/financeiro/charges/${chargeId}`,
        relatedType: "charge",
        relatedId: chargeId,
      });
    }

    return NextResponse.json({
      message: "Status atualizado com sucesso",
      charge: {
        ...updatedCharge,
        user_id: userInfo?.id ?? updatedCharge.user_id ?? null,
        user_name: userInfo?.name ?? null,
        user_image: userInfo?.image ?? null,
      },
    });
  } catch (error) {
    logger.error({ error }, "Error updating charge status");
    return NextResponse.json(
      { error: "Erro ao atualizar cobrança" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/:groupId/charges/:chargeId - Delete charge (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { groupId, chargeId } = await params;
    const user = await requireAuth();

    // Check if current user is admin
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;
    const membership = membershipQuery[0];

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas admins podem excluir cobranças" },
        { status: 403 }
      );
    }

    // Check if charge exists and belongs to the group
    const existingChargeQuery = await sql`
      SELECT * FROM charges
      WHERE id = ${chargeId} AND group_id = ${groupId}
    `;
    const existingCharge = existingChargeQuery[0];

    if (!existingCharge) {
      return NextResponse.json(
        { error: "Cobrança não encontrada" },
        { status: 404 }
      );
    }

    // Delete charge
    await sql`
      DELETE FROM charges WHERE id = ${chargeId}
    `;

    logger.info(
      { groupId, chargeId, deletedBy: user.id },
      "Charge deleted"
    );

    return NextResponse.json({
      message: "Cobrança excluída com sucesso",
    });
  } catch (error) {
    logger.error({ error }, "Error deleting charge");
    return NextResponse.json(
      { error: "Erro ao excluir cobrança" },
      { status: 500 }
    );
  }
}
