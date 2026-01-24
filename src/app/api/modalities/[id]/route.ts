import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { getModalityById, getModalityAthletes } from "@/lib/modalities";
import { updateModalitySchema } from "@/lib/validations";
import logger from "@/lib/logger";

/**
 * GET /api/modalities/[id]
 * Get modality details with athletes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const modality = await getModalityById(id);

    if (!modality) {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    // Check membership
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${modality.groupId} AND user_id = ${user.id}
    `;

    if (!membershipQuery || membershipQuery.length === 0) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // Get athletes
    const athletes = await getModalityAthletes(id);

    return NextResponse.json({
      modality: {
        ...modality,
        athletes,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error fetching modality");
    return NextResponse.json(
      { error: "Erro ao buscar modalidade" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/modalities/[id]
 * Update modality (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate
    const validation = updateModalitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get modality
    const modality = await getModalityById(id);
    if (!modality) {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    // Check if user is admin
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${modality.groupId} AND user_id = ${user.id}
    `;

    const membership = membershipQuery[0];

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar modalidades" },
        { status: 403 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`);
      values.push(data.icon);
    }
    if (data.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(data.color);
    }
    if (data.trainingsPerWeek !== undefined) {
      updates.push(`trainings_per_week = $${paramIndex++}`);
      values.push(data.trainingsPerWeek);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await sql.unsafe(`
      UPDATE sport_modalities
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    const updated = result[0];

    logger.info(
      { modalityId: id, userId: user.id },
      "Modality updated"
    );

    return NextResponse.json({
      modality: {
        id: updated.id,
        groupId: updated.group_id,
        name: updated.name,
        icon: updated.icon,
        color: updated.color,
        trainingsPerWeek: updated.trainings_per_week,
        description: updated.description,
        positions: updated.positions,
        isActive: updated.is_active,
        updatedAt: updated.updated_at,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error updating modality");
    return NextResponse.json(
      { error: "Erro ao atualizar modalidade" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/modalities/[id]
 * Soft delete modality (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Get modality
    const modality = await getModalityById(id);
    if (!modality) {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    // Check if user is admin
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${modality.groupId} AND user_id = ${user.id}
    `;

    const membership = membershipQuery[0];

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir modalidades" },
        { status: 403 }
      );
    }

    // Soft delete
    await sql`
      UPDATE sport_modalities
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
    `;

    logger.info(
      { modalityId: id, userId: user.id },
      "Modality soft deleted"
    );

    return NextResponse.json({
      success: true,
      message: "Modalidade excluída com sucesso",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error deleting modality");
    return NextResponse.json(
      { error: "Erro ao excluir modalidade" },
      { status: 500 }
    );
  }
}
