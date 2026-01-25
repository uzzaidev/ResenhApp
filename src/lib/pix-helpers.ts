/**
 * Pix Helpers - Business Logic for Pix Generation
 * 
 * Helper functions to generate Pix QR Codes for charges
 * Sprint 3: Pix QR Code + ReceiverProfiles
 */

import { sql } from "@/db/client";
import { generatePixQRCode, validatePixKey } from "./pix";
import logger from "./logger";

export interface GeneratePixForChargeResult {
  success: boolean;
  payload?: string;
  qrImage?: string;
  error?: string;
}

/**
 * Generates Pix QR Code for a charge
 * Fetches receiver profile and generates Pix payload + QR image
 */
export async function generatePixForCharge(
  chargeId: bigint
): Promise<GeneratePixForChargeResult> {
  try {
    // Fetch charge with receiver profile
    const chargeQuery = await sql`
      SELECT 
        c.id,
        c.amount,
        c.description,
        c.event_id,
        c.receiver_profile_id,
        c.pix_payload,
        c.qr_image_url,
        rp.pix_key,
        rp.pix_type,
        rp.name as receiver_name,
        rp.city as receiver_city
      FROM charges c
      LEFT JOIN receiver_profiles rp ON c.receiver_profile_id = rp.id
      WHERE c.id = ${chargeId}
      LIMIT 1
    `;

    if (!chargeQuery || chargeQuery.length === 0) {
      return {
        success: false,
        error: "Charge não encontrada",
      };
    }

    const charge = chargeQuery[0] as any;

    // Check if Pix already generated
    if (charge.pix_payload && charge.qr_image_url) {
      return {
        success: true,
        payload: charge.pix_payload,
        qrImage: charge.qr_image_url,
      };
    }

    // Validate receiver profile exists
    if (!charge.receiver_profile_id || !charge.pix_key) {
      return {
        success: false,
        error: "Receiver profile não configurado para esta cobrança",
      };
    }

    // Validate Pix key
    if (!validatePixKey(charge.pix_key, charge.pix_type)) {
      return {
        success: false,
        error: `Chave Pix inválida: ${charge.pix_type}`,
      };
    }

    // Generate Pix QR Code
    const { payload, qrImage } = await generatePixQRCode({
      pixKey: charge.pix_key,
      pixType: charge.pix_type,
      merchantName: charge.receiver_name || "Peladeiros",
      merchantCity: charge.receiver_city || "São Paulo",
      amount: parseFloat(charge.amount),
      txId: `CHG-${charge.id}`,
      description: charge.description || "Cobrança de treino",
    });

    // Save to database
    await sql`
      UPDATE charges
      SET 
        pix_payload = ${payload},
        qr_image_url = ${qrImage},
        pix_generated_at = NOW()
      WHERE id = ${chargeId}
    `;

    logger.info({ chargeId: charge.id.toString() }, "Pix QR Code generated");

    return {
      success: true,
      payload,
      qrImage,
    };
  } catch (error) {
    logger.error(error, "Error generating Pix for charge");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao gerar Pix",
    };
  }
}

