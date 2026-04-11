import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";
import { sql } from "@/db/client";
import { runOptionalCronFunction, validateCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = validateCronRequest(request);
  if (authError) return authError;

  try {
    const result = await runOptionalCronFunction(
      ["cleanup_notifications", "cron_cleanup_notifications"],
      async () => {
        const updated = await sql<{ total: number }[]>`
          WITH marked AS (
            UPDATE notifications
            SET deleted_at = NOW()
            WHERE deleted_at IS NULL
              AND is_read = TRUE
              AND read_at IS NOT NULL
              AND read_at < NOW() - INTERVAL '90 days'
            RETURNING 1
          )
          SELECT COUNT(*)::INTEGER AS total FROM marked
        `;
        return updated[0]?.total ?? 0;
      }
    );

    logger.info(
      {
        processed: result.processed,
        mode: result.mode,
        functionName: result.functionName,
      },
      "Cron cleanup-notifications executed"
    );

    return NextResponse.json({
      ok: true,
      cron: "cleanup-notifications",
      processed: result.processed,
      mode: result.mode,
      functionName: result.functionName ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, "Cron cleanup-notifications failed");
    return NextResponse.json(
      { ok: false, cron: "cleanup-notifications", error: "Internal error" },
      { status: 500 }
    );
  }
}
