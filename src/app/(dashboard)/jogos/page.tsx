'use client';

import { useState } from 'react';
import { Trophy, Calendar, MapPin, Users, Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard, MetricGrid } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function JogosPage() {
  const [filter, setFilter] = useState<'todos' | 'proximos' | 'finalizados'>('proximos');

  // Mock data
  const metrics = {
    totalJogos: 12,
    vitorias: 7,
    empates: 3,
    derrotas: 2,
  };

  const upcomingGames = [
    {
      id: '1',
      modality: 'Futebol',
      opponent: 'Atlética Rival FC',
      date: '2026-01-26',
      time: '15:00',
      location: 'Estádio Municipal',
      competition: 'Campeonato Universitário',
      status: 'scheduled' as const,
    },
    {
      id: '2',
      modality: 'Vôlei',
      opponent: 'Time Campeão',
      date: '2026-01-30',
      time: '19:00',
      location: 'Ginásio Central',
      competition: 'Copa Regional',
      status: 'scheduled' as const,
    },
  ];

  const recentResults = [
    {
      id: '3',
      modality: 'Basquete',
      opponent: 'Adversário A',
      result: 'V',
      score: '78 x 65',
      date: '2026-01-20',
    },
    {
      id: '4',
      modality: 'Futebol',
      opponent: 'Adversário B',
      result: 'E',
      score: '2 x 2',
      date: '2026-01-18',
    },
    {
      id: '5',
      modality: 'Vôlei',
      opponent: 'Adversário C',
      result: 'D',
      score: '1 x 3',
      date: '2026-01-15',
    },
  ];

  const winRate = ((metrics.vitorias / metrics.totalJogos) * 100).toFixed(0);

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

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Jogo
        </Button>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="games"
          title="Total de Jogos"
          value={metrics.totalJogos}
          subtitle="Esta temporada"
          icon={Trophy}
        />
        <MetricCard
          feature="games"
          variant="gradient"
          title="Vitórias"
          value={metrics.vitorias}
          subtitle={`${winRate}% de aproveitamento`}
          icon={Target}
        />
        <MetricCard
          feature="analytics"
          title="Empates"
          value={metrics.empates}
          subtitle="Partidas equilibradas"
          icon={Trophy}
        />
        <MetricCard
          feature="games"
          title="Derrotas"
          value={metrics.derrotas}
          subtitle="Oportunidades de melhoria"
          icon={Trophy}
        />
      </MetricGrid>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'todos' ? 'default' : 'outline'}
          onClick={() => setFilter('todos')}
          size="sm"
        >
          Todos
        </Button>
        <Button
          variant={filter === 'proximos' ? 'default' : 'outline'}
          onClick={() => setFilter('proximos')}
          size="sm"
        >
          Próximos
        </Button>
        <Button
          variant={filter === 'finalizados' ? 'default' : 'outline'}
          onClick={() => setFilter('finalizados')}
          size="sm"
        >
          Finalizados
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Games */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Jogos</CardTitle>
            <CardDescription>{upcomingGames.length} jogos agendados</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingGames.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Nenhum jogo agendado"
                description="Adicione um novo jogo oficial"
                action={{
                  label: 'Novo Jogo',
                  onClick: () => console.log('Criar jogo'),
                }}
              />
            ) : (
              <div className="space-y-4">
                {upcomingGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{game.modality}</h3>
                        <p className="text-sm text-muted-foreground">{game.competition}</p>
                      </div>
                      <Badge>Agendado</Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 text-center p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground mb-1">Nós</div>
                        <div className="font-semibold">UzzAI</div>
                      </div>
                      <div className="text-xl font-bold text-muted-foreground">VS</div>
                      <div className="flex-1 text-center p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground mb-1">Adversário</div>
                        <div className="font-semibold text-sm">{game.opponent}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(game.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {game.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados Recentes</CardTitle>
            <CardDescription>Últimas {recentResults.length} partidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white ${
                      result.result === 'V'
                        ? 'bg-green-500'
                        : result.result === 'E'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {result.result}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{result.modality}</div>
                    <div className="text-xs text-muted-foreground">vs {result.opponent}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{result.score}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(result.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
