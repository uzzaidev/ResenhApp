import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import { Trophy, Calendar, MapPin, Users, Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard, MetricGrid } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';

type Game = {
  id: string;
  starts_at: string;
  status: string;
  venue_name: string | null;
  max_players: number | null;
  confirmed_count: number;
  event_type: string;
  opponent: string | null;
  our_score: number | null;
  opponent_score: number | null;
};

export default async function JogosPage() {
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
          description="Entre em um grupo para acessar os jogos oficiais"
        />
      </div>
    );
  }

  // Buscar jogos (events com event_type = 'game' ou 'match')
  let upcomingGames: Game[] = [];
  let recentResults: Game[] = [];
  let totalGames = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  try {
    // Próximos jogos
    const upcomingResult = await sql`
      SELECT
        e.id,
        e.starts_at,
        e.status,
        e.max_players,
        e.event_type,
        v.name as venue_name,
        e.opponent,
        (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes') as confirmed_count
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
        AND e.starts_at > NOW()
        AND e.status = 'scheduled'
        AND (e.event_type = 'game' OR e.event_type = 'match')
      ORDER BY e.starts_at ASC
      LIMIT 10
    `;
    upcomingGames = upcomingResult as any;

    // Resultados recentes (jogos finalizados)
    const recentResult = await sql`
      SELECT
        e.id,
        e.starts_at,
        e.status,
        e.max_players,
        e.event_type,
        v.name as venue_name,
        e.opponent,
        e.our_score,
        e.opponent_score,
        (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes') as confirmed_count
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
        AND e.starts_at < NOW()
        AND (e.event_type = 'game' OR e.event_type = 'match')
      ORDER BY e.starts_at DESC
      LIMIT 10
    `;
    recentResults = recentResult as any;

    // Calcular estatísticas dos resultados
    recentResults.forEach((game) => {
      if (game.our_score !== null && game.opponent_score !== null) {
        totalGames++;
        if (game.our_score > game.opponent_score) {
          wins++;
        } else if (game.our_score === game.opponent_score) {
          draws++;
        } else {
          losses++;
        }
      }
    });
  } catch (error) {
    console.error("Error fetching games:", error);
  }

  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(0) : '0';

  const getResultBadge = (ourScore: number | null, opponentScore: number | null) => {
    if (ourScore === null || opponentScore === null) {
      return { label: 'Sem resultado', variant: 'secondary' as const, color: 'bg-gray-500' };
    }
    if (ourScore > opponentScore) {
      return { label: 'V', variant: 'default' as const, color: 'bg-green-500' };
    }
    if (ourScore === opponentScore) {
      return { label: 'E', variant: 'secondary' as const, color: 'bg-yellow-500' };
    }
    return { label: 'D', variant: 'destructive' as const, color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jogos Oficiais</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe os jogos oficiais e o desempenho da equipe
          </p>
        </div>

        <Button asChild>
          <Link href={`/groups/${groupId}/events/new?type=game`}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Jogo
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="games"
          title="Total de Jogos"
          value={totalGames}
          subtitle="Com resultado"
          icon={Trophy}
        />
        <MetricCard
          feature="games"
          variant="gradient"
          title="Vitórias"
          value={wins}
          subtitle={`${winRate}% de aproveitamento`}
          icon={Target}
        />
        <MetricCard
          feature="analytics"
          title="Empates"
          value={draws}
          subtitle="Partidas equilibradas"
          icon={Trophy}
        />
        <MetricCard
          feature="games"
          title="Derrotas"
          value={losses}
          subtitle="Oportunidades de melhoria"
          icon={Trophy}
        />
      </MetricGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Games */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Jogos</CardTitle>
            <CardDescription>
              {upcomingGames.length} {upcomingGames.length === 1 ? 'jogo agendado' : 'jogos agendados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingGames.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Nenhum jogo agendado"
                description="Crie um novo jogo oficial para competir e acompanhar resultados"
                action={
                  groupId
                    ? {
                        label: "Criar Jogo",
                        href: `/groups/${groupId}/events/new?type=game`,
                      }
                    : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                {upcomingGames.map((game) => {
                  const gameDate = new Date(game.starts_at);
                  const time = gameDate.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <Link
                      key={game.id}
                      href={`/events/${game.id}`}
                      className="block p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">Jogo Oficial</h3>
                          <p className="text-sm text-muted-foreground">{game.event_type}</p>
                        </div>
                        <Badge>Agendado</Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 text-center p-2 rounded bg-background">
                          <div className="text-xs text-muted-foreground mb-1">Nós</div>
                          <div className="font-semibold">UzzAI</div>
                        </div>
                        <div className="text-xl font-bold text-muted-foreground">VS</div>
                        <div className="flex-1 text-center p-2 rounded bg-background">
                          <div className="text-xs text-muted-foreground mb-1">Adversário</div>
                          <div className="font-semibold text-sm">{game.opponent || 'A definir'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {gameDate.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>{time}</span>
                        {game.venue_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {game.venue_name}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados Recentes</CardTitle>
            <CardDescription>
              Últimas {recentResults.filter(r => r.our_score !== null).length} partidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentResults.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Sem resultados ainda"
                description="Os resultados dos jogos aparecerão aqui após as partidas serem finalizadas"
                variant="default"
                size="sm"
              />
            ) : (
              <div className="space-y-3">
                {recentResults.slice(0, 5).map((result) => {
                  const gameDate = new Date(result.starts_at);
                  const badge = getResultBadge(result.our_score, result.opponent_score);

                  return (
                    <Link
                      key={result.id}
                      href={`/events/${result.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white ${badge.color}`}
                      >
                        {badge.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">Jogo Oficial</div>
                        <div className="text-xs text-muted-foreground">
                          vs {result.opponent || 'Adversário'}
                        </div>
                      </div>
                      <div className="text-right">
                        {result.our_score !== null && result.opponent_score !== null ? (
                          <div className="font-bold">{result.our_score} x {result.opponent_score}</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Sem placar</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {gameDate.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                      </div>
                    </Link>
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
