"use client";

import * as React from "react";
import { Sparkles, Plus, TrendingUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";

export interface CreditsBalanceProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId: string;
  balance: number;
  purchased: number;
  consumed: number;
  onBuyClick?: () => void;
  onHistoryClick?: () => void;
  isLoading?: boolean;
}

export function CreditsBalance({
  className,
  groupId,
  balance,
  purchased,
  consumed,
  onBuyClick,
  onHistoryClick,
  isLoading = false,
  ...props
}: CreditsBalanceProps) {
  const usageRate = purchased > 0 ? (consumed / purchased) * 100 : 0;

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-uzzai-gold to-uzzai-mint">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-poppins">Quota</h3>
            <p className="text-sm text-muted-foreground">Consumo de recursos da plataforma</p>
          </div>
        </div>

        <div className="flex gap-2">
          {onHistoryClick && (
            <Button variant="outline" size="sm" onClick={onHistoryClick} disabled={isLoading}>
              <History className="mr-2 h-4 w-4" />
              Historico
            </Button>
          )}
          {onBuyClick && (
            <Button
              size="sm"
              onClick={onBuyClick}
              disabled={isLoading}
              className="bg-uzzai-mint text-uzzai-black hover:bg-uzzai-mint/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Comprar quota
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Saldo Atual"
          value={isLoading ? "..." : balance.toString()}
          description="Quota disponivel"
          icon={Sparkles}
          variant="gold"
          className={cn("border-2", balance < 20 && "border-red-500/50 bg-red-50/50")}
        />

        <MetricCard
          title="Total Comprado"
          value={isLoading ? "..." : purchased.toString()}
          description="Lifetime"
          icon={TrendingUp}
          variant="blue"
        />

        <MetricCard
          title="Total Consumido"
          value={isLoading ? "..." : consumed.toString()}
          description={`${usageRate.toFixed(0)}% de uso`}
          icon={History}
          variant="silver"
        />
      </div>

      {balance < 20 && !isLoading && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-50 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">Saldo de quota baixo</p>
            <p className="mt-1 text-sm text-yellow-700">
              Voce tem apenas {balance} quotas restantes. Compre mais para continuar usando recursos premium.
            </p>
          </div>
          {onBuyClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={onBuyClick}
              className="flex-shrink-0 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
            >
              Comprar agora
            </Button>
          )}
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-3 text-sm font-semibold">Custo das features premium</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Treino recorrente</span>
            <span className="font-medium">5 quotas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Convocacao</span>
            <span className="font-medium">3 quotas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">QR Code Check-in</span>
            <span className="font-medium">2 quotas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tabelinha Tatica</span>
            <span className="font-medium">1 quota</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Analytics (mensal)</span>
            <span className="font-medium">10 quotas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Split Pix</span>
            <span className="font-medium">15 quotas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
