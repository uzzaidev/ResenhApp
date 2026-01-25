import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getManagedGroups } from "@/lib/permissions";
import logger from "@/lib/logger";

/**
 * GET /api/groups/managed
 * Get all groups user can manage (admin + hierarchy)
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const groups = await getManagedGroups(user.id);

    return NextResponse.json({ groups });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching managed groups");
    return NextResponse.json(
      { error: "Erro ao buscar grupos gerenciáveis" },
      { status: 500 }
    );
  }
}


