import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type Params = Promise<{ groupId: string; inviteId: string }>;

// DELETE /api/groups/:groupId/invites/:inviteId - Delete an invite (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { groupId, inviteId } = await params;
    const user = await requireAuth();

    // Check if user is admin
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;
    const [membership] = membershipQuery as Array<{ role: string }>;

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas admins podem deletar convites" },
        { status: 403 }
      );
    }

    // Check if invite exists and belongs to group
    const inviteQuery = await sql`
      SELECT * FROM invites
      WHERE id = ${inviteId} AND group_id = ${groupId}
    `;
    const [invite] = inviteQuery as any[];

    if (!invite) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    await sql`
      DELETE FROM invites
      WHERE id = ${inviteId}
    `;

    logger.info({ groupId, inviteId, userId: user.id }, "Invite deleted");

    return NextResponse.json({ message: "Convite deletado com sucesso" });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error deleting invite");
    return NextResponse.json(
      { error: "Erro ao deletar convite" },
      { status: 500 }
    );
  }
}
