import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type RouteParams = {
  params: Promise<{ groupId: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { groupId } = await params;

    const membership = await sql`
      SELECT role
      FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
      LIMIT 1
    `;

    if (!membership.length) {
      return NextResponse.json({ error: "VocÃª nÃ£o Ã© membro deste grupo" }, { status: 403 });
    }

    const [activeAthletesQuery, trainingsQuery, attendanceQuery, financialQuery] = await Promise.all([
      sql<{ count: number }[]>`
        SELECT COUNT(*)::INTEGER AS count
        FROM group_members
        WHERE group_id = ${groupId}
      `,
      sql<{ count: number }[]>`
        SELECT COUNT(*)::INTEGER AS count
        FROM events
        WHERE group_id = ${groupId}
          AND starts_at >= DATE_TRUNC('week', NOW())
          AND starts_at < DATE_TRUNC('week', NOW()) + INTERVAL '7 day'
      `,
      sql<{ avg_attendance: number | null }[]>`
        SELECT
          ROUND(AVG(
            CASE
              WHEN e.max_players > 0
              THEN ((SELECT COUNT(*) FROM event_attendance ea WHERE ea.event_id = e.id AND ea.status = 'yes')::NUMERIC * 100) / e.max_players
              ELSE NULL
            END
          ))::INTEGER AS avg_attendance
        FROM events e
        WHERE e.group_id = ${groupId}
          AND e.starts_at >= NOW() - INTERVAL '60 day'
      `,
      sql<{ paid_total: number; pending_total: number }[]>`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END), 0)::INTEGER AS paid_total,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount_cents ELSE 0 END), 0)::INTEGER AS pending_total
        FROM charges
        WHERE group_id = ${groupId}
      `,
    ]);

    const activeAthletes = Number(activeAthletesQuery[0]?.count || 0);
    const trainingsThisWeek = Number(trainingsQuery[0]?.count || 0);
    const averageAttendance = Number(attendanceQuery[0]?.avg_attendance || 0);
    const paidTotalCents = Number(financialQuery[0]?.paid_total || 0);
    const pendingTotalCents = Number(financialQuery[0]?.pending_total || 0);

    return NextResponse.json({
      activeAthletes,
      trainingsThisWeek,
      averageAttendance,
      cashBalance: Math.round(paidTotalCents / 100),
      pendingPayments: Math.round(pendingTotalCents / 100),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NÃ£o autenticado") {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching dashboard metrics");
    return NextResponse.json({ error: "Erro ao buscar mÃ©tricas do dashboard" }, { status: 500 });
  }
}

