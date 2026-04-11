import { NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type Params = Promise<{ postId: string; id: string }>;

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireAuth();
    const { postId, id } = await params;

    const commentResult = await sql`
      SELECT id, author_id
      FROM social_comments
      WHERE id = ${id}::UUID
        AND post_id = ${postId}::UUID
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const comment = commentResult[0] as { id: string; author_id: string } | undefined;
    if (!comment) {
      return NextResponse.json({ error: "Comentario nao encontrado" }, { status: 404 });
    }

    if (comment.author_id !== user.id) {
      return NextResponse.json(
        { error: "Apenas o autor pode remover este comentario" },
        { status: 403 }
      );
    }

    await sql`
      UPDATE social_comments
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}::UUID
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error deleting social comment");
    return NextResponse.json({ error: "Erro ao remover comentario" }, { status: 500 });
  }
}
