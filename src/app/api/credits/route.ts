import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { getCreditBalance, getCreditPackages, purchaseCredits } from "@/lib/credits";
import { z } from "zod";

/**
 * GET /api/credits?group_id=xxx
 * Get quota balance for a group
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("group_id");

    if (!groupId) {
      return NextResponse.json({ error: "group_id e obrigatorio" }, { status: 400 });
    }

    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    if (!membershipQuery || membershipQuery.length === 0) {
      return NextResponse.json({ error: "Voce nao e membro deste grupo" }, { status: 403 });
    }

    const balance = await getCreditBalance(groupId);

    if (!balance) {
      return NextResponse.json({ error: "Grupo nao encontrado" }, { status: 404 });
    }

    const packages = await getCreditPackages();

    return NextResponse.json({ balance, packages });
  } catch (error) {
    if (
      error instanceof Error &&
      /nao autenticado|não autenticado/i.test(error.message)
    ) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching credit balance");
    return NextResponse.json({ error: "Erro ao buscar saldo de quota" }, { status: 500 });
  }
}

/**
 * POST /api/credits/purchase
 * Purchase quota package (with optional coupon)
 */
const purchaseSchema = z.object({
  groupId: z.string().uuid(),
  packageId: z.string().uuid(),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validation = purchaseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { groupId, packageId, couponCode } = validation.data;

    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json({ error: "Voce nao e membro deste grupo" }, { status: 403 });
    }

    if (membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem comprar quota" },
        { status: 403 }
      );
    }

    const result = await purchaseCredits(groupId, packageId, user.id, couponCode);

    if (!result.success) {
      const normalizedError = String(result.error || "Erro ao comprar quota").replace(
        /cr[eé]ditos?/gi,
        "quota"
      );
      return NextResponse.json({ error: normalizedError }, { status: 400 });
    }

    const balance = await getCreditBalance(groupId);

    logger.info(
      {
        groupId,
        packageId,
        userId: user.id,
        creditsAdded: result.creditsAdded,
        bonusCredits: result.bonusCredits,
        couponCode,
      },
      "Credits purchased via API"
    );

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      creditsAdded: result.creditsAdded,
      bonusCredits: result.bonusCredits,
      finalPrice: result.finalPrice,
      balance,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      /nao autenticado|não autenticado/i.test(error.message)
    ) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error(error, "Error purchasing credits");
    return NextResponse.json({ error: "Erro ao comprar quota" }, { status: 500 });
  }
}

