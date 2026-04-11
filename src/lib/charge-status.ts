export type ChargeStatusInput =
  | "pending"
  | "paid"
  | "cancelled"
  | "canceled"
  | "self_reported"
  | "denied";

export function normalizeChargeStatus(status: ChargeStatusInput): Exclude<ChargeStatusInput, "canceled"> {
  return status === "canceled" ? "cancelled" : status;
}

export function validateDeniedStatusReason(
  status: Exclude<ChargeStatusInput, "canceled">,
  denialReason?: string | null
): { valid: boolean; message?: string } {
  if (status !== "denied") {
    return { valid: true };
  }

  if (!denialReason || denialReason.trim().length < 3) {
    return { valid: false, message: "Motivo é obrigatório para negar pagamento" };
  }

  return { valid: true };
}
