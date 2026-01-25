import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { MetricCard, MetricGrid } from '@/components/ui/metric-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';

type PlayerFrequency = {
  id: string;
  name: string;
  image: string | null;
  games_played: number;
  games_dm: number;
  games_absent: number;
  total_games: number;
  frequency_percentage: number;
};

type RecentEvent = {
  id: string;
  starts_at: string;
  venue_name: string | null;
  attendance_rate: number;
};

export default async function FrequenciaPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Buscar grupo atual do usuário
  const currentGroup = await getUserCurrentGroup(user.id);
  const groupId = currentGroup?.id || null;

  if (!groupId) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Users}
          title="Você não faz parte de nenhum grupo"
          description="Entre em um grupo para ver as estatísticas de frequência"
        />
      </div>
    );
  }

  // Buscar estatísticas de frequência
  let playerFrequency: PlayerFrequency[] = [];
  let recentEvents: RecentEvent[] = [];

  try {
    // Buscar frequência dos jogadores via API stats
    const statsResult = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/groups/${groupId}/stats`, {
      cache: 'no-store',
    });

    if (statsResult.ok) {
      const stats = await statsResult.json();
      playerFrequency = stats.playerFrequency || [];
    }
  } catch (error) {
    console.error("Error fetching stats via API:", error);
  }

  // Se API falhar, buscar direto do banco
  if (playerFrequency.length === 0) {
    try {
      const frequencyResult = await sql`
        WITH recent_events AS (
          SELECT id
          FROM events
          WHERE group_id = ${groupId}
            AND status = 'finished'
          ORDER BY starts_at DESC
          LIMIT 10
        ),
        total_count AS (
          SELECT COUNT(*) as total FROM recent_events
        )
        SELECT
          u.id,
          u.name,
          u.image,
          COUNT(DISTINCT CASE
            WHEN ea.status = 'yes' AND ea.checked_in_at IS NOT NULL
            THEN ea.event_id
          END) as games_played,
          COUNT(DISTINCT CASE
            WHEN ea.status = 'dm'
            THEN ea.event_id
          END) as games_dm,
          COUNT(DISTINCT CASE
            WHEN ea.status = 'no'
            THEN ea.event_id
          END) as games_absent,
          (SELECT total FROM total_count) as total_games,
          CASE
            WHEN (SELECT total FROM total_count) > 0
            THEN ROUND(
              COUNT(DISTINCT CASE WHEN ea.status = 'yes' AND ea.checked_in_at IS NOT NULL THEN ea.event_id END)::numeric * 100.0 /
              NULLIF((SELECT total FROM total_count)::numeric, 0),
              1
            )
            ELSE 0
          END as frequency_percentage
        FROM users u
        INNER JOIN group_members gm ON u.id = gm.user_id AND gm.group_id = ${groupId}
        LEFT JOIN event_attendance ea ON ea.user_id = u.id
          AND ea.event_id IN (SELECT id FROM recent_events)
        GROUP BY u.id, u.name, u.image
        HAVING COUNT(DISTINCT ea.event_id) > 0
        ORDER BY games_played DESC, frequency_percentage DESC
        LIMIT 15
      `;
      playerFrequency = frequencyResult as any;
    } catch (error) {
      console.error("Error fetching player frequency:", error);
    }
  }

  // Buscar eventos recentes
  try {
    const eventsResult = await sql`
      SELECT
        e.id,
        e.starts_at,
        v.name as venue_name,
        ROUND(
          (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes')::numeric * 100.0 /
          NULLIF(e.max_players::numeric, 0),
          0
        ) as attendance_rate
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
        AND e.status = 'finished'
      ORDER BY e.starts_at DESC
      LIMIT 5
    `;
    recentEvents = eventsResult as any;
  } catch (error) {
    console.error("Error fetching recent events:", error);
  }

  // Calcular métricas
  const totalAthletes = playerFrequency.length;
  const avgFrequency = totalAthletes > 0
    ? Math.round(playerFrequency.reduce((sum, p) => sum + p.frequency_percentage, 0) / totalAthletes)
    : 0;

  const totalPresences = playerFrequency.reduce((sum, p) => sum + p.games_played, 0);
  const totalAbsences = playerFrequency.reduce((sum, p) => sum + p.games_absent, 0);

  const athletesAbove90 = playerFrequency.filter(p => p.frequency_percentage >= 90).length;

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90)
      return (
        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
          Excelente
        </Badge>
      );
    if (rate >= 75)
      return (
        <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
          Bom
        </Badge>
      );
    return (
      <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
        Atenção
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Frequência</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe a presença dos atletas nos treinos e jogos
        </p>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="attendance"
          variant="gradient"
          title="Taxa de Presença"
          value={`${avgFrequency}%`}
          subtitle="Média geral"
          icon={CheckCircle}
        />
        <MetricCard
          feature="attendance"
          title="Total de Presenças"
          value={totalPresences}
          subtitle="Últimos 10 eventos"
          icon={Users}
        />
        <MetricCard
          feature="analytics"
          title="Faltas"
          value={totalAbsences}
          subtitle={`${totalPresences + totalAbsences > 0 ? Math.round((totalAbsences / (totalPresences + totalAbsences)) * 100) : 0}% do total`}
          icon={XCircle}
        />
        <MetricCard
          feature="attendance"
          title="Atletas Presentes"
          value={athletesAbove90}
          subtitle="+90% de frequência"
          icon={TrendingUp}
        />
      </MetricGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Athletes Attendance Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Frequência</CardTitle>
            <CardDescription>
              Top {playerFrequency.length} atletas com melhor presença
            </CardDescription>
          </CardHeader>
          <CardContent>
            {playerFrequency.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sem dados de frequência"
                description="Não há dados suficientes para mostrar o ranking"
              />
            ) : (
              <div className="space-y-4">
                {playerFrequency.map((athlete, index) => (
                  <div key={athlete.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Position */}
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                            ? 'bg-gray-300 text-gray-700'
                            : index === 2
                            ? 'bg-amber-600 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}°
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{athlete.name}</h3>
                          {getAttendanceBadge(athlete.frequency_percentage)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {athlete.games_played} presenças em {athlete.total_games} eventos
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getAttendanceColor(athlete.frequency_percentage)}`}>
                          {athlete.frequency_percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {athlete.games_absent}F
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <Progress value={athlete.frequency_percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>Frequência dos últimos eventos</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Sem eventos finalizados"
                description="Não há eventos finalizados para mostrar"
              />
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => {
                  const rate = event.attendance_rate || 0;
                  const eventDate = new Date(event.starts_at);

                  return (
                    <div key={event.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20">
                          <Calendar className="h-5 w-5 text-pink-500" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">
                            {eventDate.toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'short',
                            })}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.venue_name || 'Local não definido'}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getAttendanceColor(rate)}`}>
                            {rate}%
                          </div>
                          <p className="text-xs text-muted-foreground">presença</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <Progress value={rate} className="h-2 flex-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
