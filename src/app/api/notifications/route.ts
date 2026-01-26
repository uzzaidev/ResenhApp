import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

/**
 * GET /api/notifications
 * Listar notificações do usuário (não lidas primeiro)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Buscar notificações do usuário
    // Nota: A migration usa profiles(id), mas o sistema atual usa users(id)
    // Vamos buscar usando users.id diretamente
    const notificationsResult = await sql`
      SELECT 
        n.id,
        n.code,
        n.type,
        n.title,
        n.body as message,
        n.action_url,
        n.is_read,
        n.read_at,
        n.created_at,
        n.related_type,
        n.related_id
      FROM notifications n
      WHERE n.user_id = ${user.id}::UUID
        AND (n.deleted_at IS NULL)
      ORDER BY 
        n.is_read ASC,
        n.created_at DESC
      LIMIT 50
    `;

    const notifications = Array.isArray(notificationsResult) ? notificationsResult : [];
    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching notifications");
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/mark-all-read
 * Marcar todas as notificações como lidas
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "mark-all-read") {
      // Usar função SQL se existir, senão UPDATE direto
      const result = await sql`
        UPDATE notifications
        SET is_read = TRUE, read_at = NOW()
        WHERE user_id = ${user.id}::UUID
          AND is_read = FALSE
          AND (deleted_at IS NULL)
      `;

      logger.info({ userId: user.id }, "All notifications marked as read");

      return NextResponse.json({
        success: true,
        message: "Todas as notificações foram marcadas como lidas",
      });
    }

    return NextResponse.json(
      { error: "Ação inválida" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error marking notifications as read");
    return NextResponse.json(
      { error: "Erro ao marcar notificações como lidas" },
      { status: 500 }
    );
  }
}

