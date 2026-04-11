# 🎨 Guia do Design System UzzAI

> **Data:** 2026-02-27  
> **Status:** ✅ Implementado  
> **Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Componentes Implementados](#componentes-implementados)
3. [Como Testar](#como-testar)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Paleta de Cores](#paleta-de-cores)
6. [Tipografia](#tipografia)
7. [Próximos Passos](#próximos-passos)

---

## Visão Geral

O Design System UzzAI foi implementado com base no **Manual de Identidade Visual** e na **Landing Page Peladeiros**, seguindo a estética **Retrofuturista** da marca.

### Arquivos Criados

```
src/
├── components/
│   └── ui/
│       ├── metric-card.tsx           # ✅ Novo
│       ├── status-badge.tsx          # ✅ Novo
│       ├── progress-bar.tsx          # ✅ Novo
│       ├── design-system-showcase.tsx # ✅ Novo (Demo)
│       └── README.md                 # ✅ Novo (Docs)
├── app/
│   └── globals.css                   # ✅ Atualizado
└── tailwind.config.ts                # ✅ Atualizado
```

---

## Componentes Implementados

### 1. MetricCard

**Descrição:** Componente para exibir métricas com tendências e ícones.

**Variantes:** 6 (mint, blue, gold, silver, black, default)

**Features:**
- ✅ Suporte a tendências (↑↓)
- ✅ Ícones customizáveis
- ✅ Gradiente no topo
- ✅ Descrição adicional
- ✅ Responsivo

**Exemplo:**
```tsx
<MetricCard
  title="Confirmados"
  value="18/20"
  trend="up"
  trendValue="+15%"
  variant="mint"
  icon={<Users className="h-4 w-4" />}
  description="2 vagas restantes"
/>
```

---

### 2. StatusBadge

**Descrição:** Componente para exibir status com ícones automáticos.

**Variantes:** 14 (confirmed, pending, cancelled, paid, unpaid, active, inactive, premium, etc.)

**Features:**
- ✅ Ícones automáticos baseados no variant
- ✅ 3 tamanhos (sm, md, lg)
- ✅ Ícones customizáveis
- ✅ Cores UzzAI

**Exemplo:**
```tsx
<StatusBadge variant="confirmed">CONFIRMADO</StatusBadge>
<StatusBadge variant="paid">PAGO ✓</StatusBadge>
<StatusBadge variant="premium" size="lg">⭐ PREMIUM</StatusBadge>
```

---

### 3. ProgressBar

**Descrição:** Componente para exibir progresso com cores customizáveis.

**Variantes:** 11 (mint, blue, gold, gradient, gradient-gold, gradient-blue, success, warning, error, etc.)

**Features:**
- ✅ 4 tamanhos (sm, md, lg, xl)
- ✅ Labels customizáveis (top, bottom, inside)
- ✅ Valor máximo customizável
- ✅ Animação de pulso
- ✅ Gradientes da marca

**Exemplo:**
```tsx
<ProgressBar 
  value={18} 
  max={20} 
  variant="gradient" 
  size="lg"
  showLabel
  label="18/20 confirmados"
  labelPosition="top"
/>
```

---

## Como Testar

### Opção 1: Criar Rota de Teste (Recomendado)

1. **Criar arquivo de rota:**

```bash
# Criar diretório
mkdir -p src/app/design-system

# Criar página
touch src/app/design-system/page.tsx
```

2. **Adicionar conteúdo:**

```tsx
// src/app/design-system/page.tsx
import { DesignSystemShowcase } from "@/components/ui/design-system-showcase";

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
```

3. **Acessar no navegador:**

```
http://localhost:3000/design-system
```

---

### Opção 2: Testar em Componente Existente

**Exemplo: Dashboard**

```tsx
// src/app/dashboard/page.tsx
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Users, DollarSign, Calendar } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Confirmados"
          value="18/20"
          trend="up"
          trendValue="+3"
          variant="mint"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Arrecadado"
          value="R$ 90"
          trend="up"
          trendValue="+R$ 15"
          variant="gold"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Próximo Jogo"
          value="5h"
          trend="neutral"
          variant="blue"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Progresso */}
      <ProgressBar 
        value={18} 
        max={20} 
        variant="gradient" 
        size="lg"
        showLabel
        label="18/20 confirmados"
        labelPosition="top"
      />

      {/* Status */}
      <div className="flex gap-2">
        <StatusBadge variant="confirmed">CONFIRMADO</StatusBadge>
        <StatusBadge variant="paid">PAGO ✓</StatusBadge>
        <StatusBadge variant="pending">PENDENTE</StatusBadge>
      </div>
    </div>
  );
}
```

---

## Exemplos de Uso

### Exemplo 1: Card de Evento

```tsx
<Card className="border-uzzai-mint/30 bg-uzzai-mint/5">
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-uzzai-mint to-uzzai-blue rounded-t-lg" />
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Próxima Pelada</span>
      <StatusBadge variant="active">ATIVO</StatusBadge>
    </CardTitle>
    <CardDescription>Quinta-feira, 18h • Arena Sport</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <MetricCard
        title="Confirmados"
        value="18/20"
        variant="mint"
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Arrecadado"
        value="R$ 90"
        variant="gold"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <MetricCard
        title="Restam"
        value="5h"
        variant="blue"
        icon={<Calendar className="h-4 w-4" />}
      />
    </div>
    
    <ProgressBar 
      value={18} 
      max={20} 
      variant="gradient" 
      size="lg"
      showLabel
      labelPosition="top"
    />
  </CardContent>
</Card>
```

---

### Exemplo 2: Lista de Jogadores

```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
    <span>Pedro Costa</span>
    <StatusBadge variant="paid" size="sm">PAGO ✓</StatusBadge>
  </div>
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
    <span>Lucas Silva</span>
    <StatusBadge variant="confirmed" size="sm">CONFIRMADO</StatusBadge>
  </div>
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-60">
    <span>Marcos Alves</span>
    <StatusBadge variant="pending" size="sm">PENDENTE</StatusBadge>
  </div>
</div>
```

---

### Exemplo 3: Dashboard de Métricas

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <MetricCard
    title="Grupos Ativos"
    value="50+"
    trend="up"
    trendValue="+12"
    variant="mint"
    icon={<Users className="h-4 w-4" />}
  />
  <MetricCard
    title="Retenção D30"
    value="69%"
    trend="up"
    trendValue="+5%"
    variant="gold"
    icon={<TrendingUp className="h-4 w-4" />}
  />
  <MetricCard
    title="Tempo Economizado"
    value="2h"
    trend="neutral"
    variant="blue"
    icon={<Clock className="h-4 w-4" />}
  />
  <MetricCard
    title="Economia Mensal"
    value="R$ 200"
    trend="up"
    trendValue="+R$ 50"
    variant="gold"
    icon={<DollarSign className="h-4 w-4" />}
  />
</div>
```

---

## Paleta de Cores

### Cores Principais

| Cor | Hex | HSL | Uso |
|-----|-----|-----|-----|
| **Mint Green** | `#1ABC9C` | `168 76% 42%` | Cor principal - CTAs, destaques |
| **Eerie Black** | `#1C1C1C` | `0 0% 11%` | Base sólida - Fundos, estruturas |
| **Silver** | `#B0B0B0` | `0 0% 69%` | Neutro - Textos secundários |
| **Blue (NCS)** | `#2E86AB` | `199 58% 42%` | Confiança - Elementos de apoio |
| **Gold** | `#FFD700` | `51 100% 50%` | Premium - Destaques especiais |

### Uso no Tailwind

```tsx
// Backgrounds
className="bg-uzzai-mint"
className="bg-uzzai-black"
className="bg-uzzai-silver"
className="bg-uzzai-blue"
className="bg-uzzai-gold"

// Text
className="text-uzzai-mint"
className="text-uzzai-black"
className="text-uzzai-silver"
className="text-uzzai-blue"
className="text-uzzai-gold"

// Borders
className="border-uzzai-mint"
className="border-uzzai-blue"

// Gradientes
className="bg-gradient-to-r from-uzzai-mint to-uzzai-blue"
className="bg-gradient-to-r from-uzzai-gold to-uzzai-mint"
className="bg-gradient-to-r from-uzzai-black to-uzzai-blue"
```

---

## Tipografia

### Fontes Implementadas

```tsx
// Poppins - Títulos e headlines
className="font-poppins"

// Exo 2 - Elementos tecnológicos e "AI"
className="font-exo2"

// Inter - Corpo do texto (padrão)
className="font-inter"

// Fira Code - Código e elementos técnicos
className="font-fira-code"
```

### Exemplo de Logo

```tsx
<div className="text-4xl">
  <span className="font-poppins font-normal text-uzzai-mint">Uzz</span>
  <span className="font-exo2 font-semibold text-uzzai-blue">Ai</span>
</div>
```

---

## Próximos Passos

### Fase 4: Sistema de Créditos (5 tarefas)

- [ ] **4.1** Backend - API de Créditos
- [ ] **4.2** Frontend - Componentes de Créditos
- [ ] **4.3** Integração em Features Premium

### Fase 5: Hierarquia e Permissões (5 tarefas)

- [ ] **5.1** Lógica de Hierarquia
- [ ] **5.2** Middleware de Autenticação
- [ ] **5.3** UI de Criação de Grupos

---

## 📚 Referências

- **Manual de Identidade Visual:** `docs/18-fase_0/manual-identidade-visual1.html`
- **Landing Page:** `PELADEIROS-LANDING-PAGE-COMPLETE (1).html`
- **Documentação Componentes:** `src/components/ui/README.md`
- **Showcase:** `src/components/ui/design-system-showcase.tsx`

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Design System Base 100% Implementado  
**Próximo:** Fase 4 - Sistema de Créditos






