'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
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

export default function FrequenciaPage() {
  const [period, setPeriod] = useState<'semana' | 'mes' | 'ano'>('mes');

  // Mock data
  const metrics = {
    taxaPresenca: 87,
    totalPresencas: 156,
    totalFaltas: 24,
    atletasMaisPresentes: 12,
  };

  const athletes = [
    {
      id: '1',
      name: 'João Silva',
      avatar: '/avatars/joao.jpg',
      presences: 28,
      absences: 2,
      rate: 93,
      modality: 'Futebol',
    },
    {
      id: '2',
      name: 'Maria Santos',
      avatar: '/avatars/maria.jpg',
      presences: 25,
      absences: 5,
      rate: 83,
      modality: 'Vôlei',
    },
    {
      id: '3',
      name: 'Pedro Costa',
      avatar: '/avatars/pedro.jpg',
      presences: 24,
      absences: 6,
      rate: 80,
      modality: 'Basquete',
    },
    {
      id: '4',
      name: 'Ana Paula',
      avatar: '/avatars/ana.jpg',
      presences: 22,
      absences: 3,
      rate: 88,
      modality: 'Futebol',
    },
    {
      id: '5',
      name: 'Carlos Lima',
      avatar: '/avatars/carlos.jpg',
      presences: 20,
      absences: 10,
      rate: 67,
      modality: 'Vôlei',
    },
  ];

  const recentTrainings = [
    {
      id: '1',
      modality: 'Futebol',
      date: '2026-01-22',
      presences: 18,
      absences: 2,
      total: 20,
    },
    {
      id: '2',
      modality: 'Vôlei',
      date: '2026-01-21',
      presences: 10,
      absences: 2,
      total: 12,
    },
    {
      id: '3',
      modality: 'Basquete',
      date: '2026-01-20',
      presences: 8,
      absences: 2,
      total: 10,
    },
  ];

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Frequência</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe a presença dos atletas nos treinos
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={period === 'semana' ? 'default' : 'outline'}
            onClick={() => setPeriod('semana')}
            size="sm"
          >
            Semana
          </Button>
          <Button
            variant={period === 'mes' ? 'default' : 'outline'}
            onClick={() => setPeriod('mes')}
            size="sm"
          >
            Mês
          </Button>
          <Button
            variant={period === 'ano' ? 'default' : 'outline'}
            onClick={() => setPeriod('ano')}
            size="sm"
          >
            Ano
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="attendance"
          variant="gradient"
          title="Taxa de Presença"
          value={`${metrics.taxaPresenca}%`}
          subtitle="Média geral"
          icon={CheckCircle}
          trend={{ value: 5, direction: 'up' }}
        />
        <MetricCard
          feature="attendance"
          title="Total de Presenças"
          value={metrics.totalPresencas}
          subtitle="Este mês"
          icon={Users}
          trend={{ value: 12, direction: 'up' }}
        />
        <MetricCard
          feature="analytics"
          title="Faltas"
          value={metrics.totalFaltas}
          subtitle="13% do total"
          icon={XCircle}
        />
        <MetricCard
          feature="attendance"
          title="Atletas Presentes"
          value={metrics.atletasMaisPresentes}
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
              Top {athletes.length} atletas com melhor presença
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {athletes.map((athlete, index) => (
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
                        <h3 className="font-semibold text-sm">{athlete.name}</h3>
                        {getAttendanceBadge(athlete.rate)}
                      </div>
                      <p className="text-xs text-muted-foreground">{athlete.modality}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getAttendanceColor(athlete.rate)}`}>
                        {athlete.rate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {athlete.presences}P / {athlete.absences}F
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <Progress value={athlete.rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trainings */}
        <Card>
          <CardHeader>
            <CardTitle>Treinos Recentes</CardTitle>
            <CardDescription>Frequência dos últimos treinos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrainings.map((training) => {
                const rate = (training.presences / training.total) * 100;
                return (
                  <div key={training.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20">
                        <Calendar className="h-5 w-5 text-pink-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{training.modality}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(training.date).toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          })}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-semibold">{training.presences}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-semibold">{training.absences}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">de {training.total} total</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={rate} className="h-2 flex-1" />
                      <span className="text-xs font-semibold w-12 text-right">
                        {rate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
