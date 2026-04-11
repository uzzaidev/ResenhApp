import { describe, expect, it } from "vitest";

/**
 * Replicates core permission logic from /api/social/feed:
 * - if groupId is provided, user must be a member of the group
 * - without groupId, public feed is always accessible to authenticated users
 */
function canAccessFeed(groupId: string | null, isMember: boolean): boolean {
  if (!groupId) return true;
  return isMember;
}

describe("API /api/social/feed - permission logic", () => {
  it("allows global/public feed when groupId is not provided", () => {
    expect(canAccessFeed(null, false)).toBe(true);
    expect(canAccessFeed(null, true)).toBe(true);
  });

  it("blocks group feed when user is not a member", () => {
    expect(canAccessFeed("10", false)).toBe(false);
  });

  it("allows group feed when user is a member", () => {
    expect(canAccessFeed("10", true)).toBe(true);
  });
});
