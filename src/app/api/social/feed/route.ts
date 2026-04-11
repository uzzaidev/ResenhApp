import { NextRequest, NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const limitParam = Number(searchParams.get("limit") || 20);
    const offsetParam = Number(searchParams.get("offset") || 0);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 50)
      : 20;
    const offset = Number.isFinite(offsetParam)
      ? Math.max(offsetParam, 0)
      : 0;

    if (groupId) {
      const membership = await sql`
        SELECT 1
        FROM group_members
        WHERE group_id = ${groupId}::UUID
          AND user_id = ${user.id}::UUID
        LIMIT 1
      `;

      if (membership.length === 0) {
        return NextResponse.json(
          { error: "Voce nao e membro do grupo" },
          { status: 403 }
        );
      }
    }

    const posts = groupId
      ? await sql`
          SELECT
            sp.*,
            COALESCE(u.name, 'Usuario') AS author_name,
            COUNT(DISTINCT sr.id)::INTEGER AS reactions_count,
            COUNT(DISTINCT sc.id)::INTEGER AS comments_count,
            MAX(CASE WHEN sr.user_id = ${user.id}::UUID THEN sr.reaction_type END) AS my_reaction
          FROM social_posts sp
          LEFT JOIN users u ON u.id = sp.author_id
          LEFT JOIN social_reactions sr ON sr.post_id = sp.id
          LEFT JOIN social_comments sc ON sc.post_id = sp.id AND sc.deleted_at IS NULL
          WHERE sp.deleted_at IS NULL
            AND sp.group_id = ${groupId}::UUID
            AND sp.privacy IN ('public', 'group')
          GROUP BY sp.id, u.name
          ORDER BY sp.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `
      : await sql`
          SELECT
            sp.*,
            COALESCE(u.name, 'Usuario') AS author_name,
            COUNT(DISTINCT sr.id)::INTEGER AS reactions_count,
            COUNT(DISTINCT sc.id)::INTEGER AS comments_count,
            MAX(CASE WHEN sr.user_id = ${user.id}::UUID THEN sr.reaction_type END) AS my_reaction
          FROM social_posts sp
          LEFT JOIN users u ON u.id = sp.author_id
          LEFT JOIN social_reactions sr ON sr.post_id = sp.id
          LEFT JOIN social_comments sc ON sc.post_id = sp.id AND sc.deleted_at IS NULL
          WHERE sp.deleted_at IS NULL
            AND sp.privacy = 'public'
          GROUP BY sp.id, u.name
          ORDER BY sp.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;

    return NextResponse.json({ posts, limit, offset });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error fetching social feed");
    return NextResponse.json({ error: "Erro ao buscar feed" }, { status: 500 });
  }
}
