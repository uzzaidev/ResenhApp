import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { validateCoupon } from "@/lib/credits";
import { z } from "zod";

/**
 * POST /api/credits/validate-coupon
 * Validate promotional coupon
 */
const validateSchema = z.object({
  groupId: z.string().uuid(),
  code: z.string().min(1).max(50),
  packagePriceCents: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validation = validateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { groupId, code, packagePriceCents } = validation.data;

    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    if (!membershipQuery || membershipQuery.length === 0) {
      return NextResponse.json({ error: "Voce nao e membro deste grupo" }, { status: 403 });
    }

    const result = await validateCoupon(code, groupId, packagePriceCents);
    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      /nao autenticado|n�o autenticado/i.test(error.message)
    ) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error(error, "Error validating coupon");
    return NextResponse.json({ error: "Erro ao validar cupom" }, { status: 500 });
  }
}

