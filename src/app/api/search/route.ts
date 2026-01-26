import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { z } from "zod";

/**
 * GET /api/search?q=query&group_id=xxx
 * 
 * Busca global simples (queries diretas, sem materialized view)
 * Busca em: atletas, treinos/jogos, modalidades
 * 
 * Sprint 6: Implementação inicial com queries diretas.
 * Pode evoluir para materialized view + full-text search se necessário.
 */

const searchQuerySchema = z.object({
  q: z.string().min(1, "Query não pode estar vazia").max(100, "Query muito longa"),
  group_id: z.string().uuid("group_id inválido"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    
    const query = searchParams.get("q");
    const groupId = searchParams.get("group_id");

    // Validar parâmetros
    const validation = searchQuerySchema.safeParse({
      q: query || "",
      group_id: groupId || "",
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { q, group_id } = validation.data;

    // Verificar se usuário é membro do grupo
    const membershipCheck = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${group_id}::BIGINT AND user_id = ${user.id}
    `;

    if (!membershipCheck || membershipCheck.length === 0) {
      return NextResponse.json(
        { error: "Você não tem acesso a este grupo" },
        { status: 403 }
      );
    }

    // Buscar atletas (users + group_members)
    const athletesQuery = sql`
      SELECT
        u.id::text as id,
        u.name as title,
        u.email as subtitle,
        u.image as icon_url,
        '/atletas/' || u.id::text as url
      FROM users u
      INNER JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ${group_id}::BIGINT
        AND (
          LOWER(u.name) LIKE LOWER(${'%' + q + '%'})
          OR LOWER(u.email) LIKE LOWER(${'%' + q + '%'})
        )
      ORDER BY u.name
      LIMIT 10
    `;

    // Buscar treinos/jogos (events)
    // Nota: events.id pode ser UUID ou BIGINT dependendo da migration
    // Vamos usar CAST para garantir compatibilidade
    const eventsQuery = sql`
      SELECT
        e.id::text as id,
        CASE 
          WHEN e.event_type = 'game' OR e.event_type = 'match' OR e.event_type = 'official_game' THEN
            'Jogo ' || TO_CHAR(e.starts_at, 'DD/MM HH24:MI')
          ELSE
            'Treino ' || TO_CHAR(e.starts_at, 'DD/MM HH24:MI')
        END as title,
        COALESCE(v.name, 'Local não definido') as subtitle,
        NULL as icon_url,
        '/events/' || e.id::text as url
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${group_id}::BIGINT
        AND (
          LOWER(COALESCE(v.name, '')) LIKE LOWER(${'%' + q + '%'})
          OR TO_CHAR(e.starts_at, 'DD/MM/YYYY') LIKE ${'%' + q + '%'}
          OR TO_CHAR(e.starts_at, 'DD-MM-YYYY') LIKE ${'%' + q + '%'}
          OR LOWER(COALESCE(e.title, '')) LIKE LOWER(${'%' + q + '%'})
        )
      ORDER BY e.starts_at DESC
      LIMIT 10
    `;

    // Buscar modalidades (sport_modalities)
    const modalitiesQuery = sql`
      SELECT
        id::text as id,
        name as title,
        COALESCE(description, 'Sem descrição') as subtitle,
        icon as icon_url,
        '/modalidades/' || id::text as url
      FROM sport_modalities
      WHERE group_id = ${group_id}::BIGINT
        AND is_active = true
        AND (
          LOWER(name) LIKE LOWER(${'%' + q + '%'})
          OR LOWER(COALESCE(description, '')) LIKE LOWER(${'%' + q + '%'})
        )
      ORDER BY name
      LIMIT 10
    `;

    // Executar queries em paralelo
    const [athletes, events, modalities] = await Promise.all([
      athletesQuery,
      eventsQuery,
      modalitiesQuery,
    ]);

    logger.info(
      {
        userId: user.id,
        groupId: group_id,
        query: q,
        resultsCount: {
          athletes: athletes.length,
          events: events.length,
          modalities: modalities.length,
        },
      },
      "Search performed"
    );

    return NextResponse.json({
      results: {
        athletes: athletes as any[],
        trainings: (events as any[]).filter(
          (e) => !e.title?.toLowerCase().includes("jogo")
        ),
        games: (events as any[]).filter((e) =>
          e.title?.toLowerCase().includes("jogo")
        ),
        modalities: modalities as any[],
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error performing search");
    return NextResponse.json(
      { error: "Erro ao realizar busca" },
      { status: 500 }
    );
  }
}

