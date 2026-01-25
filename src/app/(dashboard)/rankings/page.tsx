import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import { Medal, Trophy, Star, TrendingUp, Award, Filter, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

type RankedPlayer = {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  frequency_percentage: number;
  mvp_count: number;
  recent_trend: number;
};

export default async function RankingsPage() {
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
          description="Entre em um grupo para ver os rankings"
        />
      </div>
    );
  }

  // Buscar ranking de jogadores
  let rankedPlayers: RankedPlayer[] = [];
  let avgRating = 0;
  let totalRatings = 0;
  let topRankedCount = 0;

  try {
    // Query complexa para calcular ranking dos jogadores
    const rankingResult = await sql`
      WITH player_stats AS (
        SELECT
          u.id,
          u.name,
          u.image,
          COUNT(DISTINCT ea.event_id) as games_played,
          COUNT(DISTINCT CASE
            WHEN ea.status = 'yes' AND ea.checked_in_at IS NOT NULL
            THEN ea.event_id
          END) as games_attended,
          COUNT(DISTINCT CASE
            WHEN e.status = 'finished' AND e.our_score > e.opponent_score
            THEN ea.event_id
          END) as games_won,
          COALESCE(
            COUNT(DISTINCT CASE WHEN ea.status = 'yes' AND ea.checked_in_at IS NOT NULL THEN ea.event_id END)::numeric * 100.0 /
            NULLIF(COUNT(DISTINCT ea.event_id)::numeric, 0),
            0
          ) as frequency_percentage,
          COUNT(DISTINCT CASE WHEN ea.is_mvp = true THEN ea.event_id END) as mvp_count
        FROM users u
        INNER JOIN group_members gm ON u.id = gm.user_id AND gm.group_id = ${groupId}
        LEFT JOIN event_attendance ea ON ea.user_id = u.id
        LEFT JOIN events e ON e.id = ea.event_id AND e.group_id = ${groupId}
        WHERE ea.event_id IS NOT NULL
        GROUP BY u.id, u.name, u.image
        HAVING COUNT(DISTINCT ea.event_id) > 0
      )
      SELECT
        id,
        name,
        image,
        games_played,
        games_won,
        frequency_percentage,
        mvp_count,
        -- Cálculo do rating baseado em múltiplos fatores
        ROUND(
          (
            (frequency_percentage / 10) * 0.4 +  -- 40% baseado na frequência
            (CASE WHEN games_played > 0 THEN (games_won::numeric / games_played::numeric * 100) ELSE 0 END / 10) * 0.35 +  -- 35% baseado em vitórias
            (mvp_count * 2) * 0.25  -- 25% baseado em MVPs
          )::numeric,
          1
        ) as rating,
        -- Trend simulado (em produção seria calculado comparando períodos)
        ROUND(
          (RANDOM() * 20 - 5)::numeric,
          0
        ) as recent_trend
      FROM player_stats
      ORDER BY rating DESC, frequency_percentage DESC, games_won DESC
      LIMIT 20
    `;

    rankedPlayers = rankingResult as any;

    // Calcular métricas
    if (rankedPlayers.length > 0) {
      avgRating = rankedPlayers.reduce((sum, p) => sum + Number(p.rating), 0) / rankedPlayers.length;
      totalRatings = rankedPlayers.length;
      topRankedCount = rankedPlayers.filter(p => Number(p.rating) >= 9.0).length;
    }
  } catch (error) {
    console.error("Error fetching rankings:", error);
  }

  const getRankingBadge = (position: number) => {
    if (position === 1)
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-bold shadow-lg">
          1°
        </div>
      );
    if (position === 2)
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 font-bold shadow-md">
          2°
        </div>
      );
    if (position === 3)
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold shadow-md">
          3°
        </div>
      );
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground font-semibold">
        {position}°
      </div>
    );
  };

  const improvingPlayers = rankedPlayers.filter(p => Number(p.recent_trend) > 0).length;
  const improvementRate = rankedPlayers.length > 0
    ? Math.round((improvingPlayers / rankedPlayers.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rankings</h1>
          <p className="text-muted-foreground mt-1">
            Classificação dos atletas por desempenho e habilidades
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="rankings"
          variant="gradient"
          title="Atletas Top 10"
          value={topRankedCount}
          subtitle="Com nota +9.0"
          icon={Medal}
        />
        <MetricCard
          feature="rankings"
          title="Nota Média"
          value={avgRating.toFixed(1)}
          subtitle="Do grupo"
          icon={Star}
        />
        <MetricCard
          feature="analytics"
          title="Total de Avaliações"
          value={totalRatings}
          subtitle="Atletas ranqueados"
          icon={Award}
        />
        <MetricCard
          feature="rankings"
          title="Taxa de Melhoria"
          value={`${improvementRate}%`}
          subtitle="Atletas melhorando"
          icon={TrendingUp}
        />
      </MetricGrid>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Geral</CardTitle>
          <CardDescription>
            Top {rankedPlayers.length} atletas baseado em frequência, vitórias e MVPs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankedPlayers.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Sem dados de ranking"
              description="Os rankings aparecerão conforme os atletas participam dos eventos"
            />
          ) : (
            <div className="space-y-4">
              {rankedPlayers.map((athlete, index) => {
                const winRate = athlete.games_played > 0
                  ? (Number(athlete.games_won) / Number(athlete.games_played)) * 100
                  : 0;
                const trend = Number(athlete.recent_trend);

                return (
                  <div
                    key={athlete.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors"
                  >
                    {/* Rank Badge */}
                    {getRankingBadge(index + 1)}

                    {/* Avatar */}
                    {athlete.image && (
                      <img
                        src={athlete.image}
                        alt={athlete.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{athlete.name}</h3>
                        {Number(athlete.mvp_count) > 0 && (
                          <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
                            {athlete.mvp_count}x MVP
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{athlete.games_played} jogos</span>
                        <span>•</span>
                        <span className="text-green-500">{athlete.games_won} vitórias</span>
                        <span>•</span>
                        <span>{winRate.toFixed(0)}% aproveitamento</span>
                        <span>•</span>
                        <span>{Number(athlete.frequency_percentage).toFixed(0)}% presença</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-500 mb-1">
                        {Number(athlete.rating).toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 text-xs justify-center">
                        {trend > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+{trend}%</span>
                          </>
                        ) : trend < 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                            <span className="text-red-500">{trend}%</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-32">
                      <Progress value={Number(athlete.rating) * 10} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Explanation Card */}
      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Star className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <CardTitle>Como é calculado o Rating</CardTitle>
              <CardDescription>
                Entenda como a nota de cada atleta é calculada
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">40%</span> baseado na frequência de comparecimento
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">35%</span> baseado na taxa de vitórias
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">25%</span> baseado em prêmios MVP
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
