import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { updateAthleteModalitySchema } from "@/lib/validations";
import logger from "@/lib/logger";

/**
 * PATCH /api/athletes/[userId]/modalities/[modalityId]
 * Update athlete's modality data (admin or own athlete)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string; modalityId: string } }
) {
  try {
    const user = await requireAuth();
    const { userId, modalityId } = params;
    const body = await request.json();

    // Validate
    const validation = updateAthleteModalitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get relationship
    const relationshipQuery = await sql`
      SELECT am.*, sm.group_id
      FROM athlete_modalities am
      INNER JOIN sport_modalities sm ON am.modality_id = sm.id
      WHERE am.user_id = ${userId}
        AND am.modality_id = ${modalityId}
        AND am.is_active = true
    `;

    if (!relationshipQuery || relationshipQuery.length === 0) {
      return NextResponse.json(
        { error: "Relacionamento não encontrado" },
        { status: 404 }
      );
    }

    const relationship = relationshipQuery[0];
    const groupId = relationship.group_id;

    // Check permissions
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
        { error: "Você não tem permissão para editar este atleta" },
        { status: 403 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.rating !== undefined) {
      updates.push(`rating = $${paramIndex++}`);
      values.push(data.rating);
    }
    if (data.positions !== undefined) {
      updates.push(`positions = $${paramIndex++}`);
      values.push(JSON.stringify(data.positions));
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    values.push(userId, modalityId);

    const result = await sql.unsafe(`
      UPDATE athlete_modalities
      SET ${updates.join(", ")}
      WHERE user_id = $${paramIndex++} AND modality_id = $${paramIndex}
      RETURNING *
    `, values);

    const updated = result[0];

    logger.info(
      { userId, modalityId, updatedBy: user.id },
      "Athlete modality updated"
    );

    return NextResponse.json({
      athleteModality: {
        id: updated.id,
        userId: updated.user_id,
        modalityId: updated.modality_id,
        rating: updated.rating,
        positions: updated.positions,
        isActive: updated.is_active,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error updating athlete modality");
    return NextResponse.json(
      { error: "Erro ao atualizar modalidade do atleta" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/athletes/[userId]/modalities/[modalityId]
 * Soft delete athlete's modality (admin or own athlete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string; modalityId: string } }
) {
  try {
    const user = await requireAuth();
    const { userId, modalityId } = params;

    // Get relationship
    const relationshipQuery = await sql`
      SELECT am.*, sm.group_id
      FROM athlete_modalities am
      INNER JOIN sport_modalities sm ON am.modality_id = sm.id
      WHERE am.user_id = ${userId}
        AND am.modality_id = ${modalityId}
        AND am.is_active = true
    `;

    if (!relationshipQuery || relationshipQuery.length === 0) {
      return NextResponse.json(
        { error: "Relacionamento não encontrado" },
        { status: 404 }
      );
    }

    const relationship = relationshipQuery[0];
    const groupId = relationship.group_id;

    // Check permissions
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
        { error: "Você não tem permissão para remover este atleta" },
        { status: 403 }
      );
    }

    // Soft delete
    await sql`
      UPDATE athlete_modalities
      SET is_active = false
      WHERE user_id = ${userId} AND modality_id = ${modalityId}
    `;

    logger.info(
      { userId, modalityId, deletedBy: user.id },
      "Athlete removed from modality"
    );

    return NextResponse.json({
      success: true,
      message: "Atleta removido da modalidade",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error removing athlete from modality");
    return NextResponse.json(
      { error: "Erro ao remover atleta da modalidade" },
      { status: 500 }
    );
  }
}
