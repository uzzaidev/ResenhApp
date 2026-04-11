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
      ["calculate_metrics", "cron_calculate_metrics", "refresh_leaderboards"],
      async () => {
        const mvTopScorers = await sql<{ exists: string | null }[]>`
          SELECT to_regclass('public.mv_top_scorers')::TEXT AS exists
        `;
        if (mvTopScorers[0]?.exists) {
          await sql`REFRESH MATERIALIZED VIEW public.mv_top_scorers`;
        }

        const mvEventScoreboard = await sql<{ exists: string | null }[]>`
          SELECT to_regclass('public.mv_event_scoreboard')::TEXT AS exists
        `;
        if (mvEventScoreboard[0]?.exists) {
          await sql`REFRESH MATERIALIZED VIEW public.mv_event_scoreboard`;
        }

        return 1;
      }
    );

    logger.info(
      {
        processed: result.processed,
        mode: result.mode,
        functionName: result.functionName,
      },
      "Cron calculate-metrics executed"
    );

    return NextResponse.json({
      ok: true,
      cron: "calculate-metrics",
      processed: result.processed,
      mode: result.mode,
      functionName: result.functionName ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, "Cron calculate-metrics failed");
    return NextResponse.json(
      { ok: false, cron: "calculate-metrics", error: "Internal error" },
      { status: 500 }
    );
  }
}
