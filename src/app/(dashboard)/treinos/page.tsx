'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard, MetricGrid } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function TreinosPage() {
  const [filter, setFilter] = useState<'todos' | 'proximos' | 'passados'>('proximos');

  // Mock data - substituir por dados reais da API
  const metrics = {
    totalTreinos: 24,
    proximosTreinos: 3,
    participacaoMedia: 85,
    treinosEstaSemana: 2,
  };

  const upcomingTrainings = [
    {
      id: '1',
      modality: 'Futebol',
      date: '2026-01-25',
      time: '19:00',
      location: 'Quadra Central',
      confirmed: 18,
      total: 20,
      status: 'confirmed' as const,
    },
    {
      id: '2',
      modality: 'Vôlei',
      date: '2026-01-27',
      time: '18:30',
      location: 'Ginásio',
      confirmed: 10,
      total: 12,
      status: 'pending' as const,
    },
    {
      id: '3',
      modality: 'Basquete',
      date: '2026-01-28',
      time: '20:00',
      location: 'Quadra 2',
      confirmed: 8,
      total: 10,
      status: 'confirmed' as const,
    },
  ];

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

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Treino
        </Button>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="trainings"
          title="Total de Treinos"
          value={metrics.totalTreinos}
          subtitle="Últimos 30 dias"
          icon={Calendar}
          trend={{ value: 12, direction: 'up' }}
        />
        <MetricCard
          feature="trainings"
          title="Próximos Treinos"
          value={metrics.proximosTreinos}
          subtitle="Esta semana"
          icon={Clock}
        />
        <MetricCard
          feature="attendance"
          title="Participação Média"
          value={`${metrics.participacaoMedia}%`}
          subtitle="Dos atletas confirmam"
          icon={Users}
          trend={{ value: 5, direction: 'up' }}
        />
        <MetricCard
          feature="trainings"
          variant="gradient"
          title="Treinos Esta Semana"
          value={metrics.treinosEstaSemana}
          subtitle="2 modalidades ativas"
          icon={MapPin}
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
          variant={filter === 'passados' ? 'default' : 'outline'}
          onClick={() => setFilter('passados')}
          size="sm"
        >
          Passados
        </Button>
        <Button variant="outline" size="sm" className="ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Upcoming Trainings List */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Treinos</CardTitle>
          <CardDescription>
            {upcomingTrainings.length} treinos agendados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTrainings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum treino agendado"
              description="Crie um novo treino para começar"
              action={{
                label: 'Novo Treino',
                onClick: () => console.log('Criar treino'),
              }}
            />
          ) : (
            <div className="space-y-4">
              {upcomingTrainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/20">
                    <Calendar className="h-6 w-6 text-violet-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{training.modality}</h3>
                      <Badge
                        variant={training.status === 'confirmed' ? 'default' : 'secondary'}
                      >
                        {training.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(training.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {training.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {training.location}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-violet-500">
                      {training.confirmed}/{training.total}
                    </div>
                    <div className="text-xs text-muted-foreground">confirmados</div>
                  </div>

                  {/* Actions */}
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
