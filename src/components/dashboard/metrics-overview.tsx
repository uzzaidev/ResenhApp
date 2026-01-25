"use client";

/**
 * Metrics Overview - Dashboard V2
 * 
 * Grid de 4 métricas principais com trends e sparklines.
 */

import { MetricCard } from "@/components/ui/metric-card";
import { Users, CalendarDays, TrendingUp, DollarSign } from "lucide-react";
import { useGroup } from "@/contexts/group-context";
import { useEffect, useState } from "react";

interface DashboardMetrics {
  activeAthletes: number;
  trainingsThisWeek: number;
  averageAttendance: number;
  cashBalance: number;
  pendingPayments: number;
}

export function MetricsOverview() {
  const { currentGroup } = useGroup();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeAthletes: 0,
    trainingsThisWeek: 0,
    averageAttendance: 0,
    cashBalance: 0,
    pendingPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      if (!currentGroup?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // TODO: Conectar com API real no Sprint 2
        // Por enquanto, mock data
        setMetrics({
          activeAthletes: 127,
          trainingsThisWeek: 8,
          averageAttendance: 72,
          cashBalance: 3450,
          pendingPayments: 850,
        });
      } catch (error) {
        console.error("Error loading metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, [currentGroup?.id]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <MetricCard
            key={i}
            title="Carregando..."
            value="..."
            icon={Users}
            isLoading
            feature="analytics"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Atletas Ativos"
        value={metrics.activeAthletes}
        icon={Users}
        trend={{ value: 12, direction: "up" }}
        feature="athletes"
        sparkline={[100, 105, 110, 115, 120, 125, 127]}
      />

      <MetricCard
        title="Treinos Esta Semana"
        value={metrics.trainingsThisWeek}
        icon={CalendarDays}
        trend={{ value: 2, direction: "up" }}
        feature="trainings"
        sparkline={[5, 6, 6, 7, 7, 8, 8]}
      />

      <MetricCard
        title="Frequência Média"
        value={`${metrics.averageAttendance}%`}
        icon={TrendingUp}
        trend={{ value: 5, direction: "up" }}
        feature="attendance"
        sparkline={[65, 67, 68, 70, 71, 72, 72]}
      />

      <MetricCard
        title="Caixa do Mês"
        value={`R$ ${metrics.cashBalance.toLocaleString("pt-BR")}`}
        subtitle={`R$ ${metrics.pendingPayments.toLocaleString("pt-BR")} pendente`}
        icon={DollarSign}
        trend={{ value: 8, direction: "up" }}
        feature="financial"
        sparkline={[2800, 3000, 3100, 3200, 3300, 3400, 3450]}
      />
    </div>
  );
}

