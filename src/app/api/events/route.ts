import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { createEventSchema } from "@/lib/validations";
import logger from "@/lib/logger";
import { earnCredits } from "@/lib/credit-earning";

type EventTypeFilter = "training" | "match" | null;

function normalizeEventTypeFilter(raw: string | null): EventTypeFilter {
  if (!raw) return null;

  const normalized = raw.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === "treino" || normalized === "training") {
    return "training";
  }

  if (normalized === "jogo" || normalized === "match" || normalized === "game") {
    return "match";
  }

  return null;
}

function parseLimit(raw: string | null, fallback = 10): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 100);
}

// GET /api/events - List events (with filters)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const groupId = searchParams.get("groupId");
    const requestedStatus = searchParams.get("status");
    const status = requestedStatus === "canceled" ? "cancelled" : requestedStatus;
    const eventTypeFilter = normalizeEventTypeFilter(
      searchParams.get("event_type") ?? searchParams.get("tipo")
    );
    const limit = parseLimit(searchParams.get("limit"));

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId é obrigatório" },
        { status: 400 }
      );
    }

    // Check if user is member of the group
    const membershipResult = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;
    const membership = membershipResult[0];

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    const eventColumnsResult = await sql<
      {
        has_event_type: boolean;
        has_price: boolean;
        has_opponent: boolean;
        has_our_score: boolean;
        has_opponent_score: boolean;
      }[]
    >`
      SELECT
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_type'
        ) as has_event_type,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'price'
        ) as has_price,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'opponent'
        ) as has_opponent,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'our_score'
        ) as has_our_score,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'opponent_score'
        ) as has_opponent_score
    `;

    const eventColumns = eventColumnsResult[0] || {
      has_event_type: false,
      has_price: false,
      has_opponent: false,
      has_our_score: false,
      has_opponent_score: false,
    };

    const eventTypeSelectSql = eventColumns.has_event_type
      ? sql`e.event_type as event_type,`
      : sql`NULL::TEXT as event_type,`;
    const priceSelectSql = eventColumns.has_price
      ? sql`e.price as price,`
      : sql`NULL::NUMERIC as price,`;
    const opponentSelectSql = eventColumns.has_opponent
      ? sql`e.opponent as opponent,`
      : sql`NULL::TEXT as opponent,`;
    const ourScoreSelectSql = eventColumns.has_our_score
      ? sql`e.our_score as our_score,`
      : sql`NULL::INTEGER as our_score,`;
    const opponentScoreSelectSql = eventColumns.has_opponent_score
      ? sql`e.opponent_score as opponent_score,`
      : sql`NULL::INTEGER as opponent_score,`;

    const statusFilterSql = status ? sql`AND e.status = ${status}` : sql``;
    const eventTypeFilterSql =
      !eventColumns.has_event_type || !eventTypeFilter
        ? sql``
        : eventTypeFilter === "training"
        ? sql`AND (e.event_type = 'training' OR e.event_type IS NULL)`
        : sql`AND (e.event_type = 'game' OR e.event_type = 'match')`;

    const events = await sql`
      SELECT
        e.id,
        e.group_id,
        e.starts_at,
        e.status,
        e.max_players,
        v.name as venue_name,
        ${eventTypeSelectSql}
        ${priceSelectSql}
        ${opponentSelectSql}
        ${ourScoreSelectSql}
        ${opponentScoreSelectSql}
        (
          SELECT COUNT(*)::INTEGER
          FROM event_attendance ea
          WHERE ea.event_id = e.id
            AND ea.status = 'yes'
        ) as confirmed_count,
        (
          SELECT ea.status::TEXT
          FROM event_attendance ea
          WHERE ea.event_id = e.id
            AND ea.user_id = ${user.id}
          LIMIT 1
        ) as user_rsvp_status
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
      ${statusFilterSql}
      ${eventTypeFilterSql}
      ORDER BY e.starts_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching events");
    return NextResponse.json(
      { error: "Erro ao buscar eventos" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { 
      groupId, 
      startsAt, 
      venueId, 
      maxPlayers, 
      maxGoalkeepers, 
      waitlistEnabled,
      // SPRINT 2: Payment fields
      price,
      receiverProfileId,
      autoChargeOnRsvp,
    } = validation.data;

    const existingEventsByUser = await sql<{ total: number }[]>`
      SELECT COUNT(*)::INTEGER AS total
      FROM events
      WHERE created_by = ${user.id}
    `;
    const isFirstEventByUser = Number(existingEventsByUser[0]?.total || 0) === 0;

    // Check if user is admin of the group
    const membershipResult = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;
    const membership = membershipResult[0];

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas admins podem criar eventos" },
        { status: 403 }
      );
    }

    // SPRINT 2: Validate receiver profile if price is set
    if (price && price > 0 && receiverProfileId) {
      const receiverProfileCheck = await sql`
        SELECT id FROM receiver_profiles
        WHERE id = ${receiverProfileId}
        LIMIT 1
      `;
      
      if (!receiverProfileCheck || receiverProfileCheck.length === 0) {
        return NextResponse.json(
          { error: "Perfil de recebedor inválido" },
          { status: 400 }
        );
      }
    }

    const eventResult = await sql`
      INSERT INTO events (
        group_id,
        starts_at,
        venue_id,
        max_players,
        max_goalkeepers,
        waitlist_enabled,
        created_by,
        -- SPRINT 2: Payment fields
        price,
        receiver_profile_id,
        auto_charge_on_rsvp
      )
      VALUES (
        ${groupId},
        ${startsAt},
        ${venueId || null},
        ${maxPlayers},
        ${maxGoalkeepers},
        ${waitlistEnabled},
        ${user.id},
        ${price && price > 0 ? price : null},
        ${receiverProfileId || null},
        ${price && price > 0 ? (autoChargeOnRsvp !== false) : null}
      )
      RETURNING *
    `;
    const event = eventResult[0];

    if (isFirstEventByUser) {
      const earning = await earnCredits(
        sql,
        user.id,
        "first_event_created",
        String(event.id)
      );
      if (earning.deferred || !earning.awarded) {
        logger.info(
          {
            userId: user.id,
            eventId: event.id,
            deferred: earning.deferred,
            reason: earning.reason,
          },
          "First event credit not awarded"
        );
      }
    }

    logger.info({ eventId: event.id, groupId, userId: user.id }, "Event created");

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error creating event");
    return NextResponse.json(
      { error: "Erro ao criar evento" },
      { status: 500 }
    );
  }
}
