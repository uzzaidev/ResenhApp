import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { hasEnoughCredits, type FeatureType } from "@/lib/credits";
import { z } from "zod";

/**
 * POST /api/credits/check
 * Check if group has enough credits for a feature
 */
const checkSchema = z.object({
  groupId: z.string().uuid(),
  feature: z.enum([
    "recurring_training",
    "qrcode_checkin",
    "convocation",
    "analytics",
    "split_pix",
    "tactical_board",
  ]),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const validation = checkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { groupId, feature } = validation.data;

    // Check if user is member of the group
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

    // Check credits
    const result = await hasEnoughCredits(groupId, feature as FeatureType);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error checking credits");
    return NextResponse.json(
      { error: "Erro ao verificar créditos" },
      { status: 500 }
    );
  }
}

