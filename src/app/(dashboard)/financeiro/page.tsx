'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
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
import { EmptyState } from '@/components/ui/empty-state';

export default function FinanceiroPage() {
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('pendentes');

  // Mock data
  const metrics = {
    receitaTotal: 'R$ 4.850,00',
    receitaMes: 'R$ 1.200,00',
    pendentes: 'R$ 380,00',
    taxaPagamento: 92,
  };

  const payments = [
    {
      id: '1',
      athleteName: 'João Silva',
      description: 'Mensalidade Janeiro 2026',
      amount: 'R$ 100,00',
      dueDate: '2026-01-25',
      status: 'pending' as const,
      trainingRelated: true,
      trainingName: 'Treino Futebol - 22/01',
    },
    {
      id: '2',
      athleteName: 'Maria Santos',
      description: 'Taxa de Jogo Oficial',
      amount: 'R$ 50,00',
      dueDate: '2026-01-20',
      status: 'overdue' as const,
      trainingRelated: false,
    },
    {
      id: '3',
      athleteName: 'Pedro Costa',
      description: 'Mensalidade Janeiro 2026',
      amount: 'R$ 100,00',
      dueDate: '2026-01-15',
      status: 'paid' as const,
      paidDate: '2026-01-14',
      trainingRelated: true,
      trainingName: 'Treino Vôlei - 15/01',
    },
    {
      id: '4',
      athleteName: 'Ana Paula',
      description: 'Uniforme Oficial',
      amount: 'R$ 80,00',
      dueDate: '2026-01-30',
      status: 'pending' as const,
      trainingRelated: false,
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'pendentes') return payment.status === 'pending' || payment.status === 'overdue';
    if (filter === 'pagos') return payment.status === 'paid';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie pagamentos, mensalidades e receitas do grupo
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Cobrança
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="financial"
          variant="gradient"
          title="Receita Total"
          value={metrics.receitaTotal}
          subtitle="Últimos 12 meses"
          icon={DollarSign}
          trend={{ value: 15, direction: 'up' }}
        />
        <MetricCard
          feature="financial"
          title="Receita Este Mês"
          value={metrics.receitaMes}
          subtitle="Janeiro 2026"
          icon={TrendingUp}
          trend={{ value: 8, direction: 'up' }}
        />
        <MetricCard
          feature="financial"
          title="Pagamentos Pendentes"
          value={metrics.pendentes}
          subtitle="3 atletas devem"
          icon={Clock}
        />
        <MetricCard
          feature="analytics"
          title="Taxa de Pagamento"
          value={`${metrics.taxaPagamento}%`}
          subtitle="Pagam em dia"
          icon={CheckCircle}
          trend={{ value: 3, direction: 'up' }}
        />
      </MetricGrid>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'todos' ? 'default' : 'outline'}
          onClick={() => setFilter('todos')}
          size="sm"
        >
          Todos ({payments.length})
        </Button>
        <Button
          variant={filter === 'pendentes' ? 'default' : 'outline'}
          onClick={() => setFilter('pendentes')}
          size="sm"
        >
          Pendentes ({payments.filter(p => p.status !== 'paid').length})
        </Button>
        <Button
          variant={filter === 'pagos' ? 'default' : 'outline'}
          onClick={() => setFilter('pagos')}
          size="sm"
        >
          Pagos ({payments.filter(p => p.status === 'paid').length})
        </Button>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>
            {filteredPayments.length} {filteredPayments.length === 1 ? 'pagamento' : 'pagamentos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhum pagamento encontrado"
              description="Não há pagamentos com esse filtro"
            />
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors"
                >
                  {/* Status Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                    {getStatusIcon(payment.status)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{payment.athleteName}</h3>
                      {getStatusBadge(payment.status)}
                      {payment.trainingRelated && (
                        <Badge variant="outline" className="text-xs">
                          Treino
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                    {payment.trainingRelated && payment.trainingName && (
                      <p className="text-xs text-violet-500 mt-1">
                        🏃 Vinculado ao: {payment.trainingName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>
                        Vencimento:{' '}
                        {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                      {payment.paidDate && (
                        <>
                          <span>•</span>
                          <span className="text-green-500">
                            Pago em:{' '}
                            {new Date(payment.paidDate).toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-500">{payment.amount}</div>
                  </div>

                  {/* Actions */}
                  {payment.status !== 'paid' && (
                    <Button variant="outline" size="sm">
                      Marcar como Pago
                    </Button>
                  )}
                  {payment.status === 'paid' && (
                    <Button variant="ghost" size="sm">
                      Ver Recibo
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training-Related Payments Section */}
      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <CardTitle>Pagamentos por Treino</CardTitle>
              <CardDescription>
                Resolução do problema crítico: conexão entre treinos e pagamentos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Agora você pode vincular pagamentos diretamente aos treinos. Quando um atleta confirma
            presença, o pagamento é automaticamente gerado e vinculado ao treino específico.
          </p>
          <Button variant="outline" size="sm">
            Ver Todos os Pagamentos por Treino
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
