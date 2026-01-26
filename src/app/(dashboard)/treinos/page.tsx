import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard, MetricGrid } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import Link from "next/link";

type Training = {
  id: string;
  starts_at: string;
  status: string;
  venue_name: string | null;
  max_players: number | null;
  confirmed_count: number;
  event_type: string;
};

export default async function TreinosPage() {
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
          description="Entre em um grupo para acessar os treinos"
          action={{
            label: 'Entrar em Grupo',
            onClick: () => {},
          }}
        />
      </div>
    );
  }

  // Buscar eventos do tipo treino (scheduled)
  let upcomingTrainings: Training[] = [];
  let pastTrainings: Training[] = [];
  let totalTrainings = 0;

  try {
    // Próximos treinos
    const upcomingResult = await sql`
      SELECT
        e.id,
        e.starts_at,
        e.status,
        e.max_players,
        e.event_type,
        v.name as venue_name,
        (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes') as confirmed_count
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
        AND e.starts_at > NOW()
        AND e.status = 'scheduled'
        AND (e.event_type = 'training' OR e.event_type IS NULL)
      ORDER BY e.starts_at ASC
      LIMIT 10
    `;
    upcomingTrainings = upcomingResult as any;

    // Treinos passados
    const pastResult = await sql`
      SELECT
        e.id,
        e.starts_at,
        e.status,
        e.max_players,
        e.event_type,
        v.name as venue_name,
        (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes') as confirmed_count
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
        AND e.starts_at < NOW()
        AND (e.event_type = 'training' OR e.event_type IS NULL)
      ORDER BY e.starts_at DESC
      LIMIT 10
    `;
    pastTrainings = pastResult as any;

    // Total de treinos (últimos 30 dias)
    const totalResult = await sql`
      SELECT COUNT(*) as count
      FROM events e
      WHERE e.group_id = ${groupId}
        AND e.starts_at > NOW() - INTERVAL '30 days'
        AND (e.event_type = 'training' OR e.event_type IS NULL)
    `;
    totalTrainings = (totalResult[0] as any).count || 0;
  } catch (error) {
    console.error("Error fetching trainings:", error);
  }

  // Calcular métricas
  const proximosTreinos = upcomingTrainings.length;

  // Participação média (dos treinos que já aconteceram)
  const participacaoMedia = pastTrainings.length > 0
    ? Math.round(
        (pastTrainings.reduce((sum, t) => sum + (t.confirmed_count || 0), 0) /
          pastTrainings.reduce((sum, t) => sum + (t.max_players || 20), 0)) *
          100
      )
    : 85;

  // Treinos esta semana
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  const treinosEstaSemana = upcomingTrainings.filter((t) => {
    const trainingDate = new Date(t.starts_at);
    return trainingDate >= now && trainingDate <= weekEnd;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Treinos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os treinos e acompanhe a frequência dos atletas
          </p>
        </div>

        <Button asChild>
          <Link href={`/groups/${groupId}/events/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Treino
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="trainings"
          title="Total de Treinos"
          value={totalTrainings}
          subtitle="Últimos 30 dias"
          icon={Calendar}
        />
        <MetricCard
          feature="trainings"
          title="Próximos Treinos"
          value={proximosTreinos}
          subtitle="Agendados"
          icon={Clock}
        />
        <MetricCard
          feature="attendance"
          title="Participação Média"
          value={`${participacaoMedia}%`}
          subtitle="Dos atletas confirmam"
          icon={Users}
        />
        <MetricCard
          feature="trainings"
          variant="gradient"
          title="Treinos Esta Semana"
          value={treinosEstaSemana}
          subtitle={`De ${proximosTreinos} agendados`}
          icon={MapPin}
        />
      </MetricGrid>

      {/* Upcoming Trainings List */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Treinos</CardTitle>
          <CardDescription>
            {upcomingTrainings.length} {upcomingTrainings.length === 1 ? 'treino agendado' : 'treinos agendados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTrainings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum treino agendado"
              description="Crie um novo treino para começar a organizar os treinamentos do seu grupo"
              action={{
                label: "Criar Treino",
                href: `/groups/${groupId}/events/new`,
              }}
            >
              <Link
                href="/treinos"
                className="text-sm text-primary hover:underline"
              >
                📚 Ver treinos anteriores
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {upcomingTrainings.map((training) => {
                const trainingDate = new Date(training.starts_at);
                const time = trainingDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Link
                    key={training.id}
                    href={`/events/${training.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/20">
                      <Calendar className="h-6 w-6 text-violet-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Treino</h3>
                        <Badge variant={training.status === 'scheduled' ? 'default' : 'secondary'}>
                          {training.status === 'scheduled' ? 'Agendado' : training.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {trainingDate.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                        </span>
                        {training.venue_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {training.venue_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-violet-500">
                        {training.confirmed_count}/{training.max_players || '∞'}
                      </div>
                      <div className="text-xs text-muted-foreground">confirmados</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Trainings */}
      {pastTrainings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Treinos Anteriores</CardTitle>
            <CardDescription>Últimos {pastTrainings.length} treinos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastTrainings.slice(0, 5).map((training) => {
                const trainingDate = new Date(training.starts_at);
                return (
                  <Link
                    key={training.id}
                    href={`/events/${training.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {trainingDate.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      {training.venue_name && (
                        <div className="text-xs text-muted-foreground">{training.venue_name}</div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {training.confirmed_count} confirmados
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
