import { describe, expect, it } from "vitest";
import { normalizeReferralCode } from "@/lib/referrals";

describe("referrals helpers", () => {
  it("normalizes to uppercase and strips invalid chars", () => {
    expect(normalizeReferralCode(" joao-123 ")).toBe("JOAO123");
    expect(normalizeReferralCode("abc_12@#$")).toBe("ABC_12");
  });

  it("limits referral code length to 32 chars", () => {
    const longCode = "A".repeat(80);
    expect(normalizeReferralCode(longCode)).toHaveLength(32);
  });
});
