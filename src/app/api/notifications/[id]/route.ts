import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type Params = { id: string };

/**
 * PATCH /api/notifications/[id]/read
 * Marcar notificação como lida
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Validar que a notificação pertence ao usuário
    const notificationCheck = await sql`
      SELECT id FROM notifications
      WHERE id = ${id}::BIGINT
        AND user_id = ${user.id}::UUID
        AND (deleted_at IS NULL)
      LIMIT 1
    `;

    if (!notificationCheck || notificationCheck.length === 0) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    // Marcar como lida
    await sql`
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE id = ${id}::BIGINT
        AND user_id = ${user.id}::UUID
    `;

    logger.info({ notificationId: id, userId: user.id }, "Notification marked as read");

    return NextResponse.json({
      success: true,
      message: "Notificação marcada como lida",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error marking notification as read");
    return NextResponse.json(
      { error: "Erro ao marcar notificação como lida" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Deletar notificação (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Validar que a notificação pertence ao usuário
    const notificationCheck = await sql`
      SELECT id FROM notifications
      WHERE id = ${id}::BIGINT
        AND user_id = ${user.id}::UUID
        AND (deleted_at IS NULL)
      LIMIT 1
    `;

    if (!notificationCheck || notificationCheck.length === 0) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    // Soft delete
    await sql`
      UPDATE notifications
      SET deleted_at = NOW()
      WHERE id = ${id}::BIGINT
        AND user_id = ${user.id}::UUID
    `;

    logger.info({ notificationId: id, userId: user.id }, "Notification deleted");

    return NextResponse.json({
      success: true,
      message: "Notificação excluída",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error deleting notification");
    return NextResponse.json(
      { error: "Erro ao excluir notificação" },
      { status: 500 }
    );
  }
}

