import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  const hasDbUrl = !!databaseUrl;
  const dbUrlPrefix = databaseUrl 
    ? databaseUrl.substring(0, 20) + "..." 
    : "NOT SET";

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
