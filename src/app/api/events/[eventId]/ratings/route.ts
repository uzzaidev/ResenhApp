import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { playerRatingSchema } from "@/lib/validations";
import logger from "@/lib/logger";

type Params = Promise<{ eventId: string }>;

// GET /api/events/:eventId/ratings - Get user's vote for this event
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { eventId } = await params;
    const user = await requireAuth();

    const eventQuery = await sql`
      SELECT group_id FROM events WHERE id = ${eventId}
    `;
    const event = eventQuery[0];

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    // Check if user is member
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${event.group_id} AND user_id = ${user.id}
    `;
    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // Get user's vote for this event (single vote)
    const voteQuery = await sql`
      SELECT rated_user_id as player_id
      FROM player_ratings
      WHERE event_id = ${eventId}
        AND rater_user_id = ${user.id}
        AND 'mvp' = ANY(tags)
      LIMIT 1
    `;
    const vote = voteQuery[0];

    return NextResponse.json({ vote: vote || null });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching vote");
    return NextResponse.json(
      { error: "Erro ao buscar voto" },
      { status: 500 }
    );
  }
}

// POST /api/events/:eventId/ratings - Submit MVP vote (single player)
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { eventId } = await params;
    const user = await requireAuth();

    const body = await request.json();
    const validation = playerRatingSchema.safeParse({ ...body, eventId });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { ratedUserId } = validation.data;

    const eventQuery = await sql`
      SELECT group_id FROM events WHERE id = ${eventId}
    `;
    const event = eventQuery[0];

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    // Check if user is member and attended
    const attendanceQuery = await sql`
      SELECT * FROM event_attendance
      WHERE event_id = ${eventId} AND user_id = ${user.id} AND status = 'yes'
    `;
    const attendance = attendanceQuery[0];

    if (!attendance) {
      return NextResponse.json(
        { error: "Você precisa ter participado do evento para votar" },
        { status: 403 }
      );
    }

    // Can't vote for yourself
    if (ratedUserId === user.id) {
      return NextResponse.json(
        { error: "Você não pode votar em si mesmo" },
        { status: 400 }
      );
    }

    // Check if the rated player participated
    const ratedAttendanceQuery = await sql`
      SELECT * FROM event_attendance
      WHERE event_id = ${eventId} AND user_id = ${ratedUserId} AND status = 'yes'
    `;
    const ratedAttendance = ratedAttendanceQuery[0];

    if (!ratedAttendance) {
      return NextResponse.json(
        { error: "Só é possível votar em jogadores que participaram" },
        { status: 400 }
      );
    }

    // Remove any previous vote from this user for this event
    await sql`
      DELETE FROM player_ratings
      WHERE event_id = ${eventId} AND rater_user_id = ${user.id}
    `;

    // Insert new vote with 'mvp' tag and NULL score
    const voteQuery = await sql`
      INSERT INTO player_ratings (
        event_id,
        rater_user_id,
        rated_user_id,
        score,
        tags
      )
      VALUES (
        ${eventId},
        ${user.id},
        ${ratedUserId},
        NULL,
        ARRAY['mvp']::TEXT[]
      )
      RETURNING *
    `;
    const vote = voteQuery[0];

    logger.info(
      { eventId, raterUserId: user.id, ratedUserId },
      "MVP vote submitted"
    );

    return NextResponse.json({ vote });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error submitting vote");
    return NextResponse.json(
      { error: "Erro ao votar" },
      { status: 500 }
    );
  }
}
