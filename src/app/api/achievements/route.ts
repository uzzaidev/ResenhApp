import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

async function achievementsSchemaReady() {
  const result = await sql<{ has_table: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'achievement_types'
    ) AS has_table
  `;
  return Boolean(result[0]?.has_table);
}

export async function GET() {
  try {
    await requireAuth();
    const ready = await achievementsSchemaReady();
    if (!ready) {
      return NextResponse.json({
        deferred: true,
        schemaReady: false,
        achievements: [],
      });
    }

    const achievements = await sql`
      SELECT
        id,
        code,
        name,
        description,
        icon_url,
        category,
        rarity,
        points,
        is_secret
      FROM achievement_types
      WHERE is_active = TRUE
      ORDER BY points DESC, id ASC
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
    logger.error(error, "Error fetching achievements catalog");
    return NextResponse.json(
      { error: "Erro ao buscar conquistas" },
      { status: 500 }
    );
  }
}
