import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { eventId } = await context.params;

    // Verificar se usuário é admin do grupo do evento
    const membershipQuery = await sql`
      SELECT gm.role
      FROM events e
      INNER JOIN group_members gm ON e.group_id = gm.group_id
      WHERE e.id = ${eventId} AND gm.user_id = ${user.id}
    `;
    const membership = membershipQuery[0];

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem finalizar votação" },
        { status: 403 }
      );
    }

    // Contar votos de cada jogador
    const voteCounts = await sql`
      SELECT
        voted_user_id,
        u.name as user_name,
        COUNT(*) as vote_count
      FROM votes
      INNER JOIN users u ON votes.voted_user_id = u.id
      WHERE event_id = ${eventId}
      GROUP BY voted_user_id, u.name
      ORDER BY vote_count DESC
    `;

    if (!Array.isArray(voteCounts) || voteCounts.length === 0) {
      return NextResponse.json(
        { error: "Nenhum voto registrado ainda" },
        { status: 400 }
      );
    }

    // Identificar jogadores com o máximo de votos
    const voteCountsArray = voteCounts as any;
    const maxVotes = parseInt(voteCountsArray[0].vote_count as string);
    const tiedPlayers = voteCountsArray.filter(
      (v: any) => parseInt(v.vote_count as string) === maxVotes
    );

    // Se apenas 1 jogador tem o máximo, não há empate
    if (Array.isArray(tiedPlayers) && tiedPlayers.length === 1) {
      return NextResponse.json({
        success: true,
        hasTie: false,
        winner: {
          userId: tiedPlayers[0].voted_user_id,
          userName: tiedPlayers[0].user_name,
          voteCount: maxVotes,
        },
      });
    }

    // Há empate! Criar registro de tiebreaker
    const tiedUserIds = Array.isArray(tiedPlayers) ? tiedPlayers.map((p: any) => p.voted_user_id) : [];

    // Verificar se já existe tiebreaker para este evento
    const existingTiebreakerQuery = await sql`
      SELECT id, status FROM mvp_tiebreakers
      WHERE event_id = ${eventId}
      ORDER BY round DESC
      LIMIT 1
    `;
    const existingTiebreaker = existingTiebreakerQuery[0];

    if (existingTiebreaker && existingTiebreaker.status !== "completed" && existingTiebreaker.status !== "admin_decided") {
      return NextResponse.json(
        { error: "Já existe um desempate em andamento para este evento" },
        { status: 400 }
      );
    }

    // Criar novo tiebreaker
    const round = existingTiebreaker ? (existingTiebreaker.round as number) + 1 : 1;

    const tiebreakerQuery = await sql`
      INSERT INTO mvp_tiebreakers (
        event_id,
        round,
        status,
        tied_user_ids
      ) VALUES (
        ${eventId},
        ${round},
        'pending',
        ${tiedUserIds}
      )
      RETURNING *
    `;
    const tiebreaker = tiebreakerQuery[0];

    logger.info(
      { eventId, tiedUserIds, round, userId: user.id },
      "MVP tiebreaker created"
    );

    return NextResponse.json({
      success: true,
      hasTie: true,
      tiebreaker: {
        id: tiebreaker.id,
        round,
        status: tiebreaker.status,
        tiedPlayers: tiedPlayers.map((p: any) => ({
          userId: p.voted_user_id,
          userName: p.user_name,
          voteCount: maxVotes,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error finalizing MVP voting");
    return NextResponse.json(
      { error: "Erro ao finalizar votação" },
      { status: 500 }
    );
  }
}
