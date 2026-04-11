import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { runOptionalCronFunction, validateCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = validateCronRequest(request);
  if (authError) return authError;

  try {
    const result = await runOptionalCronFunction(
      ["send_event_reminders", "send_reminders", "cron_send_reminders"],
      async () => {
        const upcoming = await sql<{ total: number }[]>`
          SELECT COUNT(*)::INTEGER AS total
          FROM events
          WHERE starts_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
            AND status IN ('scheduled', 'confirmed')
        `;

        return upcoming[0]?.total ?? 0;
      }
    );

    logger.info(
      {
        processed: result.processed,
        mode: result.mode,
        functionName: result.functionName,
      },
      "Cron send-reminders executed"
    );

    return NextResponse.json({
      ok: true,
      cron: "send-reminders",
      processed: result.processed,
      mode: result.mode,
      functionName: result.functionName ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, "Cron send-reminders failed");
    return NextResponse.json(
      { ok: false, cron: "send-reminders", error: "Internal error" },
      { status: 500 }
    );
  }
}
