import { NextRequest, NextResponse } from "next/server";
import { withCreditsCheck } from "@/lib/credits-middleware";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { z } from "zod";

/**
 * POST /api/recurring-trainings
 * Create recurring training (requires 5 credits)
 * 
 * EXEMPLO DE INTEGRAÇÃO COM SISTEMA DE CRÉDITOS
 */

const createRecurringSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  recurrencePattern: z.object({
    frequency: z.enum(["weekly", "biweekly", "monthly"]),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
  }),
  startDate: z.string(),
  endDate: z.string().optional(),
  venueId: z.string().uuid().optional(),
  maxPlayers: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  // Wrapper automático: verifica auth, membership, créditos e consome
  return withCreditsCheck(
    request,
    "recurring_training", // Feature type (5 créditos)
    async (user, groupId) => {
      // Créditos já foram consumidos automaticamente!
      // Agora implementar a lógica da feature

      const body = await request.json();
      const validation = createRecurringSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: validation.error.flatten() },
          { status: 400 }
        );
      }

      const data = validation.data;

      try {
        // Create recurring training template
        const result = await sql`
          INSERT INTO events (
            group_id,
            name,
            description,
            is_recurring,
            recurrence_pattern,
            event_type,
            venue_id,
            max_players,
            created_by,
            status
          ) VALUES (
            ${groupId},
            ${data.name},
            ${data.description || null},
            TRUE,
            ${JSON.stringify(data.recurrencePattern)}::jsonb,
            'training',
            ${data.venueId || null},
            ${data.maxPlayers || null},
            ${user.id},
            'scheduled'
          )
          RETURNING *
        `;

        const recurringEvent = result[0];

        // Generate occurrences using SQL function
        await sql`
          SELECT generate_recurring_events(
            ${recurringEvent.id}::UUID,
            ${data.startDate}::DATE,
            ${data.endDate || null}::DATE
          )
        `;

        logger.info(
          { groupId, userId: user.id, recurringEventId: recurringEvent.id },
          "Recurring training created (5 credits consumed)"
        );

        return NextResponse.json({
          success: true,
          recurringEvent,
          message: "Treino recorrente criado com sucesso (5 créditos consumidos)",
        });
      } catch (error) {
        logger.error({ error, groupId }, "Error creating recurring training");
        return NextResponse.json(
          { error: "Erro ao criar treino recorrente" },
          { status: 500 }
        );
      }
    },
    {
      autoConsume: true, // Consumir créditos automaticamente
      requireAdmin: true, // Apenas admins podem criar treinos recorrentes
      description: "Criação de treino recorrente",
    }
  );
}

/**
 * GET /api/recurring-trainings?group_id=xxx
 * List recurring trainings (no credits required)
 */
export async function GET(request: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth-helpers");
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("group_id");

    if (!groupId) {
      return NextResponse.json(
        { error: "group_id é obrigatório" },
        { status: 400 }
      );
    }

    // Check membership
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    if (!membershipQuery || membershipQuery.length === 0) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // Get recurring trainings
    const recurringTrainings = await sql`
      SELECT
        id,
        name,
        description,
        recurrence_pattern,
        event_type,
        venue_id,
        max_players,
        created_at
      FROM events
      WHERE group_id = ${groupId}
        AND is_recurring = TRUE
        AND parent_event_id IS NULL
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ recurringTrainings });
  } catch (error) {
    logger.error({ error }, "Error fetching recurring trainings");
    return NextResponse.json(
      { error: "Erro ao buscar treinos recorrentes" },
      { status: 500 }
    );
  }
}

