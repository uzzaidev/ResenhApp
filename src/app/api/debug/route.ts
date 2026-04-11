import { NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await requireAuth();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  const hasDbUrl = !!databaseUrl;
  const dbUrlPrefix = databaseUrl ? databaseUrl.substring(0, 20) + "..." : "NOT SET";

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    DATABASE_URL_CONFIGURED: hasDbUrl,
    DATABASE_URL_PREFIX: dbUrlPrefix,
    USING_SUPABASE: !!process.env.SUPABASE_DB_URL,
    USING_NEON: !!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL,
  };

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: envVars,
  });
}
