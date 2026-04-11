import { NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type Params = Promise<{ postId: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    await requireAuth();
    const { postId } = await params;

    const postResult = await sql`
      SELECT
        sp.*,
        COALESCE(u.name, 'Usuario') AS author_name,
        COUNT(DISTINCT sr.id)::INTEGER AS reactions_count,
        COUNT(DISTINCT sc.id)::INTEGER AS comments_count
      FROM social_posts sp
      LEFT JOIN users u ON u.id = sp.author_id
      LEFT JOIN social_reactions sr ON sr.post_id = sp.id
      LEFT JOIN social_comments sc ON sc.post_id = sp.id AND sc.deleted_at IS NULL
      WHERE sp.id = ${postId}::UUID
        AND sp.deleted_at IS NULL
      GROUP BY sp.id, u.name
      LIMIT 1
    `;

    if (postResult.length === 0) {
      return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });
    }

    const comments = await sql`
      SELECT
        sc.*,
        COALESCE(u.name, 'Usuario') AS author_name
      FROM social_comments sc
      LEFT JOIN users u ON u.id = sc.author_id
      WHERE sc.post_id = ${postId}::UUID
        AND sc.deleted_at IS NULL
      ORDER BY sc.created_at ASC
    `;

    return NextResponse.json({ post: postResult[0], comments });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error fetching social post details");
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireAuth();
    const { postId } = await params;

    const postResult = await sql`
      SELECT id, author_id
      FROM social_posts
      WHERE id = ${postId}::UUID
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const post = postResult[0] as { id: string; author_id: string } | undefined;
    if (!post) {
      return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json(
        { error: "Apenas o autor pode remover este post" },
        { status: 403 }
      );
    }

    await sql`
      UPDATE social_posts
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${postId}::UUID
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error deleting social post");
    return NextResponse.json({ error: "Erro ao remover post" }, { status: 500 });
  }
}
