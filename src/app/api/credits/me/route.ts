import { NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import {
  getOrInitPersonalWallet,
  personalCreditsSchemaReady,
} from "@/lib/personal-credits";

/**
 * GET /api/credits/me
 * Returns personal wallet balance and summary.
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const ready = await personalCreditsSchemaReady(sql);

    if (!ready) {
      return NextResponse.json({
        deferred: true,
        schemaReady: false,
        wallet: {
          balance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });
    }

    const wallet = await getOrInitPersonalWallet(sql, user.id);
    return NextResponse.json({
      deferred: false,
      schemaReady: true,
      wallet: wallet ?? {
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      },
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error(error, "Error fetching personal credits");
    return NextResponse.json(
      { error: "Erro ao buscar quota pessoal" },
      { status: 500 }
    );
  }
}
