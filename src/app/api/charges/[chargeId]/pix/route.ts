import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { generatePixForCharge } from "@/lib/pix-helpers";
import logger from "@/lib/logger";

type Params = Promise<{ chargeId: string }>;

function parseChargeId(chargeId: string): bigint | null {
  try {
    const parsed = BigInt(chargeId);
    return parsed > BigInt(0) ? parsed : null;
  } catch {
    return null;
  }
}

function buildPixResponse(result: Awaited<ReturnType<typeof generatePixForCharge>>) {
  return {
    success: true,
    pixKey: result.pixKey,
    pixKeyRaw: result.pixKeyRaw,
    pixType: result.pixType,
    receiverName: result.receiverName,
    bankName: result.bankName,
    instructions: result.instructions,
    // Legacy keys kept for compatibility.
    payload: result.payload,
    qrImage: result.qrImage,
  };
}

/**
 * POST /api/charges/:chargeId/pix
 * Loads static Pix key details for a charge.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { chargeId } = await params;
    const user = await requireAuth();
    const chargeIdNum = parseChargeId(chargeId);

    if (!chargeIdNum) {
      return NextResponse.json(
        { error: "ID de cobrança inválido" },
        { status: 400 }
      );
    }

    const result = await generatePixForCharge(chargeIdNum);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao carregar dados Pix" },
        { status: 400 }
      );
    }

    logger.info({ chargeId, userId: user.id }, "Pix static key loaded");
    return NextResponse.json(buildPixResponse(result));
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error loading Pix data");
    return NextResponse.json(
      { error: "Erro ao carregar dados Pix" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/charges/:chargeId/pix
 * Gets static Pix key details for a charge.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { chargeId } = await params;
    await requireAuth();
    const chargeIdNum = parseChargeId(chargeId);

    if (!chargeIdNum) {
      return NextResponse.json(
        { error: "ID de cobrança inválido" },
        { status: 400 }
      );
    }

    const result = await generatePixForCharge(chargeIdNum);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Dados Pix não disponíveis" },
        { status: 404 }
      );
    }

    return NextResponse.json(buildPixResponse(result));
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching Pix data");
    return NextResponse.json(
      { error: "Erro ao buscar dados Pix" },
      { status: 500 }
    );
  }
}



