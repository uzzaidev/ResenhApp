import { getCurrentUser } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GroupsCard } from "@/components/dashboard/groups-card";
import { UpcomingEventsCard } from "@/components/dashboard/upcoming-events-card";
import { PendingPaymentsCard } from "@/components/dashboard/pending-payments-card";
import { HeroSection } from "@/components/dashboard/hero-section";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { ModalitiesGrid } from "@/components/dashboard/modalities-grid";
import { UpcomingTrainings } from "@/components/dashboard/upcoming-trainings";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { Plus, Users } from "lucide-react";

type Group = {
  id: string;
  name: string;
  description: string | null;
  role: string;
  member_count: number;
};

type Event = {
  id: string;
  starts_at: string;
  status: string;
  group_name: string;
  group_id: string;
  venue_name: string | null;
  confirmed_count: number;
  max_players: number;
  user_status: string | null;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  let groups: Group[] = [];
  let upcomingEvents: Event[] = [];

  try {
    // Get user's groups
    const groupsRaw = await sql`
      SELECT
        g.id,
        g.name,
        g.description,
        gm.role,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${user.id}
      ORDER BY g.created_at DESC
    `;
    groups = groupsRaw as any;
  } catch (error) {
    console.error("Error fetching groups:", error);
  }

  try {
    // Get upcoming events across all groups
    const upcomingEventsRaw = await sql`
      SELECT
        e.id,
        e.starts_at,
        e.status,
        g.name as group_name,
        g.id as group_id,
        v.name as venue_name,
        (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes') as confirmed_count,
        e.max_players,
        ea.status as user_status
      FROM events e
      INNER JOIN groups g ON e.group_id = g.id
      INNER JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.user_id = ${user.id}
      WHERE gm.user_id = ${user.id}
        AND e.starts_at > NOW()
        AND e.status = 'scheduled'
      ORDER BY e.starts_at ASC
      LIMIT 10
    `;
    upcomingEvents = upcomingEventsRaw as any;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
  }

  // Preparar dados para modo direto
  const upcomingEvent = upcomingEvents.length > 0 ? {
    id: upcomingEvents[0].id,
    starts_at: upcomingEvents[0].starts_at,
    confirmed_count: upcomingEvents[0].confirmed_count,
    max_players: upcomingEvents[0].max_players,
    venue_name: upcomingEvents[0].venue_name || undefined,
    group_name: upcomingEvents[0].group_name,
  } : undefined;

  // Stats mockados (pode ser substituído por dados reais)
  const stats = {
    games: 12,
    goals: 8,
    assists: 5,
    winRate: 75,
  };

  // Top scorers mockados (pode ser substituído por dados reais)
  const topScorers = [
    { name: 'Lucas Silva', goals: 12, position: 1 },
    { name: 'Pedro Costa', goals: 8, position: 2 },
    { name: 'Marcos Alves', goals: 7, position: 3 },
  ];

  return (
    <DashboardWrapper
      upcomingEvent={upcomingEvent}
      stats={stats}
      topScorers={topScorers}
    >
      <div className="space-y-8">
        {/* Hero Section V2 */}
        <HeroSection />

        {/* 4 Métricas Principais */}
        <MetricsOverview />

        {/* Grid de Modalidades */}
        <ModalitiesGrid />

        {/* Próximos Treinos */}
        <UpcomingTrainings />

        {/* Payment Notifications */}
        <PendingPaymentsCard userId={user.id} />

        {/* Main Content Grid (Legacy - manter para compatibilidade) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <GroupsCard groups={groups} />
          <UpcomingEventsCard events={upcomingEvents} />
        </div>
      </div>
    </DashboardWrapper>
  );
}
