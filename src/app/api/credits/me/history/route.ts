import { NextRequest, NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import {
  getPersonalCreditHistory,
  personalCreditsSchemaReady,
} from "@/lib/personal-credits";

/**
 * GET /api/credits/me/history?limit=50
 * Returns personal credit transactions.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const requested = Number(searchParams.get("limit") || 50);
    const limit = Number.isFinite(requested)
      ? Math.max(1, Math.min(200, Math.trunc(requested)))
      : 50;

    const ready = await personalCreditsSchemaReady(sql);
    if (!ready) {
      return NextResponse.json({
        deferred: true,
        schemaReady: false,
        transactions: [],
      });
    }

    const transactions = await getPersonalCreditHistory(sql, user.id, limit);
    return NextResponse.json({
      deferred: false,
      schemaReady: true,
      transactions,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error(error, "Error fetching personal credit history");
    return NextResponse.json(
      { error: "Erro ao buscar historico de quota pessoal" },
      { status: 500 }
    );
  }
}
