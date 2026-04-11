import { NextRequest, NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { earnCredits } from "@/lib/credit-earning";

type Params = Promise<{ postId: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await requireAuth();
    const { postId } = await params;
    const body = await request.json();
    const content = String(body.content || "").trim();
    const parentCommentId = body.parentCommentId ? String(body.parentCommentId) : null;

    if (content.length < 3) {
      return NextResponse.json(
        { error: "Comentario deve ter ao menos 3 caracteres" },
        { status: 400 }
      );
    }

    const post = await sql`
      SELECT id FROM social_posts
      WHERE id = ${postId}::UUID
        AND deleted_at IS NULL
      LIMIT 1
    `;
    if (post.length === 0) {
      return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });
    }

    const created = await sql`
      INSERT INTO social_comments (post_id, author_id, parent_comment_id, content)
      VALUES (
        ${postId}::UUID,
        ${user.id}::UUID,
        ${parentCommentId ? sql`${parentCommentId}::UUID` : null},
        ${content}
      )
      RETURNING *
    `;

    await earnCredits(sql, user.id, "comment_on_post", String(created[0].id));

    return NextResponse.json({ comment: created[0] }, { status: 201 });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error creating comment");
    return NextResponse.json({ error: "Erro ao comentar" }, { status: 500 });
  }
}
