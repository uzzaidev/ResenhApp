'use client';

import { useState } from 'react';
import { Medal, Trophy, Star, TrendingUp, Award, Filter } from 'lucide-react';
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

export default function RankingsPage() {
  const [modalityFilter, setModalityFilter] = useState<string>('todos');
  const [category, setCategory] = useState<'geral' | 'tecnica' | 'presenca'>('geral');

  // Mock data
  const metrics = {
    topRanked: 3,
    avgRating: 8.5,
    totalRatings: 156,
    improvementRate: 12,
  };

  const modalities = [
    { id: 'todos', name: 'Todas' },
    { id: 'futebol', name: 'Futebol' },
    { id: 'volei', name: 'Vôlei' },
    { id: 'basquete', name: 'Basquete' },
  ];

  const athletes = [
    {
      id: '1',
      name: 'João Silva',
      modality: 'Futebol',
      rating: 9.5,
      position: 'Atacante',
      games: 28,
      wins: 22,
      mvp: 5,
      trend: 'up' as const,
      trendValue: 15,
    },
    {
      id: '2',
      name: 'Maria Santos',
      modality: 'Vôlei',
      rating: 9.2,
      position: 'Levantadora',
      games: 25,
      wins: 20,
      mvp: 4,
      trend: 'up' as const,
      trendValue: 8,
    },
    {
      id: '3',
      name: 'Pedro Costa',
      modality: 'Basquete',
      rating: 8.8,
      position: 'Armador',
      games: 24,
      wins: 18,
      mvp: 3,
      trend: 'up' as const,
      trendValue: 5,
    },
    {
      id: '4',
      name: 'Ana Paula',
      modality: 'Futebol',
      rating: 8.5,
      position: 'Meio-Campo',
      games: 22,
      wins: 16,
      mvp: 2,
      trend: 'down' as const,
      trendValue: -3,
    },
    {
      id: '5',
      name: 'Carlos Lima',
      modality: 'Vôlei',
      rating: 8.2,
      position: 'Ponteiro',
      games: 20,
      wins: 14,
      mvp: 2,
      trend: 'up' as const,
      trendValue: 10,
    },
  ];

  const categories = [
    {
      id: 'geral',
      name: 'Geral',
      icon: Trophy,
      description: 'Ranking considerando todos os critérios',
    },
    {
      id: 'tecnica',
      name: 'Técnica',
      icon: Star,
      description: 'Baseado em avaliações técnicas',
    },
    {
      id: 'presenca',
      name: 'Presença',
      icon: Medal,
      description: 'Frequência e participação',
    },
  ];

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

        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avançados
        </Button>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="rankings"
          variant="gradient"
          title="Atletas Top 10"
          value={metrics.topRanked}
          subtitle="Com nota +9.0"
          icon={Medal}
          trend={{ value: 1, direction: 'up' }}
        />
        <MetricCard
          feature="rankings"
          title="Nota Média"
          value={metrics.avgRating.toFixed(1)}
          subtitle="Do grupo"
          icon={Star}
          trend={{ value: 3, direction: 'up' }}
        />
        <MetricCard
          feature="analytics"
          title="Total de Avaliações"
          value={metrics.totalRatings}
          subtitle="Este mês"
          icon={Award}
        />
        <MetricCard
          feature="rankings"
          title="Taxa de Melhoria"
          value={`${metrics.improvementRate}%`}
          subtitle="Atletas melhorando"
          icon={TrendingUp}
        />
      </MetricGrid>

      {/* Category Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                category === cat.id
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-border hover:border-indigo-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    category === cat.id ? 'bg-indigo-500/20' : 'bg-muted'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      category === cat.id ? 'text-indigo-500' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <h3 className="font-semibold">{cat.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
            </button>
          );
        })}
      </div>

      {/* Modality Filters */}
      <div className="flex gap-2">
        {modalities.map((modality) => (
          <Button
            key={modality.id}
            variant={modalityFilter === modality.id ? 'default' : 'outline'}
            onClick={() => setModalityFilter(modality.id)}
            size="sm"
          >
            {modality.name}
          </Button>
        ))}
      </div>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking {category.charAt(0).toUpperCase() + category.slice(1)}</CardTitle>
          <CardDescription>
            Top {athletes.length} atletas na categoria {category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {athletes.map((athlete, index) => {
              const winRate = (athlete.wins / athlete.games) * 100;
              return (
                <div
                  key={athlete.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors"
                >
                  {/* Rank Badge */}
                  {getRankingBadge(index + 1)}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{athlete.name}</h3>
                      <Badge variant="outline">{athlete.modality}</Badge>
                      {athlete.mvp > 0 && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
                          {athlete.mvp}x MVP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{athlete.position}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{athlete.games} jogos</span>
                      <span>•</span>
                      <span className="text-green-500">{athlete.wins} vitórias</span>
                      <span>•</span>
                      <span>{winRate.toFixed(0)}% aproveitamento</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-500 mb-1">
                      {athlete.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {athlete.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                      )}
                      <span
                        className={athlete.trend === 'up' ? 'text-green-500' : 'text-red-500'}
                      >
                        {athlete.trend === 'up' ? '+' : ''}
                        {athlete.trendValue}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-32">
                    <Progress value={athlete.rating * 10} className="h-2" />
                  </div>

                  {/* Actions */}
                  <Button variant="outline" size="sm">
                    Ver Perfil
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
