import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";
import { ensureUserReferralCode, referralsSchemaReady } from "@/lib/referrals";

export async function GET() {
  try {
    const user = await requireAuth();
    const ready = await referralsSchemaReady(sql);
    if (!ready) {
      return NextResponse.json({
        deferred: true,
        schemaReady: false,
        referralCode: null,
      });
    }

    const referralCode = await ensureUserReferralCode(sql, user.id, user.name);
    const origin = process.env.NEXT_PUBLIC_APP_URL || "";
    const shareUrl = referralCode
      ? `${origin ? origin.replace(/\/+$/, "") : ""}/auth/signup?ref=${encodeURIComponent(referralCode)}`
      : null;

    const stats = await sql<{ total: number; rewarded: number }[]>`
      SELECT
        COUNT(*)::INTEGER AS total,
        COUNT(*) FILTER (WHERE status = 'rewarded')::INTEGER AS rewarded
      FROM referrals
      WHERE referrer_id = ${user.id}::UUID
    `;

    return NextResponse.json({
      deferred: false,
      schemaReady: true,
      referralCode,
      shareUrl,
      stats: {
        total: Number(stats[0]?.total || 0),
        rewarded: Number(stats[0]?.rewarded || 0),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NÃ£o autenticado") {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching referral data");
    return NextResponse.json(
      { error: "Erro ao buscar dados de referral" },
      { status: 500 }
    );
  }
}
