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
    const reactionType = ["like", "fire", "goal", "awesome"].includes(body.reactionType)
      ? body.reactionType
      : "like";

    const post = await sql`
      SELECT id FROM social_posts
      WHERE id = ${postId}::UUID
        AND deleted_at IS NULL
      LIMIT 1
    `;
    if (post.length === 0) {
      return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });
    }

    await sql`
      INSERT INTO social_reactions (post_id, user_id, reaction_type)
      VALUES (${postId}::UUID, ${user.id}::UUID, ${reactionType})
      ON CONFLICT (post_id, user_id)
      DO UPDATE SET
        reaction_type = EXCLUDED.reaction_type,
        created_at = NOW()
    `;

    await earnCredits(sql, user.id, "react_to_post", String(postId));

    return NextResponse.json({ ok: true, reactionType });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error reacting to post");
    return NextResponse.json({ error: "Erro ao reagir ao post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await requireAuth();
    const { postId } = await params;

    await sql`
      DELETE FROM social_reactions
      WHERE post_id = ${postId}::UUID
        AND user_id = ${user.id}::UUID
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error removing post reaction");
    return NextResponse.json({ error: "Erro ao remover reacao" }, { status: 500 });
  }
}
