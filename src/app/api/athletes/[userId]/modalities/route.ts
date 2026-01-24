import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { getAthleteModalities, isAthleteInModality } from "@/lib/modalities";
import { athleteModalitySchema } from "@/lib/validations";
import logger from "@/lib/logger";

/**
 * GET /api/athletes/[userId]/modalities?group_id=xxx
 * Get athlete's modalities
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("group_id");

    const modalities = await getAthleteModalities(userId, groupId || undefined);

    return NextResponse.json({ modalities });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error fetching athlete modalities");
    return NextResponse.json(
      { error: "Erro ao buscar modalidades do atleta" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/athletes/[userId]/modalities
 * Add athlete to modality (admin or own athlete)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { userId } = await params;
    const body = await request.json();

    // Validate
    const validation = athleteModalitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get modality to verify group
    const modalityQuery = await sql`
      SELECT group_id FROM sport_modalities
      WHERE id = ${data.modalityId} AND is_active = true
    `;

    if (!modalityQuery || modalityQuery.length === 0) {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    const groupId = modalityQuery[0].group_id;

    // Check permissions (admin or own athlete)
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    const isAdmin = membership.role === "admin";
    const isOwnAthlete = user.id === userId;

    if (!isAdmin && !isOwnAthlete) {
      return NextResponse.json(
        { error: "Você não tem permissão para adicionar este atleta" },
        { status: 403 }
      );
    }

    // Check if already exists
    const exists = await isAthleteInModality(userId, data.modalityId);
    if (exists) {
      return NextResponse.json(
        { error: "Atleta já está vinculado a esta modalidade" },
        { status: 400 }
      );
    }

    // Create relationship
    const result = await sql`
      INSERT INTO athlete_modalities (
        user_id,
        modality_id,
        rating,
        positions,
        is_active
      ) VALUES (
        ${userId},
        ${data.modalityId},
        ${data.rating || null},
        ${data.positions ? JSON.stringify(data.positions) : null}::jsonb,
        ${data.isActive}
      )
      RETURNING *
    `;

    const athleteModality = result[0];

    logger.info(
      { userId, modalityId: data.modalityId, createdBy: user.id },
      "Athlete added to modality"
    );

    return NextResponse.json({
      athleteModality: {
        id: athleteModality.id,
        userId: athleteModality.user_id,
        modalityId: athleteModality.modality_id,
        rating: athleteModality.rating,
        positions: athleteModality.positions,
        isActive: athleteModality.is_active,
        createdAt: athleteModality.created_at,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error adding athlete to modality");
    return NextResponse.json(
      { error: "Erro ao adicionar atleta à modalidade" },
      { status: 500 }
    );
  }
}
