import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { generatePixForCharge } from "@/lib/pix-helpers";
import logger from "@/lib/logger";

type Params = Promise<{ chargeId: string }>;

/**
 * POST /api/charges/:chargeId/pix
 * Generate or regenerate Pix QR Code for a charge
 * 
 * Sprint 3: Pix QR Code + ReceiverProfiles
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { chargeId } = await params;
    const user = await requireAuth();

    // Validate chargeId is a valid number
    const chargeIdNum = BigInt(chargeId);
    if (!chargeIdNum || chargeIdNum <= 0) {
      return NextResponse.json(
        { error: "ID de cobrança inválido" },
        { status: 400 }
      );
    }

    // Generate Pix QR Code
    const result = await generatePixForCharge(chargeIdNum);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao gerar Pix QR Code" },
        { status: 400 }
      );
    }

    logger.info(
      { chargeId, userId: user.id },
      "Pix QR Code generated/regenerated"
    );

    return NextResponse.json({
      success: true,
      payload: result.payload,
      qrImage: result.qrImage,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error generating Pix QR Code");
    return NextResponse.json(
      { error: "Erro ao gerar Pix QR Code" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/charges/:chargeId/pix
 * Get existing Pix QR Code for a charge
 * 
 * Sprint 3: Pix QR Code + ReceiverProfiles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { chargeId } = await params;
    await requireAuth();

    // Validate chargeId
    const chargeIdNum = BigInt(chargeId);
    if (!chargeIdNum || chargeIdNum <= 0) {
      return NextResponse.json(
        { error: "ID de cobrança inválido" },
        { status: 400 }
      );
    }

    // Generate Pix (will return existing if already generated)
    const result = await generatePixForCharge(chargeIdNum);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Pix QR Code não disponível" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payload: result.payload,
      qrImage: result.qrImage,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching Pix QR Code");
    return NextResponse.json(
      { error: "Erro ao buscar Pix QR Code" },
      { status: 500 }
    );
  }
}

