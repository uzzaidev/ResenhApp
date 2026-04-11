import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type RouteParams = {
  params: Promise<{ groupId: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { groupId } = await params;

    const membership = await sql`
      SELECT role
      FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
      LIMIT 1
    `;

    if (!membership.length) {
      return NextResponse.json({ error: "VocÃª nÃ£o Ã© membro deste grupo" }, { status: 403 });
    }

    const events = await sql<{
      id: string;
      starts_at: string;
      event_type: string | null;
      venue_name: string | null;
      price: number | null;
      max_players: number | null;
      confirmed_count: number;
      user_status: "yes" | "no" | "waitlist" | null;
    }[]>`
      SELECT
        e.id,
        e.starts_at,
        e.event_type,
        v.name AS venue_name,
        e.price,
        e.max_players,
        (SELECT COUNT(*)::INTEGER FROM event_attendance ea WHERE ea.event_id = e.id AND ea.status = 'yes') AS confirmed_count,
        (
          SELECT ea.status
          FROM event_attendance ea
          WHERE ea.event_id = e.id AND ea.user_id = ${user.id}
          LIMIT 1
        ) AS user_status
      FROM events e
      LEFT JOIN venues v ON v.id = e.venue_id
      WHERE e.group_id = ${groupId}
        AND e.starts_at >= NOW()
        AND e.status = 'scheduled'
        AND (e.event_type IS NULL OR e.event_type NOT IN ('game', 'match'))
      ORDER BY e.starts_at ASC
      LIMIT 6
    `;

    if (!events.length) {
      return NextResponse.json({ trainings: [] });
    }

    const eventIds = events.map((event) => event.id);
    const attendees = await sql<{
      event_id: string;
      user_id: string;
      name: string;
      image: string | null;
    }[]>`
      SELECT
        ea.event_id,
        u.id AS user_id,
        u.name,
        u.image
      FROM event_attendance ea
      INNER JOIN users u ON u.id = ea.user_id
      WHERE ea.event_id = ANY(${eventIds}::UUID[])
        AND ea.status = 'yes'
      ORDER BY ea.created_at ASC
    `;

    const attendeesByEvent = attendees.reduce<Record<string, Array<{ id: string; name: string; avatarUrl?: string | null }>>>(
      (acc, row) => {
        if (!acc[row.event_id]) acc[row.event_id] = [];
        if (acc[row.event_id].length < 5) {
          acc[row.event_id].push({
            id: row.user_id,
            name: row.name,
            avatarUrl: row.image,
          });
        }
        return acc;
      },
      {}
    );

    return NextResponse.json({
      trainings: events.map((event) => ({
        id: event.id,
        name: event.event_type === "training" || !event.event_type ? "Treino" : "Evento",
        startsAt: event.starts_at,
        venueName: event.venue_name,
        price: event.price,
        maxPlayers: event.max_players || 0,
        confirmedCount: Number(event.confirmed_count || 0),
        userStatus: event.user_status,
        confirmedAttendees: attendeesByEvent[event.id] || [],
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NÃ£o autenticado") {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching upcoming trainings");
    return NextResponse.json({ error: "Erro ao buscar prÃ³ximos treinos" }, { status: 500 });
  }
}
