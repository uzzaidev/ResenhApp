import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type CronResult = {
  processed: number;
  mode: "function" | "fallback";
  functionName?: string;
};

export function validateCronRequest(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error("CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function runOptionalCronFunction(
  candidates: string[],
  fallback: () => Promise<number>
): Promise<CronResult> {
  const available = await sql<{ name: string }[]>`
    SELECT p.proname AS name
    FROM pg_proc p
    INNER JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.pronargs = 0
      AND p.proname = ANY(${candidates})
    LIMIT 1
  `;

  const functionName = available[0]?.name;
  if (!functionName) {
    const processed = await fallback();
    return { processed, mode: "fallback" };
  }

  const result = await sql.unsafe(
    `SELECT public.${functionName}() AS result`
  );

  const value = result[0]?.result;
  const processed = typeof value === "number" ? value : 0;

  return { processed, mode: "function", functionName };
}
