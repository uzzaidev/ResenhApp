import { describe, expect, it } from "vitest";
import { normalizeChargeStatus, validateDeniedStatusReason } from "@/lib/charge-status";

describe("charge-status helpers", () => {
  it("normalizes canceled to cancelled", () => {
    expect(normalizeChargeStatus("canceled")).toBe("cancelled");
  });

  it("keeps non-legacy statuses unchanged", () => {
    expect(normalizeChargeStatus("pending")).toBe("pending");
    expect(normalizeChargeStatus("self_reported")).toBe("self_reported");
  });

  it("requires denial reason when denied", () => {
    expect(validateDeniedStatusReason("denied", "")).toEqual({
      valid: false,
      message: "Motivo é obrigatório para negar pagamento",
    });
    expect(validateDeniedStatusReason("denied", "ok")).toEqual({
      valid: false,
      message: "Motivo é obrigatório para negar pagamento",
    });
    expect(validateDeniedStatusReason("denied", "Pagamento não localizado").valid).toBe(true);
  });
});
