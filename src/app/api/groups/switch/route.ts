import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { cookies } from "next/headers";
import logger from "@/lib/logger";

/**
 * POST /api/groups/switch
 * Alterna o grupo atual do usuário (atualiza cookie)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é membro do grupo
    const membership = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
      LIMIT 1
    `;

    if (membership.length === 0) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // Atualizar cookie
    const cookieStore = await cookies();
    cookieStore.set("currentGroupId", groupId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 ano
      httpOnly: false, // Acessível via JavaScript (para localStorage sync)
      sameSite: "lax",
    });

    logger.info({ userId: user.id, groupId }, "Group switched");

    return NextResponse.json({
      success: true,
      groupId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error switching group");
    return NextResponse.json(
      { error: "Erro ao alternar grupo" },
      { status: 500 }
    );
  }
}


