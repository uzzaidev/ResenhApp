import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type Params = Promise<{ userId: string }>;

async function tableExists(tableName: string): Promise<boolean> {
  const result = await sql<{ exists: string | null }[]>`
    SELECT to_regclass(${`public.${tableName}`})::TEXT AS exists
  `;
  return Boolean(result[0]?.exists);
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requireAuth();
    const { userId } = await params;

    if (currentUser.id !== userId) {
      return NextResponse.json(
        { error: "Sem permissao para consultar este usuario" },
        { status: 403 }
      );
    }

    const ready = (await tableExists("user_achievements")) && (await tableExists("achievement_types"));
    if (!ready) {
      return NextResponse.json({
        deferred: true,
        schemaReady: false,
        achievements: [],
      });
    }

    const achievements = await sql`
      SELECT
        ua.id,
        ua.user_id,
        ua.unlocked_at,
        ua.progress,
        ua.progress_max,
        ua.group_id,
        ua.event_id,
        at.id AS achievement_type_id,
        at.code,
        at.name,
        at.description,
        at.icon_url,
        at.category,
        at.rarity,
        at.points
      FROM user_achievements ua
      INNER JOIN achievement_types at ON at.id = ua.achievement_type_id
      WHERE ua.user_id = ${userId}::UUID
      ORDER BY ua.unlocked_at DESC
    `;

    return NextResponse.json({
      deferred: false,
      schemaReady: true,
      achievements,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NÃ£o autenticado") {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching user achievements");
    return NextResponse.json(
      { error: "Erro ao buscar conquistas do usuario" },
      { status: 500 }
    );
  }
}
