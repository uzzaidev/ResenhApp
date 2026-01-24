import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { getModalityById, getAvailablePositions } from "@/lib/modalities";
import { positionsSchema } from "@/lib/validations";
import logger from "@/lib/logger";

/**
 * GET /api/modalities/[id]/positions
 * Get positions of a modality
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

    const positions = await getAvailablePositions(id);

    return NextResponse.json({ positions });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error fetching positions");
    return NextResponse.json(
      { error: "Erro ao buscar posições" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/modalities/[id]/positions
 * Set positions for a modality (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate
    const validation = positionsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { positions } = validation.data;

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
        { error: "Apenas administradores podem configurar posições" },
        { status: 403 }
      );
    }

    // Update positions
    await sql`
      UPDATE sport_modalities
      SET
        positions = ${JSON.stringify(positions)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}
    `;

    logger.info(
      { modalityId: id, userId: user.id, positionsCount: positions.length },
      "Positions configured"
    );

    return NextResponse.json({ positions });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error({ error }, "Error configuring positions");
    return NextResponse.json(
      { error: "Erro ao configurar posições" },
      { status: 500 }
    );
  }
}
