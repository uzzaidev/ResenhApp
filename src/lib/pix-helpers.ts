/**
 * Pix Helpers - Static key based payment flow (Phase 3)
 */

import { sql } from "@/db/client";
import { formatPixKey, validatePixKey } from "./pix";
import logger from "./logger";

export interface GeneratePixForChargeResult {
  success: boolean;
  payload?: string;
  qrImage?: string | null;
  pixKey?: string;
  pixKeyRaw?: string;
  pixType?: "cpf" | "cnpj" | "email" | "phone" | "random";
  receiverName?: string;
  bankName?: string | null;
  instructions?: string | null;
  error?: string;
}

function mapPixType(value: unknown): GeneratePixForChargeResult["pixType"] {
  const normalized = String(value || "").toLowerCase();
  if (
    normalized === "cpf" ||
    normalized === "cnpj" ||
    normalized === "email" ||
    normalized === "phone" ||
    normalized === "random"
  ) {
    return normalized;
  }
  return undefined;
}

export async function generatePixForCharge(
  chargeId: bigint
): Promise<GeneratePixForChargeResult> {
  try {
    const chargeIdStr = chargeId.toString();

    let chargeRows: any[] = [];
    try {
      chargeRows = await sql`
        SELECT
          c.id,
          c.receiver_profile_id,
          rp.pix_key,
          rp.pix_type,
          rp.name AS receiver_name,
          rp.bank_name,
          rp.instructions
        FROM charges c
        LEFT JOIN receiver_profiles rp ON c.receiver_profile_id = rp.id
        WHERE c.id = ${chargeIdStr}::BIGINT
        LIMIT 1
      `;
    } catch {
      // Compatibility fallback for schemas without bank_name/instructions.
      chargeRows = await sql`
        SELECT
          c.id,
          c.receiver_profile_id,
          rp.pix_key,
          rp.pix_type,
          rp.name AS receiver_name,
          NULL::TEXT AS bank_name,
          NULL::TEXT AS instructions
        FROM charges c
        LEFT JOIN receiver_profiles rp ON c.receiver_profile_id = rp.id
        WHERE c.id = ${chargeIdStr}::BIGINT
        LIMIT 1
      `;
    }

    if (!chargeRows || chargeRows.length === 0) {
      return { success: false, error: "Cobrança não encontrada" };
    }

    const charge = chargeRows[0] as any;
    const pixType = mapPixType(charge.pix_type);
    const pixKeyRaw = String(charge.pix_key || "");

    if (!charge.receiver_profile_id || !pixType || !pixKeyRaw) {
      return {
        success: false,
        error: "Perfil recebedor sem chave PIX válida",
      };
    }

    if (!validatePixKey(pixKeyRaw, pixType)) {
      return {
        success: false,
        error: `Chave PIX inválida: ${pixType}`,
      };
    }

    const formattedKey = formatPixKey(pixKeyRaw, pixType);

    return {
      success: true,
      // Keep legacy keys for backward compatibility with existing clients.
      payload: pixKeyRaw,
      qrImage: null,
      pixKey: formattedKey,
      pixKeyRaw,
      pixType,
      receiverName: charge.receiver_name || "Recebedor",
      bankName: charge.bank_name || null,
      instructions: charge.instructions || null,
    };
  } catch (error) {
    logger.error(error, "Error loading static Pix data for charge");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao carregar Pix",
    };
  }
}
