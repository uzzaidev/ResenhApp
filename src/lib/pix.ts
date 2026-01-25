/**
 * Pix QR Code Generation Library
 * 
 * Implements BR Code (EMV QR Code) format for Pix payments
 * Based on: https://www.bcb.gov.br/estabilidadefinanceira/pix
 * 
 * Sprint 3: Pix QR Code + ReceiverProfiles
 */

import QRCode from "qrcode";

// =====================================================
// Types
// =====================================================

export interface PixData {
  pixKey: string;
  pixType: "cpf" | "cnpj" | "email" | "phone" | "random";
  merchantName: string;
  merchantCity: string;
  amount: number;
  txId: string; // Charge ID or unique identifier
  description?: string;
}

// =====================================================
// Validation
// =====================================================

/**
 * Validates Pix key based on type
 */
export function validatePixKey(key: string, type: string): boolean {
  switch (type) {
    case "cpf":
      // CPF: 11 digits, no formatting
      return /^\d{11}$/.test(key);
    case "cnpj":
      // CNPJ: 14 digits, no formatting
      return /^\d{14}$/.test(key);
    case "email":
      // Email: standard email format
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
    case "phone":
      // Phone: +55 + DDD + number (10 or 11 digits)
      return /^\+55\d{10,11}$/.test(key);
    case "random":
      // Random: 32 alphanumeric characters (UUID format)
      return /^[a-zA-Z0-9]{32}$/.test(key);
    default:
      return false;
  }
}

/**
 * Formats Pix key for display
 */
export function formatPixKey(key: string, type: string): string {
  switch (type) {
    case "cpf":
      return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    case "cnpj":
      return key.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    case "phone":
      return key.replace(/(\+55)(\d{2})(\d{4,5})(\d{4})/, "$1 ($2) $3-$4");
    default:
      return key;
  }
}

// =====================================================
// EMV QR Code Generation (BR Code)
// =====================================================

/**
 * Creates EMV QR Code payload for Pix
 * Format: BR Code (Brazilian standard)
 */
export function generatePixPayload(data: PixData): string {
  // Validate Pix key
  if (!validatePixKey(data.pixKey, data.pixType)) {
    throw new Error(`Invalid Pix key for type ${data.pixType}`);
  }

  // Validate merchant name (max 25 chars)
  const merchantName = data.merchantName.substring(0, 25);
  if (merchantName.length === 0) {
    throw new Error("Merchant name is required");
  }

  // Validate merchant city (max 15 chars)
  const merchantCity = data.merchantCity.substring(0, 15);
  if (merchantCity.length === 0) {
    throw new Error("Merchant city is required");
  }

  // Validate amount (must be positive)
  if (data.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // Format amount to 2 decimal places
  const amount = data.amount.toFixed(2);

  // Build EMV payload
  const payload: string[] = [];

  // Payload Format Indicator (00)
  payload.push("000201");

  // Point of Initiation Method (01) - Static QR Code
  payload.push("0102");

  // Merchant Account Information (26)
  const merchantInfo: string[] = [];
  
  // GUI (00) - Pix identifier
  merchantInfo.push(`0014br.gov.bcb.pix`);
  
  // Key (01) - Pix key
  merchantInfo.push(`01${String(data.pixKey.length).padStart(2, "0")}${data.pixKey}`);

  const merchantInfoStr = merchantInfo.join("");
  payload.push(`26${String(merchantInfoStr.length).padStart(2, "0")}${merchantInfoStr}`);

  // Merchant Category Code (52) - Default: 0000 (General)
  payload.push("040000");

  // Transaction Currency (53) - BRL (986)
  payload.push("0303986");

  // Transaction Amount (54) - Optional for static QR
  if (data.amount > 0) {
    payload.push(`04${String(amount.length).padStart(2, "0")}${amount}`);
  }

  // Country Code (58) - BR
  payload.push("0202BR");

  // Merchant Name (59) - Max 25 chars
  payload.push(`25${String(merchantName.length).padStart(2, "0")}${merchantName}`);

  // Merchant City (60) - Max 15 chars
  payload.push(`15${String(merchantCity.length).padStart(2, "0")}${merchantCity}`);

  // Additional Data Field Template (62)
  const additionalData: string[] = [];
  
  // Reference Label (05) - Transaction ID
  if (data.txId) {
    const txId = data.txId.substring(0, 25); // Max 25 chars
    additionalData.push(`05${String(txId.length).padStart(2, "0")}${txId}`);
  }

  // Description (optional)
  if (data.description) {
    const desc = data.description.substring(0, 25); // Max 25 chars
    additionalData.push(`02${String(desc.length).padStart(2, "0")}${desc}`);
  }

  if (additionalData.length > 0) {
    const additionalDataStr = additionalData.join("");
    payload.push(`62${String(additionalDataStr.length).padStart(2, "0")}${additionalDataStr}`);
  }

  // CRC16 (63) - Will be calculated
  const payloadWithoutCRC = payload.join("");
  const crc = calculateCRC16(payloadWithoutCRC + "6304");
  payload.push(`6304${crc}`);

  return payload.join("");
}

/**
 * Calculates CRC16-CCITT for Pix payload
 */
function calculateCRC16(data: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// =====================================================
// QR Code Image Generation
// =====================================================

/**
 * Generates QR Code image from Pix payload
 * Returns base64 data URL
 */
export async function generatePixQRImage(
  payload: string,
  options?: {
    width?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  }
): Promise<string> {
  const defaultOptions = {
    width: 300,
    errorCorrectionLevel: "M" as const,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };

  const qrOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    const dataUrl = await QRCode.toDataURL(payload, qrOptions);
    return dataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR Code: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generates complete Pix QR Code (payload + image)
 */
export async function generatePixQRCode(
  data: PixData,
  qrOptions?: {
    width?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  }
): Promise<{
  payload: string;
  qrImage: string;
}> {
  const payload = generatePixPayload(data);
  const qrImage = await generatePixQRImage(payload, qrOptions);

  return {
    payload,
    qrImage,
  };
}

