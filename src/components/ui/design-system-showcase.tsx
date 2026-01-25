"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Trophy,
  Activity 
} from "lucide-react";

/**
 * Design System Showcase - Demonstração de todos os componentes UzzAI
 * 
 * Este arquivo serve como:
 * 1. Documentação visual dos componentes
 * 2. Teste de integração do design system
 * 3. Referência para desenvolvedores
 * 
 * Para visualizar: Criar uma rota em /app/design-system/page.tsx
 */

export function DesignSystemShowcase() {
  return (
    <div className="container mx-auto p-8 space-y-12 bg-background">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-poppins">
          <span className="text-uzzai-mint">Uzz</span>
          <span className="text-uzzai-blue font-exo2">Ai</span>
          <span className="text-foreground"> Design System</span>
        </h1>
        <p className="text-lg text-muted-foreground font-inter">
          Paleta Retrofuturista • Componentes Base
        </p>
      </div>

      {/* Paleta de Cores */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-poppins">Paleta de Cores</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-uzzai-mint shadow-lg" />
            <p className="text-sm font-semibold">Mint Green</p>
            <p className="text-xs text-muted-foreground font-fira-code">#1ABC9C</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-uzzai-black shadow-lg" />
            <p className="text-sm font-semibold">Eerie Black</p>
            <p className="text-xs text-muted-foreground font-fira-code">#1C1C1C</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-uzzai-silver shadow-lg" />
            <p className="text-sm font-semibold">Silver</p>
            <p className="text-xs text-muted-foreground font-fira-code">#B0B0B0</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-uzzai-blue shadow-lg" />
            <p className="text-sm font-semibold">Blue (NCS)</p>
            <p className="text-xs text-muted-foreground font-fira-code">#2E86AB</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-uzzai-gold shadow-lg" />
            <p className="text-sm font-semibold">Gold</p>
            <p className="text-xs text-muted-foreground font-fira-code">#FFD700</p>
          </div>
        </div>
      </section>

      {/* MetricCard Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-poppins">MetricCard Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Confirmados"
            value="18/20"
            trend={{ value: 15, direction: 'up' }}
            variant="mint"
            icon={Users}
            description="2 vagas restantes"
          />
          <MetricCard
            title="Arrecadado"
            value="R$ 90"
            trendValue="+R$ 15"
            variant="gold"
            icon={DollarSign}
            description="18 pagamentos"
          />
          <MetricCard
            title="Próximo Jogo"
            value="5h"
            variant="blue"
            icon={Calendar}
            description="Quinta, 18h"
          />
          <MetricCard
            title="Artilheiro"
            value="12 gols"
            trend={{ value: 3, direction: 'up' }}
            variant="gold"
            icon={Trophy}
            description="Lucas Silva"
          />
          <MetricCard
            title="Taxa de Presença"
            value="85%"
            trend={{ value: 5, direction: 'down' }}
            variant="silver"
            icon={Activity}
            description="Últimos 30 dias"
          />
          <MetricCard
            title="Win Rate"
            value="75%"
            trend={{ value: 10, direction: 'up' }}
            variant="mint"
            icon={TrendingUp}
            description="12 vitórias"
          />
        </div>
      </section>

      {/* StatusBadge Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-poppins">StatusBadge Component</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Status de Confirmação (RSVP)</CardTitle>
            <CardDescription>Variantes para confirmações de eventos</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatusBadge variant="confirmed">CONFIRMADO</StatusBadge>
            <StatusBadge variant="pending">PENDENTE</StatusBadge>
            <StatusBadge variant="cancelled">CANCELADO</StatusBadge>
            <StatusBadge variant="declined">RECUSADO</StatusBadge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status de Pagamento</CardTitle>
            <CardDescription>Variantes para controle financeiro</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatusBadge variant="paid">PAGO ✓</StatusBadge>
            <StatusBadge variant="unpaid">NÃO PAGO</StatusBadge>
            <StatusBadge variant="payment-pending">PAGAMENTO PENDENTE</StatusBadge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Gerais</CardTitle>
            <CardDescription>Variantes para estados diversos</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatusBadge variant="active">ATIVO</StatusBadge>
            <StatusBadge variant="inactive">INATIVO</StatusBadge>
            <StatusBadge variant="processing">PROCESSANDO</StatusBadge>
            <StatusBadge variant="premium">⭐ PREMIUM</StatusBadge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tamanhos Disponíveis</CardTitle>
            <CardDescription>Small, Medium e Large</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <StatusBadge variant="confirmed" size="sm">SMALL</StatusBadge>
            <StatusBadge variant="confirmed" size="md">MEDIUM</StatusBadge>
            <StatusBadge variant="confirmed" size="lg">LARGE</StatusBadge>
          </CardContent>
        </Card>
      </section>

      {/* ProgressBar Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-poppins">ProgressBar Component</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Variantes de Cor</CardTitle>
            <CardDescription>Diferentes cores para diferentes contextos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Mint (Cor Principal)</p>
              <ProgressBar value={75} variant="mint" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Blue (Confiança)</p>
              <ProgressBar value={60} variant="blue" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Gold (Premium)</p>
              <ProgressBar value={85} variant="gold" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Gradient (Mint → Blue)</p>
              <ProgressBar value={90} variant="gradient" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Gradient Gold (Gold → Mint)</p>
              <ProgressBar value={50} variant="gradient-gold" showLabel labelPosition="top" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tamanhos e Labels</CardTitle>
            <CardDescription>Diferentes tamanhos e posições de label</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Small (Label Top)</p>
              <ProgressBar value={70} variant="mint" size="sm" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Medium (Label Inside)</p>
              <ProgressBar value={65} variant="blue" size="md" showLabel labelPosition="inside" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Large (Label Bottom)</p>
              <ProgressBar value={80} variant="gradient" size="lg" showLabel labelPosition="bottom" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Extra Large (Custom Label)</p>
              <ProgressBar 
                value={18} 
                max={20} 
                variant="gradient" 
                size="xl" 
                showLabel 
                label="18/20 confirmados"
                labelPosition="top"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados Especiais</CardTitle>
            <CardDescription>Sucesso, aviso e erro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Success (100%)</p>
              <ProgressBar value={100} variant="success" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Warning (50%)</p>
              <ProgressBar value={50} variant="warning" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Error (25%)</p>
              <ProgressBar value={25} variant="error" showLabel labelPosition="top" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Animated</p>
              <ProgressBar value={60} variant="gradient" showLabel animated labelPosition="top" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Exemplo Integrado */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-poppins">Exemplo Integrado</h2>
        <Card className="border-uzzai-mint/30 bg-uzzai-mint/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-uzzai-mint to-uzzai-blue rounded-t-lg" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Próxima Pelada</span>
              <StatusBadge variant="active">ATIVO</StatusBadge>
            </CardTitle>
            <CardDescription>Quinta-feira, 18h • Arena Sport</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Confirmados"
                value="18/20"
                trend={{ value: 3, direction: 'up' }}
                variant="mint"
                icon={Users}
              />
              <MetricCard
                title="Arrecadado"
                value="R$ 90"
                trendValue="+R$ 15"
                variant="gold"
                icon={DollarSign}
              />
              <MetricCard
                title="Restam"
                value="5h"
                variant="blue"
                icon={Calendar}
              />
            </div>

            {/* Progresso */}
            <div>
              <ProgressBar 
                value={18} 
                max={20} 
                variant="gradient" 
                size="lg"
                showLabel
                label="18/20 confirmados"
                labelPosition="top"
              />
            </div>

            {/* Lista de Jogadores */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Últimas Confirmações</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 dark:bg-black/20 rounded-lg">
                  <span className="text-sm">Pedro Costa</span>
                  <StatusBadge variant="paid" size="sm">PAGO ✓</StatusBadge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 dark:bg-black/20 rounded-lg">
                  <span className="text-sm">Lucas Silva</span>
                  <StatusBadge variant="confirmed" size="sm">CONFIRMADO</StatusBadge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 dark:bg-black/20 rounded-lg opacity-60">
                  <span className="text-sm">Marcos Alves</span>
                  <StatusBadge variant="pending" size="sm">PENDENTE</StatusBadge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t">
        <p>Design System UzzAI • Paleta Retrofuturista</p>
        <p className="font-fira-code">Versão 1.0 • 2026-02-27</p>
      </div>
    </div>
  );
}

