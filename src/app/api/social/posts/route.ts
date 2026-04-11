import { NextRequest, NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { earnCredits } from "@/lib/credit-earning";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const postType = String(body.postType || "text_update");
    const allowedTypes = ["training_photo", "match_result", "achievement", "milestone", "text_update"];
    if (!allowedTypes.includes(postType)) {
      return NextResponse.json({ error: "Tipo de post invalido" }, { status: 400 });
    }

    const content = body.content ? String(body.content).trim() : null;
    const mediaUrls = Array.isArray(body.mediaUrls)
      ? body.mediaUrls.map((url: unknown) => String(url)).filter(Boolean)
      : [];
    const privacy = ["public", "atletica", "group", "private"].includes(body.privacy)
      ? body.privacy
      : "group";
    const groupId = body.groupId ? String(body.groupId) : null;
    const eventId = body.eventId ? String(body.eventId) : null;

    if (!content && mediaUrls.length === 0) {
      return NextResponse.json(
        { error: "Informe conteudo ou midia para criar o post" },
        { status: 400 }
      );
    }

    if (groupId) {
      const membership = await sql`
        SELECT 1
        FROM group_members
        WHERE group_id = ${groupId}::UUID
          AND user_id = ${user.id}::UUID
        LIMIT 1
      `;

      if (membership.length === 0) {
        return NextResponse.json({ error: "Voce nao e membro do grupo" }, { status: 403 });
      }
    }

    const created = await sql`
      INSERT INTO social_posts (
        author_id,
        group_id,
        post_type,
        content,
        media_urls,
        event_id,
        privacy
      )
      VALUES (
        ${user.id}::UUID,
        ${groupId ? sql`${groupId}::UUID` : null},
        ${postType},
        ${content},
        ${mediaUrls},
        ${eventId ? sql`${eventId}::UUID` : null},
        ${privacy}
      )
      RETURNING *
    `;
    const post = created[0] as any;

    const earning = await earnCredits(sql, user.id, "post_training_photo", String(post.id));
    if (earning.awarded) {
      await sql`
        UPDATE social_posts
        SET credits_pending = FALSE, credits_awarded_at = NOW()
        WHERE id = ${post.id}::UUID
      `;
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error creating social post");
    return NextResponse.json({ error: "Erro ao criar post" }, { status: 500 });
  }
}
