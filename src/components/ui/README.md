# Design System UzzAI - Componentes UI

> **Paleta Retrofuturista** baseada no Manual de Identidade Visual UzzAI

---

## 🎨 Cores da Marca

| Cor | Hex | Uso |
|-----|-----|-----|
| **Mint Green** | `#1ABC9C` | Cor principal - CTAs, destaques, elementos principais |
| **Eerie Black** | `#1C1C1C` | Base sólida - Fundos, estruturas, navegação |
| **Silver** | `#B0B0B0` | Neutro - Textos secundários (usar com moderação) |
| **Blue (NCS)** | `#2E86AB` | Confiança - Elementos de apoio, acentos |
| **Gold** | `#FFD700` | Premium - Destaques especiais (usar com cuidado) |

---

## 📦 Componentes Disponíveis

### 1. MetricCard

Componente para exibir métricas com tendências e ícones.

**Exemplo de Uso:**

```tsx
import { MetricCard } from "@/components/ui/metric-card";
import { Users } from "lucide-react";

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

**Variantes Disponíveis:**
- `mint` - Verde menta (cor principal)
- `blue` - Azul tecnológico
- `gold` - Dourado premium
- `silver` - Prata neutro
- `black` - Preto sólido
- `default` - Padrão do sistema

**Props:**
- `title` (string) - Título da métrica
- `value` (string | number) - Valor principal
- `trend` ("up" | "down" | "neutral") - Tendência
- `trendValue` (string) - Valor da tendência (ex: "+15%")
- `description` (string) - Descrição adicional
- `icon` (ReactNode) - Ícone opcional
- `showGradient` (boolean) - Mostrar gradiente no topo (padrão: true)

---

### 2. StatusBadge

Componente para exibir status com ícones automáticos.

**Exemplo de Uso:**

```tsx
import { StatusBadge } from "@/components/ui/status-badge";

<StatusBadge variant="confirmed">CONFIRMADO</StatusBadge>
<StatusBadge variant="pending">PENDENTE</StatusBadge>
<StatusBadge variant="paid">PAGO ✓</StatusBadge>
<StatusBadge variant="premium" size="lg">⭐ PREMIUM</StatusBadge>
```

**Variantes Disponíveis:**

**Status de Confirmação (RSVP):**
- `confirmed` - Confirmado (verde com ✓)
- `pending` - Pendente (dourado com ⏱)
- `cancelled` - Cancelado (vermelho com ✗)
- `declined` - Recusado (vermelho com ✗)

**Status de Pagamento:**
- `paid` - Pago (verde com ✓)
- `unpaid` - Não pago (vermelho com ✗)
- `payment-pending` - Pagamento pendente (dourado com ⏱)

**Status Gerais:**
- `active` - Ativo (mint)
- `inactive` - Inativo (silver)
- `processing` - Processando (blue)
- `premium` - Premium (gradiente gold-mint)

**Status Neutros:**
- `default` - Padrão (silver)
- `info` - Informação (blue)
- `warning` - Aviso (gold)
- `error` - Erro (red)
- `success` - Sucesso (green)

**Props:**
- `variant` - Variante de status (ver acima)
- `size` ("sm" | "md" | "lg") - Tamanho do badge
- `showIcon` (boolean) - Mostrar ícone automático (padrão: true)
- `icon` (ReactNode) - Ícone customizado (sobrescreve o automático)

---

### 3. ProgressBar

Componente para exibir progresso com cores customizáveis.

**Exemplo de Uso:**

```tsx
import { ProgressBar } from "@/components/ui/progress-bar";

<ProgressBar 
  value={75} 
  variant="mint" 
  showLabel 
  labelPosition="top"
/>

<ProgressBar 
  value={18} 
  max={20} 
  variant="gradient" 
  size="lg"
  showLabel
  label="18/20 confirmados"
