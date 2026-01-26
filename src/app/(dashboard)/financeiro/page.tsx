import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Users,
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
import Link from 'next/link';

type Charge = {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  description: string | null;
  due_date: string;
  paid_at: string | null;
  event_id: string | null;
  event_name: string | null;
  event_date: string | null;
};

export default async function FinanceiroPage() {
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
          description="Entre em um grupo para acessar o financeiro"
        />
      </div>
    );
  }

  // Buscar cobranças do grupo
  let charges: Charge[] = [];
  let totalRevenue = 0;
  let monthRevenue = 0;
  let pendingAmount = 0;
  let paidCount = 0;
  let totalCount = 0;

  try {
    // Validar groupId
    if (!groupId) {
      throw new Error("groupId é obrigatório");
    }

    // Buscar todas as cobranças do grupo
    const chargesResult = await sql`
      SELECT
        c.id,
        c.user_id,
        COALESCE(u.name, 'Usuário removido') as user_name,
        COALESCE(c.amount, 0)::NUMERIC as amount,
        c.description,
        c.due_date,
        c.paid_at,
        c.event_id,
        e.starts_at as event_date
      FROM charges c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN events e ON c.event_id = e.id
      WHERE c.group_id = ${groupId}::BIGINT
      ORDER BY COALESCE(c.due_date, c.created_at) DESC, c.created_at DESC
      LIMIT 50
    `;

    // Validar e mapear resultados com tipos seguros
    if (Array.isArray(chargesResult) && chargesResult.length > 0) {
      charges = chargesResult.map((charge: any) => {
        const eventDate = charge.event_date ? new Date(charge.event_date) : null;
        const isValidDate = eventDate && !isNaN(eventDate.getTime());
        
        return {
          id: String(charge.id || ''),
          user_id: String(charge.user_id || ''),
          user_name: String(charge.user_name || 'Usuário desconhecido'),
          amount: Number(charge.amount) || 0,
          description: charge.description ? String(charge.description) : null,
          due_date: charge.due_date ? String(charge.due_date) : new Date().toISOString(),
          paid_at: charge.paid_at ? String(charge.paid_at) : null,
          event_id: charge.event_id ? String(charge.event_id) : null,
          event_name: charge.event_id && isValidDate 
            ? `Treino - ${eventDate.toLocaleDateString('pt-BR')}` 
            : null,
          event_date: isValidDate ? eventDate.toISOString() : null,
        };
      });
    }

    // Calcular métricas com validação
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    charges.forEach((charge) => {
      totalCount++;
      const chargeAmount = Number(charge.amount);
      
      // Validar se amount é um número válido
      if (isNaN(chargeAmount) || chargeAmount < 0) {
        console.warn(`Invalid charge amount for charge ${charge.id}: ${charge.amount}`);
        return;
      }

      if (charge.paid_at) {
        paidCount++;
        const paidDate = new Date(charge.paid_at);
        
        // Validar se paid_at é uma data válida
        if (isNaN(paidDate.getTime())) {
          console.warn(`Invalid paid_at date for charge ${charge.id}: ${charge.paid_at}`);
          return;
        }

        // Receita total (últimos 12 meses)
        if (paidDate >= twelveMonthsAgo) {
          totalRevenue += chargeAmount;
        }

        // Receita do mês
        if (paidDate >= firstDayOfMonth) {
          monthRevenue += chargeAmount;
        }
      } else {
        // Soma dos pendentes
        pendingAmount += chargeAmount;
      }
    });
  } catch (error) {
    console.error("Error fetching charges:", error);
    // Não propagar erro, apenas logar - página mostrará estado vazio
  }

  const paymentRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const getStatusBadge = (charge: Charge) => {
    if (charge.paid_at) {
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Pago</Badge>;
    }

    const dueDate = new Date(charge.due_date);
    const now = new Date();

    if (dueDate < now) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }

    return <Badge variant="secondary">Pendente</Badge>;
  };

  const getStatusIcon = (charge: Charge) => {
    if (charge.paid_at) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    const dueDate = new Date(charge.due_date);
    const now = new Date();

    if (dueDate < now) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calcular trend de receita (comparar mês atual com mês anterior)
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
  const lastMonthRevenue = charges
    .filter(c => c.paid_at && new Date(c.paid_at) >= lastMonthStart && new Date(c.paid_at) <= lastMonthEnd)
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

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
          <Button asChild>
            <Link href={`/groups/${groupId}/charges/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Cobrança
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricGrid cols={4}>
        <MetricCard
          feature="financial"
          variant="gradient"
          title="Receita Total"
          value={formatCurrency(totalRevenue)}
          subtitle="Últimos 12 meses"
          icon={DollarSign}
        />
        <MetricCard
          feature="financial"
          title="Receita Este Mês"
          value={formatCurrency(monthRevenue)}
          subtitle={new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          icon={TrendingUp}
          trend={revenueTrend !== 0 ? {
            value: Math.abs(revenueTrend),
            direction: revenueTrend > 0 ? 'up' : 'down'
          } : undefined}
        />
        <MetricCard
          feature="financial"
          title="Pagamentos Pendentes"
          value={formatCurrency(pendingAmount)}
          subtitle={`${totalCount - paidCount} cobrança(s)`}
          icon={Clock}
        />
        <MetricCard
          feature="analytics"
          title="Taxa de Pagamento"
          value={`${paymentRate}%`}
          subtitle="Pagam em dia"
          icon={CheckCircle}
        />
      </MetricGrid>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>
            {charges.length} {charges.length === 1 ? 'cobrança' : 'cobranças'} registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {charges.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhuma cobrança encontrada"
              description="Crie uma nova cobrança manual ou configure treinos com preço para gerar cobranças automáticas"
              action={
                groupId
                  ? {
                      label: "Nova Cobrança",
                      href: `/groups/${groupId}/charges/new`,
                    }
                  : undefined
              }
            >
              {groupId && (
                <Link
                  href="/treinos"
                  className="text-sm text-primary hover:underline"
                >
                  💡 Configurar treinos com preço automático
                </Link>
              )}
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {charges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors"
                >
                  {/* Status Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                    {getStatusIcon(charge)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{charge.user_name}</h3>
                      {getStatusBadge(charge)}
                      {charge.event_id && (
                        <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-500">
                          Treino
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {charge.description || 'Sem descrição'}
                    </p>
                    {charge.event_id && charge.event_name && (
                      <Link
                        href={`/events/${charge.event_id}`}
                        className="text-xs text-violet-500 mt-1 hover:underline inline-flex items-center gap-1"
                      >
                        🏃 Vinculado ao: {charge.event_name}
                      </Link>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>
                        Vencimento:{' '}
                        {new Date(charge.due_date).toLocaleDateString('pt-BR')}
                      </span>
                      {charge.paid_at && (
                        <>
                          <span>•</span>
                          <span className="text-green-500">
                            Pago em:{' '}
                            {new Date(charge.paid_at).toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-500">
                      {formatCurrency(Number(charge.amount))}
                    </div>
                  </div>

                  {/* Actions */}
                  {!charge.paid_at && (
                    <Button variant="outline" size="sm">
                      Marcar como Pago
                    </Button>
                  )}
                  {charge.paid_at && (
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
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
          <div className="flex items-center gap-2">
            <div className="text-sm">
              <span className="font-semibold text-violet-500">
                {charges.filter(c => c.event_id).length}
              </span>
              <span className="text-muted-foreground"> cobrança(s) vinculada(s) a treinos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
