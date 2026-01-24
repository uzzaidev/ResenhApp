"use client";

import * as React from "react";
import { Sparkles, Plus, TrendingUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";

/**
 * Credits Balance Component
 * 
 * Exibe o saldo de créditos do grupo com métricas e ação de compra.
 * 
 * Features:
 * - Saldo atual
 * - Total comprado
 * - Total consumido
 * - Botão para comprar mais
 * - Histórico de transações
 * 
 * @example
 * <CreditsBalance
 *   groupId="123"
 *   balance={150}
 *   purchased={200}
 *   consumed={50}
 *   onBuyClick={() => setShowModal(true)}
 * />
 */

export interface CreditsBalanceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ID do grupo */
  groupId: string;
  /** Saldo atual de créditos */
  balance: number;
  /** Total de créditos comprados */
  purchased: number;
  /** Total de créditos consumidos */
  consumed: number;
  /** Callback ao clicar em "Comprar Créditos" */
  onBuyClick?: () => void;
  /** Callback ao clicar em "Ver Histórico" */
  onHistoryClick?: () => void;
  /** Loading state */
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
  // Calcular taxa de uso
  const usageRate = purchased > 0 ? (consumed / purchased) * 100 : 0;

  // Determinar cor do saldo baseado na quantidade
  const getBalanceColor = () => {
    if (balance >= 100) return "text-uzzai-mint";
    if (balance >= 50) return "text-uzzai-blue";
    if (balance >= 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-uzzai-gold to-uzzai-mint">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-poppins">Créditos</h3>
            <p className="text-sm text-muted-foreground">
              Sistema de features premium
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {onHistoryClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onHistoryClick}
              disabled={isLoading}
            >
              <History className="mr-2 h-4 w-4" />
              Histórico
            </Button>
          )}
          {onBuyClick && (
            <Button
              size="sm"
              onClick={onBuyClick}
              disabled={isLoading}
              className="bg-uzzai-mint hover:bg-uzzai-mint/90 text-uzzai-black"
            >
              <Plus className="mr-2 h-4 w-4" />
              Comprar Créditos
            </Button>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Saldo Atual */}
        <MetricCard
          title="Saldo Atual"
          value={isLoading ? "..." : balance.toString()}
          description="Créditos disponíveis"
          icon={Sparkles}
          variant="gradient"
          className={cn(
            "border-2",
            balance < 20 && "border-red-500/50 bg-red-50/50"
          )}
        />

        {/* Total Comprado */}
        <MetricCard
          title="Total Comprado"
          value={isLoading ? "..." : purchased.toString()}
          description="Lifetime"
          icon={TrendingUp}
          variant="blue"
        />

        {/* Total Consumido */}
        <MetricCard
          title="Total Consumido"
          value={isLoading ? "..." : consumed.toString()}
          description={`${usageRate.toFixed(0)}% de uso`}
          icon={History}
          variant="silver"
        />
      </div>

      {/* Aviso de saldo baixo */}
      {balance < 20 && !isLoading && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-50 p-4">
          <Sparkles className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">
              Saldo de créditos baixo
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Você tem apenas {balance} créditos restantes. Compre mais para continuar usando features premium.
            </p>
          </div>
          {onBuyClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={onBuyClick}
              className="flex-shrink-0 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
            >
              Comprar Agora
            </Button>
          )}
        </div>
      )}

      {/* Info sobre features */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-sm font-semibold mb-3">Custo das Features Premium</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Treino Recorrente</span>
            <span className="font-medium">5 créditos</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Convocação</span>
            <span className="font-medium">3 créditos</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">QR Code Check-in</span>
            <span className="font-medium">2 créditos</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tabelinha Tática</span>
            <span className="font-medium">1 crédito</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Analytics (mensal)</span>
            <span className="font-medium">10 créditos</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Split Pix</span>
            <span className="font-medium">15 créditos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