/>
```

**Variantes Disponíveis:**
- `mint` - Verde menta
- `blue` - Azul
- `gold` - Dourado
- `silver` - Prata
- `black` - Preto
- `gradient` - Gradiente mint-blue
- `gradient-gold` - Gradiente gold-mint
- `gradient-blue` - Gradiente blue-mint
- `success` - Verde sucesso
- `warning` - Amarelo aviso
- `error` - Vermelho erro
- `default` - Padrão do sistema

**Props:**
- `value` (number) - Valor do progresso (0-100)
- `max` (number) - Valor máximo (padrão: 100)
- `variant` - Variante de cor (ver acima)
- `size` ("sm" | "md" | "lg" | "xl") - Tamanho da barra
- `showLabel` (boolean) - Mostrar label com porcentagem
- `label` (string) - Label customizado
- `labelPosition` ("top" | "bottom" | "inside") - Posição do label
- `animated` (boolean) - Animação de pulso

---

## 🎯 Gradientes da Marca

Use os gradientes para elementos especiais:

```tsx
// Mint → Gold (elementos premium)
className="bg-gradient-to-r from-uzzai-mint to-uzzai-gold"

// Blue → Mint (visualizações e processamento)
className="bg-gradient-to-r from-uzzai-blue to-uzzai-mint"

// Black → Blue (fundos e navegação)
className="bg-gradient-to-r from-uzzai-black to-uzzai-blue"
```

---

## 📝 Diretrizes de Uso

### Hierarquia de Cores (Ordem de Importância)

1. **Mint Green (#1ABC9C)** - Cor principal
   - Use para CTAs, destaques e elementos de marca
   - Ideal para fundos quando precisar de energia

2. **Eerie Black (#1C1C1C)** - Base sólida
   - Cor de fundo principal
   - Use para estruturas, navegação e elementos que precisam de solidez

3. **Silver (#B0B0B0)** - Equilíbrio
   - Use com moderação para textos secundários
   - Evite excessos para não criar sensação "fria"

4. **Blue NCS (#2E86AB)** - Confiança
   - Use para elementos de apoio e acentos
   - Cuidado ao usar próximo ao verde para não perder impacto

5. **Gold (#FFD700)** - Destaque Premium
   - Use com muito cuidado para elementos especiais
   - Evite excessos para não parecer "luxo/ostentação"

---

## 🔤 Tipografia

### Fontes Oficiais

- **Poppins** - Títulos e headlines (geométrica, moderna)
- **Exo 2** - Elementos tecnológicos e "AI" (futurista)
- **Inter** - Corpo do texto e informações (UI-focused)
- **Fira Code** - Código e elementos técnicos (monospace)

**Uso no Tailwind:**

```tsx
className="font-poppins"  // Poppins
className="font-exo2"     // Exo 2
className="font-inter"    // Inter (padrão)
className="font-fira-code" // Fira Code
```

---

## 🚀 Exemplos Práticos

### Dashboard Card com Métrica

```tsx
<MetricCard
  title="Próxima Pelada"
  value="Quinta, 18h"
  variant="mint"
  icon={<Calendar className="h-4 w-4" />}
  description="Arena Sport • R$ 5,00/pessoa"
/>
```

### Lista de Confirmados

```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
    <span>Pedro Costa</span>
    <StatusBadge variant="paid">PAGO ✓</StatusBadge>
  </div>
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
    <span>Lucas Silva</span>
    <StatusBadge variant="pending">PENDENTE</StatusBadge>
  </div>
</div>
```

### Progresso de Confirmações

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Confirmados</span>
    <span className="font-bold text-uzzai-mint">18/20</span>
  </div>
  <ProgressBar 
    value={18} 
    max={20} 
    variant="gradient" 
    size="md"
  />
</div>
```

---

## 📚 Referências

- **Manual de Identidade Visual:** `docs/18-fase_0/manual-identidade-visual1.html`
- **Landing Page:** `PELADEIROS-LANDING-PAGE-COMPLETE (1).html`
- **Tailwind Config:** `tailwind.config.ts`
- **Global Styles:** `src/app/globals.css`

---

**Última atualização:** 2026-02-27  
**Versão:** 1.0  
**Design System:** UzzAI Retrofuturista


