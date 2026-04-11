import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  sql: vi.fn(),
}));

import { GET } from "@/app/api/events/route";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";

function request(url: string) {
  return new NextRequest(url);
}

describe("GET /api/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireAuth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
  });

  it("returns 400 when groupId is missing", async () => {
    const response = await GET(request("http://localhost/api/events"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("groupId");
    expect(sql).not.toHaveBeenCalled();
  });

  it("returns 403 when user is not member of the group", async () => {
    (sql as unknown as ReturnType<typeof vi.fn>).mockImplementation((strings: TemplateStringsArray) => {
      const query = strings.join(" ");
      if (query.includes("FROM group_members")) {
        return Promise.resolve([]);
      }
      return { __fragment: true };
    });

    const response = await GET(request("http://localhost/api/events?groupId=group-1"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain("membro");
  });

  it("returns expanded event payload and normalizes canceled status filter", async () => {
    (sql as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (strings: TemplateStringsArray) => {
        const query = strings.join(" ");

        if (query.includes("FROM group_members")) {
          return Promise.resolve([{ role: "member" }]);
        }

        if (query.includes("FROM information_schema.columns")) {
          return Promise.resolve([
            {
              has_event_type: true,
              has_price: true,
              has_opponent: true,
              has_our_score: true,
              has_opponent_score: true,
            },
          ]);
        }

        if (query.includes("FROM events e")) {
          return Promise.resolve([
            {
              id: "event-1",
              group_id: "group-9",
              starts_at: "2026-03-20T18:00:00.000Z",
              status: "scheduled",
              max_players: 20,
              venue_name: "Quadra Central",
              event_type: "training",
              price: 20,
              opponent: null,
              our_score: null,
              opponent_score: null,
              confirmed_count: 8,
              user_rsvp_status: "yes",
            },
          ]);
        }

        return { __fragment: true };
      }
    );

    const response = await GET(
      request("http://localhost/api/events?groupId=group-9&status=canceled&tipo=treino&limit=20")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.events[0]).toMatchObject({
      id: "event-1",
      event_type: "training",
      confirmed_count: 8,
      user_rsvp_status: "yes",
    });

    const allBoundValues = (sql as unknown as ReturnType<typeof vi.fn>).mock.calls
      .flatMap((call) => call.slice(1))
      .filter((value) => typeof value === "string" || typeof value === "number");

    expect(allBoundValues).toContain("group-9");
    expect(allBoundValues).toContain("cancelled");
    expect(allBoundValues).toContain("user-1");
    expect(allBoundValues).toContain(20);
  });
});
