import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { getCreditBalance, getCreditPackages, purchaseCredits } from "@/lib/credits";
import { z } from "zod";

/**
 * GET /api/credits?group_id=xxx
 * Get credit balance for a group
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

    // Get credit balance
    const balance = await getCreditBalance(groupId);

    if (!balance) {
      return NextResponse.json(
        { error: "Grupo não encontrado" },
        { status: 404 }
      );
    }

    // Get credit packages
    const packages = await getCreditPackages();

    return NextResponse.json({
      balance,
      packages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching credit balance");
    return NextResponse.json(
      { error: "Erro ao buscar saldo de créditos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/credits/purchase
 * Purchase credits (with optional coupon)
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

    // Validate request body
    const validation = purchaseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { groupId, packageId, couponCode } = validation.data;

    // Check if user is admin of the group
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

    if (membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem comprar créditos" },
        { status: 403 }
      );
    }

    // Purchase credits
    const result = await purchaseCredits(groupId, packageId, user.id, couponCode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao comprar créditos" },
        { status: 400 }
      );
    }

    // Get updated balance
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
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error purchasing credits");
    return NextResponse.json(
      { error: "Erro ao comprar créditos" },
      { status: 500 }
    );
  }
}

