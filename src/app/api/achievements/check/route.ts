import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { earnCredits } from "@/lib/credit-earning";

async function tableExists(tableName: string): Promise<boolean> {
  const result = await sql<{ exists: string | null }[]>`
    SELECT to_regclass(${`public.${tableName}`})::TEXT AS exists
  `;
  return Boolean(result[0]?.exists);
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const groupId = body.groupId ? String(body.groupId) : null;
    const targetUserId = body.userId ? String(body.userId) : user.id;

    if (targetUserId !== user.id) {
      return NextResponse.json(
        { error: "Sem permissao para verificar conquistas de outro usuario" },
        { status: 403 }
      );
    }

    const ready =
      (await tableExists("user_achievements")) &&
      (await tableExists("achievement_types")) &&
      (await tableExists("player_stats"));
    if (!ready) {
      return NextResponse.json(
        {
          deferred: true,
          schemaReady: false,
          unlocked: [],
        },
        { status: 200 }
      );
    }

    const before = await sql<{ achievement_type_id: number }[]>`
      SELECT achievement_type_id
      FROM user_achievements
      WHERE user_id = ${targetUserId}::UUID
    `;
    const beforeSet = new Set(before.map((row) => Number(row.achievement_type_id)));

    await sql`
      SELECT check_and_unlock_achievements(
        ${targetUserId}::UUID,
        ${groupId ? sql`${groupId}::BIGINT` : null}
      )
    `;

    const after = await sql<{
      achievement_type_id: number;
      code: string;
      name: string;
      points: number;
    }[]>`
      SELECT
        ua.achievement_type_id,
        at.code,
        at.name,
        at.points
      FROM user_achievements ua
      INNER JOIN achievement_types at ON at.id = ua.achievement_type_id
      WHERE ua.user_id = ${targetUserId}::UUID
      ORDER BY ua.unlocked_at DESC
    `;

    const unlocked = after.filter((row) => !beforeSet.has(Number(row.achievement_type_id)));

    for (const achievement of unlocked) {
      const earning = await earnCredits(
        sql,
        targetUserId,
        "achievement_unlocked",
        String(achievement.achievement_type_id)
      );
      if (earning.deferred || !earning.awarded) {
        logger.info(
          {
            userId: targetUserId,
            achievementTypeId: achievement.achievement_type_id,
            deferred: earning.deferred,
            reason: earning.reason,
          },
          "Achievement credit not awarded"
        );
      }
    }

    return NextResponse.json({
      deferred: false,
      schemaReady: true,
      unlocked,
      totalUnlocked: after.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NÃ£o autenticado") {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error checking achievements");
    return NextResponse.json(
      { error: "Erro ao verificar conquistas" },
      { status: 500 }
    );
  }
}
