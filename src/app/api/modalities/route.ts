import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { getGroupModalities } from "@/lib/modalities";
import { createModalitySchema } from "@/lib/validations";
import logger from "@/lib/logger";

/**
 * GET /api/modalities?group_id=xxx
 * List modalities of a group
 */
export async function GET(request: NextRequest) {
  try {
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

    const modalities = await getGroupModalities(groupId);

    return NextResponse.json({ modalities });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error fetching modalities");
    return NextResponse.json(
      { error: "Erro ao buscar modalidades" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/modalities
 * Create a new modality (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate
    const validation = createModalitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if user is admin
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${data.groupId} AND user_id = ${user.id}
    `;

    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    if (membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar modalidades" },
        { status: 403 }
      );
    }

    // Create modality
    const result = await sql`
      INSERT INTO sport_modalities (
        group_id,
        name,
        icon,
        color,
        trainings_per_week,
        description
      ) VALUES (
        ${data.groupId},
        ${data.name},
        ${data.icon || null},
        ${data.color || null},
        ${data.trainingsPerWeek || null},
        ${data.description || null}
      )
      RETURNING *
    `;

    const modality = result[0];

    logger.info(
      { groupId: data.groupId, modalityId: modality.id, userId: user.id },
      "Modality created"
    );

    return NextResponse.json({
      modality: {
        id: modality.id,
        groupId: modality.group_id,
        name: modality.name,
        icon: modality.icon,
        color: modality.color,
        trainingsPerWeek: modality.trainings_per_week,
        description: modality.description,
        isActive: modality.is_active,
        createdAt: modality.created_at,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error creating modality");
    return NextResponse.json(
      { error: "Erro ao criar modalidade" },
      { status: 500 }
    );
  }
}
