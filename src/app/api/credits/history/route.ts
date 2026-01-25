import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { getCreditTransactions, getCouponHistory } from "@/lib/credits";

/**
 * GET /api/credits/history?group_id=xxx
 * Get credit transaction history for a group
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("group_id");
    const limit = parseInt(searchParams.get("limit") || "50");

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

    // Get transaction history
    const transactions = await getCreditTransactions(groupId, limit);

    // Get coupon history
    const coupons = await getCouponHistory(groupId);

    return NextResponse.json({
      transactions,
      coupons,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching credit history");
    return NextResponse.json(
      { error: "Erro ao buscar histórico de créditos" },
      { status: 500 }
    );
  }
}


