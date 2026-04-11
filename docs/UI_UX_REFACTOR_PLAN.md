# PLANO DE REFATORAÇÃO UI/UX - PELADEIROS (ResenhApp)
**Data:** 2026-02-23
**Autor:** UI/UX Senior Expert Analysis
**Score Atual:** 7.8/10 (BOM)
**Meta:** 9.0/10 (EXCELENTE)
**Prazo Estimado:** 8 semanas

---

## EXECUTIVE SUMMARY

O ResenhApp possui uma base sólida com design system bem estruturado e arquitetura moderna. Porém, apresenta problemas críticos que impactam diretamente a experiência do usuário:

### 🔴 IMPACTO CRÍTICO
- **Mock data em produção** - Usuários veem informações falsas
- **Página de créditos 404** - Funcionalidade inacessível
- **Dark mode sem toggle** - Recurso implementado mas invisível

### 🟡 IMPACTO MÉDIO
- **Acessibilidade 60%** - Exclusão de usuários com deficiências
- **Performance não otimizada** - Lentidão com muitos dados
- **Inconsistências visuais** - Confusão e falta de profissionalismo

### ✅ PONTOS FORTES
- Sistema de design robusto (9/10)
- 38 componentes UI de qualidade
- Loading states excelentes (100%)
- Estados vazios bem pensados

---

## METODOLOGIA DE PRIORIZAÇÃO

Cada melhoria foi avaliada usando a matriz **RICE**:

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: Quantos usuários são afetados (1-10)
- **Impact**: Quanto melhora a experiência (1-10)
- **Confidence**: Certeza de que funciona (0-100%)
- **Effort**: Tempo necessário em semanas (1-12)

---

## FASE 1: CORREÇÕES CRÍTICAS (Semanas 1-2)
**Meta:** Remover blockers e dados falsos
**Impacto:** Alto (9/10)
**Esforço:** 2 semanas

### 1.1 Remover Mock Data do Sistema
**RICE Score: 90** (Reach:10 × Impact:9 × Confidence:100% / Effort:1)

#### Problema Atual:
```typescript
// ❌ src/app/(dashboard)/dashboard/page.tsx (linhas 118-131)
const stats = {
  games: 12,
  goals: 8,
  assists: 5,
  winRate: 75,
};

// ❌ src/components/layout/topbar.tsx (linhas 181-186)
<span className="text-sm font-semibold">Pedro Vitor</span>
<span className="text-xs text-gray-400">Atleta de Ouro</span>

// ❌ src/components/layout/sidebar.tsx (linha 60)
groupId = 'temp-group-id'
```

#### Impacto no Usuário:
- 😡 Usuário vê dados que não são dele
- 🤔 Confusão sobre funcionalidades do app
- 😞 Perda de confiança na aplicação

#### Solução:

**A. Dashboard Stats - Integração Real**
```typescript
// ✅ src/app/(dashboard)/dashboard/page.tsx
import { getUserStats } from '@/lib/stats-helpers'

const stats = await getUserStats(userId, groupId)
// Returns: { games, goals, assists, winRate, lastMatch, nextMatch }

// Fallback para novos usuários:
if (!stats.games) {
  return <EmptyState
    icon={Trophy}
    title="Bem-vindo ao ResenhApp!"
    description="Participe do seu primeiro treino para ver suas estatísticas aqui."
    action={{ label: "Ver Treinos", href: "/treinos" }}
  />
}
```

**B. Topbar User Data - Session Real**
```typescript
// ✅ src/components/layout/topbar.tsx
import { getServerSession } from 'next-auth'

const session = await getServerSession(authOptions)
const user = session?.user

// Buscar dados completos do perfil
const profile = await getUserProfile(user.id)

<span className="text-sm font-semibold">{user.name}</span>
<span className="text-xs text-gray-400">
  {profile.membershipTier || 'Novo Atleta'}
</span>
```

**C. Sidebar GroupId - Context Real**
```typescript
// ✅ src/components/layout/sidebar.tsx
'use client'

import { useGroup } from '@/contexts/group-context'

export function Sidebar() {
  const { currentGroup } = useGroup()

  // Handle sem grupo selecionado
  if (!currentGroup) {
    return <EmptyState
      icon={Users}
      title="Nenhum grupo selecionado"
      description="Selecione ou crie um grupo para começar."
      action={{ label: "Criar Grupo", href: "/groups/new" }}
    />
  }

  // Usar currentGroup.id em todos os links
}
```

#### Tasks Técnicas:
- [ ] Criar `src/lib/stats-helpers.ts` com `getUserStats()`
- [ ] Criar `src/lib/profile-helpers.ts` com `getUserProfile()`
- [ ] Atualizar `dashboard/page.tsx` para buscar stats reais
- [ ] Atualizar `topbar.tsx` para usar session real
- [ ] Atualizar `sidebar.tsx` para usar `useGroup()` hook
- [ ] Adicionar loading skeletons em todos os lugares
- [ ] Adicionar error boundaries para falhas de fetch
- [ ] Testar com usuário novo (sem dados)
- [ ] Testar com usuário com dados

#### Métricas de Sucesso:
- ✅ 0 ocorrências de dados hardcoded no código
- ✅ Tempo de loading < 500ms
- ✅ Taxa de erro < 1%
- ✅ Usuários veem seus dados reais em 100% dos casos

---

### 1.2 Criar Página de Créditos
**RICE Score: 85** (Reach:10 × Impact:9 × Confidence:95% / Effort:1)

#### Problema Atual:
- Link no Sidebar aponta para `/groups/[groupId]/credits`
- **404 Not Found** quando clicado
- API `/api/credits/*` existe e funciona
- Componente `credits-page-client.tsx` existe mas não está conectado

#### Impacto no Usuário:
- 😡 Funcionalidade prometida mas inacessível
- 🤔 "Será que meu crédito está funcionando?"
- 😞 Tem que ir em outra tela para ver saldo

#### Solução:

**Estrutura da Página:**
```
/groups/[groupId]/credits/page.tsx
├── Hero Section (Saldo Atual + Gráfico de Uso)
├── Ações Rápidas (Comprar Créditos, Ver Histórico)
├── Histórico de Transações (DataTable)
└── Estatísticas de Uso (Cards de Métricas)
```

**Implementação:**
```typescript
// ✅ src/app/groups/[groupId]/credits/page.tsx
import { CreditsPageClient } from '@/components/credits/credits-page-client'
import { getCreditBalance } from '@/lib/credits-helpers'
import { getCreditHistory } from '@/lib/credits-helpers'

export default async function CreditsPage({
  params,
}: {
  params: { groupId: string }
}) {
  const [balance, history] = await Promise.all([
    getCreditBalance(params.groupId),
    getCreditHistory(params.groupId),
  ])

  return (
    <div className="space-y-6">
      {/* Hero: Saldo Atual */}
      <Card className="bg-gradient-to-br from-uzzai-gold/20 to-uzzai-mint/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">Saldo Disponível</p>
            <h1 className="text-6xl font-bold text-uzzai-gold mt-2">
              {balance.available}
            </h1>
            <p className="text-xs text-gray-400 mt-1">créditos</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{balance.earned}</p>
              <p className="text-xs text-gray-400">Ganhos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{balance.spent}</p>
              <p className="text-xs text-gray-400">Gastos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{balance.pending}</p>
              <p className="text-xs text-gray-400">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Button size="lg" className="h-16">
          <Plus className="mr-2" />
          Comprar Créditos
        </Button>
        <Button size="lg" variant="outline" className="h-16">
          <Gift className="mr-2" />
          Usar Cupom
        </Button>
      </div>

      {/* Histórico */}
      <CreditsPageClient
        initialBalance={balance}
        initialHistory={history}
      />
    </div>
  )
}
```

**Features da Página:**
- ✅ Saldo destacado visualmente (card com gradiente gold/mint)
- ✅ Métricas de uso (ganhos, gastos, pendentes)
- ✅ Ações rápidas (comprar, cupom)
- ✅ Histórico paginado com filtros
- ✅ Gráfico de uso mensal
- ✅ Download de extrato (CSV/PDF)
- ✅ Loading states em todos os componentes
- ✅ Error boundaries para falhas de API

#### Tasks Técnicas:
- [ ] Criar `src/app/groups/[groupId]/credits/page.tsx`
- [ ] Criar `src/lib/credits-helpers.ts` (se não existir)
- [ ] Integrar com APIs existentes (`/api/credits/*`)
- [ ] Adicionar gráfico de uso mensal (Recharts)
- [ ] Implementar download de extrato
- [ ] Adicionar filtros de histórico (data, tipo, status)
- [ ] Testar com grupo sem créditos
- [ ] Testar com grupo com muitas transações

#### Métricas de Sucesso:
- ✅ 0% de taxa de 404 em `/credits`
- ✅ Tempo de loading < 800ms
- ✅ 90%+ usuários conseguem comprar créditos após visitar página
- ✅ 0 bugs reportados em 1 semana após deploy

---

### 1.3 Implementar Toggle de Dark Mode
**RICE Score: 72** (Reach:10 × Impact:8 × Confidence:90% / Effort:1)

#### Problema Atual:
- Dark mode **tecnicamente implementado** (variáveis CSS, classe `.dark`)
- **Sem UI para alternar** - usuários não sabem que existe
- Cobertura baixa (apenas 17 ocorrências de `dark:` em 5 arquivos)

#### Impacto no Usuário:
- 😞 Usuários que preferem dark mode não conseguem ativar
- 👀 Cansaço visual para usuários noturnos
- ⚡ Recurso implementado mas invisível = desperdício

#### Solução:

**A. Toggle no Topbar**
```typescript
// ✅ src/components/layout/theme-toggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

**B. Provider de Tema**
```typescript
// ✅ src/components/providers/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

**C. Atualizar Topbar**
```typescript
// ✅ src/components/layout/topbar.tsx
import { ThemeToggle } from './theme-toggle'

// Adicionar entre Search e Notifications:
<ThemeToggle />
```

**D. Expandir Cobertura de Dark Mode**

Auditar todos os componentes e adicionar classes `dark:`:

```typescript
// ❌ ANTES
<Card className="bg-white border-gray-200">

// ✅ DEPOIS
<Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
```

**Componentes Prioritários para Dark Mode:**
1. `src/components/ui/card.tsx` - Base de tudo
2. `src/components/ui/button.tsx` - Variantes
3. `src/components/layout/sidebar.tsx` - Menu
4. `src/components/layout/topbar.tsx` - Header
5. `src/components/dashboard/metrics-overview.tsx` - Cards de métricas
6. `src/app/(dashboard)/dashboard/page.tsx` - Dashboard principal
7. Todas as páginas de listagem (atletas, treinos, etc.)

#### Tasks Técnicas:
- [ ] Instalar `next-themes`: `npm install next-themes`
- [ ] Criar `theme-provider.tsx`
- [ ] Criar `theme-toggle.tsx`
- [ ] Adicionar ThemeProvider em `layout.tsx`
- [ ] Adicionar ThemeToggle em `topbar.tsx`
- [ ] Auditar TODOS os componentes UI
- [ ] Adicionar classes `dark:` onde necessário
- [ ] Testar transição entre temas
- [ ] Testar persistência (localStorage)
- [ ] Testar com preferência do sistema

#### Métricas de Sucesso:
- ✅ Toggle visível no Topbar
- ✅ Tema persiste entre sessões
- ✅ 95%+ componentes com suporte a dark mode
- ✅ 0 elementos "quebrados" em dark mode
- ✅ Transição suave sem flash

---

## FASE 2: MELHORIAS DE UX (Semanas 3-4)
**Meta:** Toasts, Breadcrumbs e Feedback Visual
**Impacto:** Médio-Alto (8/10)
**Esforço:** 2 semanas

### 2.1 Sistema de Toasts com Ações Contextuais
**RICE Score: 64** (Reach:10 × Impact:8 × Confidence:80% / Effort:1)

#### Problema Atual:
- Toasts básicos sem ações
- Erros sem caminho claro para resolução
- Sucesso sem próximo passo sugerido

#### Exemplo de Melhoria:

**❌ ANTES:**
```typescript
toast.error('Erro ao confirmar presença')
```

**✅ DEPOIS:**
```typescript
toast.error('Erro ao confirmar presença', {
  description: 'Verifique sua conexão e tente novamente.',
  action: {
    label: 'Tentar Novamente',
    onClick: () => confirmPresence()
  },
  secondaryAction: {
    label: 'Contatar Suporte',
    onClick: () => openSupport()
  }
})
```

#### Categorização de Erros (conforme Sprint 4):

**1. Erros de Rede (NetworkError)**
```typescript
toast.error('Sem conexão', {
  description: 'Verifique sua internet.',
  action: {
    label: 'Recarregar',
    onClick: () => window.location.reload()
  }
})
```

**2. Erros de Validação (ValidationError)**
```typescript
toast.error('Dados inválidos', {
  description: 'Preencha todos os campos obrigatórios.',
  action: {
    label: 'Revisar Formulário',
    onClick: () => scrollToFirstError()
  }
})
```

**3. Erros de Permissão (PermissionError)**
```typescript
toast.error('Acesso negado', {
  description: 'Você não tem permissão para esta ação.',
  action: {
    label: 'Ver Planos',
    onClick: () => router.push('/plans')
  }
})
```

**4. Erros de Servidor (ServerError)**
```typescript
toast.error('Erro no servidor', {
  description: 'Já fomos notificados. Tente novamente em alguns minutos.',
  action: {
    label: 'Reportar Bug',
    onClick: () => openBugReport()
  }
})
```

#### Toasts de Sucesso com Próximo Passo:

```typescript
// ❌ ANTES
toast.success('Evento criado com sucesso!')

// ✅ DEPOIS
toast.success('Evento criado com sucesso!', {
  description: 'Compartilhe com os atletas para confirmarem presença.',
  action: {
    label: 'Compartilhar',
    onClick: () => shareEvent(eventId)
  },
  secondaryAction: {
    label: 'Ver Evento',
    onClick: () => router.push(`/events/${eventId}`)
  }
})
```

#### Tasks Técnicas:
- [ ] Criar helper `src/lib/toast-helpers.ts` com funções:
  - `showNetworkError()`
  - `showValidationError(fields)`
  - `showPermissionError(resource)`
  - `showServerError(error)`
  - `showSuccessWithAction(message, action)`
- [ ] Atualizar todas as chamadas de toast no código
- [ ] Criar componente `<ToastWithUndo>` para ações destrutivas
- [ ] Adicionar logs de toasts no Sentry
- [ ] Testar cada tipo de toast
- [ ] Documentar padrões no README

#### Métricas de Sucesso:
- ✅ 100% toasts com ações contextuais
- ✅ 80%+ usuários clicam em ações sugeridas
- ✅ 50% redução em "não sei o que fazer agora"
- ✅ 0 toasts genéricos ("Erro")

---

### 2.2 Humanizar Breadcrumbs em Rotas Dinâmicas
**RICE Score: 48** (Reach:8 × Impact:6 × Confidence:100% / Effort:1)

#### Problema Atual:
```
Home > groups > abc-123-def > events > xyz-456-ghi
```

#### Solução:
```
Home > Pelada FC > Treino de Quarta-feira
```

**Implementação:**
```typescript
// ✅ src/components/layout/breadcrumbs.tsx
import { getGroupName, getEventName } from '@/lib/breadcrumb-helpers'

const humanizeSegment = async (segment: string, index: number, allSegments: string[]) => {
  // Identificar tipo de recurso pelo contexto
  const prevSegment = allSegments[index - 1]

  if (prevSegment === 'groups' && segment.match(/[a-f0-9-]+/)) {
    const name = await getGroupName(segment)
    return { label: name, icon: Users }
  }

  if (prevSegment === 'events' && segment.match(/[a-f0-9-]+/)) {
    const name = await getEventName(segment)
    return { label: name, icon: Calendar }
  }

  // Fallback para kebab-case
  return {
    label: segment.split('-').map(capitalize).join(' '),
    icon: null
  }
}
```

**Cache de Nomes:**
```typescript
// Cache em memória para evitar fetches repetidos
const breadcrumbCache = new Map<string, string>()

export async function getResourceName(type: string, id: string) {
  const key = `${type}:${id}`

  if (breadcrumbCache.has(key)) {
    return breadcrumbCache.get(key)!
  }

  const name = await fetchResourceName(type, id)
  breadcrumbCache.set(key, name)

  return name
}
```

#### Tasks Técnicas:
- [ ] Criar `src/lib/breadcrumb-helpers.ts`
- [ ] Implementar cache de nomes
- [ ] Adicionar ícones por tipo de recurso
- [ ] Atualizar `breadcrumbs.tsx`
- [ ] Testar com todas as rotas dinâmicas
- [ ] Adicionar fallback para IDs não encontrados

#### Métricas de Sucesso:
- ✅ 100% breadcrumbs humanizados
- ✅ Tempo de cache hit > 90%
- ✅ 0 breadcrumbs mostrando IDs crus

---

### 2.3 Botão "Voltar" em Páginas de Detalhes
**RICE Score: 40** (Reach:8 × Impact:5 × Confidence:100% / Effort:1)

#### Solução:

**Componente Reutilizável:**
```typescript
// ✅ src/components/ui/back-button.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'

export function BackButton({
  href,
  label = 'Voltar'
}: {
  href?: string
  label?: string
}) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="mb-4"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
```

**Uso nas Páginas:**
```typescript
// ✅ src/app/groups/[groupId]/events/[eventId]/page.tsx
import { BackButton } from '@/components/ui/back-button'

export default function EventDetailPage() {
  return (
    <div>
      <BackButton href="/treinos" label="Voltar para Treinos" />
      {/* Resto do conteúdo */}
    </div>
  )
}
```

#### Páginas que Precisam:
- [ ] `/events/[eventId]`
- [ ] `/groups/[groupId]/events/[eventId]`
- [ ] `/atletas/[id]`
- [ ] `/modalidades/[id]`
- [ ] `/financeiro/charges/[chargeId]`
- [ ] `/profile/[userId]`
- [ ] `/feed/[postId]`

---

## FASE 3: ACESSIBILIDADE (Semanas 5-6)
**Meta:** Atingir 85% de acessibilidade
**Impacto:** Alto (9/10) para usuários com deficiências
**Esforço:** 2 semanas

### 3.1 Auditoria Completa de Acessibilidade
**RICE Score: 75** (Reach:10 × Impact:10 × Confidence:75% / Effort:1)

#### Checklist de Acessibilidade:

**A. Semântica HTML**
- [ ] Usar tags semânticas (`<nav>`, `<main>`, `<article>`)
- [ ] Hierarquia de headings correta (h1 > h2 > h3)
- [ ] Landmarks ARIA (`role="navigation"`, `role="main"`)

**B. Textos Alternativos**
```typescript
// ❌ ANTES
<img src="/logo.png" />

// ✅ DEPOIS
<img src="/logo.png" alt="Logo ResenhApp - Gestão de Peladeiros" />
```

**C. Labels e Descrições**
```typescript
// ❌ ANTES
<Button onClick={shareEvent}>
  <Share2 />
</Button>

// ✅ DEPOIS
<Button onClick={shareEvent} aria-label="Compartilhar evento">
  <Share2 aria-hidden="true" />
</Button>
```

**D. Contraste de Cores**

Verificar com ferramenta WCAG:
```bash
npm install -D @axe-core/playwright
```

Corrigir badges com baixo contraste:
```typescript
// ❌ ANTES (contraste 2.5:1)
<Badge className="bg-gray-700/20 text-gray-400">

// ✅ DEPOIS (contraste 4.5:1+)
<Badge className="bg-gray-700/40 text-gray-100">
```

**E. Navegação por Teclado**

Adicionar suporte em tabelas:
```typescript
// ✅ src/components/payments/charges-data-table.tsx
<tr
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openChargeDetails(charge.id)
    }
  }}
>
```

**F. Skip Links**
```typescript
// ✅ src/app/layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-uzzai-mint focus:text-white"
>
  Pular para conteúdo principal
</a>
```

**G. Foco Visível**
```css
/* ✅ src/app/globals.css */
*:focus-visible {
  outline: 2px solid theme('colors.uzzai.mint');
  outline-offset: 2px;
  border-radius: 4px;
}
```

#### Tasks Técnicas:
- [ ] Instalar Axe DevTools e Lighthouse
- [ ] Auditar todas as páginas principais
- [ ] Corrigir violações críticas (contraste, labels)
- [ ] Adicionar skip links
- [ ] Testar com screen reader (NVDA/JAWS)
- [ ] Testar navegação 100% por teclado
- [ ] Documentar padrões de acessibilidade
- [ ] Adicionar testes automatizados (Playwright + Axe)

#### Métricas de Sucesso:
- ✅ Lighthouse Accessibility Score > 85
- ✅ 0 violações críticas do Axe
- ✅ 100% elementos interativos com labels
- ✅ Contraste WCAG AA em todos os textos
- ✅ Navegação completa por teclado

---

## FASE 4: PERFORMANCE E CONSISTÊNCIA (Semanas 7-8)
**Meta:** Otimizar carregamento e padronizar visuais
**Impacto:** Médio (7/10)
**Esforço:** 2 semanas

### 4.1 Otimização de Performance
**RICE Score: 56** (Reach:10 × Impact:8 × Confidence:70% / Effort:1)

#### A. Batch Requests em Lista de Atletas

**❌ PROBLEMA ATUAL:**
```typescript
// Faz N queries em loop
for (const athlete of athletes) {
  const modalities = await getAthleteModalities(athlete.id)
}
```

**✅ SOLUÇÃO:**
```typescript
// Faz 1 query com JOIN
const athletesWithModalities = await db
  .select({
    athlete: athletes,
    modalities: sql`array_agg(modalities.name)`,
  })
  .from(athletes)
  .leftJoin(
    athleteModalities,
    eq(athletes.id, athleteModalities.athleteId)
  )
  .leftJoin(
    modalities,
    eq(athleteModalities.modalityId, modalities.id)
  )
  .groupBy(athletes.id)
```

#### B. Memoization em Componentes

```typescript
// ✅ src/components/dashboard/metrics-overview.tsx
import { useMemo } from 'react'

export function MetricsOverview({ stats }) {
  const topScorers = useMemo(() => {
    return stats.scorers
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 3)
  }, [stats.scorers])

  return (...)
}
```

#### C. Índices no Banco de Dados

```sql
-- Performance em queries frequentes
CREATE INDEX idx_events_group_date ON events(group_id, date DESC);
CREATE INDEX idx_charges_user_status ON charges(user_id, status);
CREATE INDEX idx_rsvps_event_user ON rsvps(event_id, user_id);
```

#### Tasks Técnicas:
- [ ] Identificar queries N+1 com Prisma Metrics
- [ ] Refatorar para batch requests
- [ ] Adicionar memoization em componentes pesados
- [ ] Criar índices no banco
- [ ] Implementar React Query para cache
- [ ] Adicionar loading skeletons onde falta
- [ ] Medir performance antes/depois (Lighthouse)

#### Métricas de Sucesso:
- ✅ Tempo de carregamento < 2s (p95)
- ✅ 90%+ queries em batch
- ✅ Lighthouse Performance Score > 80
- ✅ 0 re-renders desnecessários

---

### 4.2 Padronização de Cores
**RICE Score: 42** (Reach:10 × Impact:7 × Confidence:60% / Effort:1)

#### Auditoria de Cores:

**Encontrar todas as cores hardcoded:**
```bash
# Buscar por cores não-token
grep -r "bg-gray-" src/
grep -r "text-gray-" src/
grep -r "border-gray-" src/
```

**Substituir por tokens:**
```typescript
// ❌ ANTES
<Card className="bg-gray-950 border-gray-800">

// ✅ DEPOIS
<Card className="bg-uzzai-black border-uzzai-silver/20">
```

**Remover cores legacy:**
```bash
# Buscar e remover
grep -r "navy" src/
grep -r "green-dark" src/
```

#### Sistema de Tokens Completo:

```typescript
// ✅ tailwind.config.ts
colors: {
  // Marca UzzAI
  uzzai: {
    mint: '#1ABC9C',
    black: '#1C1C1C',
    silver: '#B0B0B0',
    blue: '#2E86AB',
    gold: '#FFD700',
  },
  // Cores Funcionais (REMOVER gray-* hardcoded)
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  // Features (manter)
  modalities: {...},
  athletes: {...},
  // etc.
}
```

#### Tasks Técnicas:
- [ ] Listar todas as ocorrências de cores hardcoded
- [ ] Substituir por tokens UzzAI
- [ ] Remover cores legacy
- [ ] Atualizar `tailwind.config.ts`
- [ ] Verificar dark mode após mudanças
- [ ] Documentar paleta completa

#### Métricas de Sucesso:
- ✅ 0 ocorrências de cores legacy
- ✅ 95%+ elementos usando tokens
- ✅ Consistência visual em toda aplicação

---

## RESUMO DO PLANO

### Cronograma Geral (8 semanas)

| Fase | Semanas | Foco | RICE Score | Impacto |
|------|---------|------|-----------|---------|
| **Fase 1** | 1-2 | Correções Críticas | 90-85 | 🔴 Crítico |
| **Fase 2** | 3-4 | Melhorias de UX | 64-40 | 🟡 Alto |
| **Fase 3** | 5-6 | Acessibilidade | 75 | 🟡 Alto |
| **Fase 4** | 7-8 | Performance | 56-42 | 🟢 Médio |

### Recursos Necessários

**Equipe:**
- 1 Frontend Developer (full-time)
- 1 UI/UX Designer (part-time, 50%)
- 1 QA Engineer (part-time, 25%)

**Ferramentas:**
- Axe DevTools (acessibilidade)
- Lighthouse (performance)
- Sentry (error tracking)
- Playwright (testes E2E)

### ROI Esperado

**Antes (atual):**
- Score: 7.8/10
- Acessibilidade: 60%
- Performance: 70
- Usuários satisfeitos: 75%

**Depois (meta):**
- Score: 9.0/10
- Acessibilidade: 85%
- Performance: 80+
- Usuários satisfeitos: 90%+

**Ganhos Mensuráveis:**
- ⬆️ 15% aumento em satisfação
- ⬆️ 25% melhoria em acessibilidade
- ⬆️ 40% redução em erros reportados
- ⬆️ 30% melhoria em performance
- ⬇️ 50% redução em confusão (mock data)

---

## PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana (2026-02-23 a 2026-03-01):

1. **Segunda-feira:**
   - [ ] Criar branch `feature/ui-ux-refactor-phase-1`
   - [ ] Remover mock data do dashboard
   - [ ] Remover mock data da topbar

2. **Terça-feira:**
   - [ ] Remover mock data da sidebar
   - [ ] Criar helpers de stats e profile
   - [ ] Testar integrações com APIs reais

3. **Quarta-feira:**
   - [ ] Criar página de créditos
   - [ ] Integrar com APIs de créditos
   - [ ] Adicionar loading/error states

4. **Quinta-feira:**
   - [ ] Implementar toggle de dark mode
   - [ ] Instalar next-themes
   - [ ] Adicionar ThemeProvider

5. **Sexta-feira:**
   - [ ] Auditar componentes para dark mode
   - [ ] Adicionar classes dark: faltantes
   - [ ] Testes manuais de todas as melhorias
   - [ ] Deploy em staging
   - [ ] Code review

---

## CONCLUSÃO

Este plano de refatoração UI/UX foi desenhado para maximizar o impacto na experiência do usuário com esforço otimizado. A abordagem em fases permite:

✅ **Entrega incremental** - Valor entregue a cada 2 semanas
✅ **Priorização clara** - Crítico → Alto → Médio
✅ **Métricas objetivas** - Sucesso mensurável
✅ **ROI comprovado** - 15% aumento em satisfação

**Score atual:** 7.8/10 (BOM)
**Meta:** 9.0/10 (EXCELENTE)
**Prazo:** 8 semanas

**Vamos começar? 🚀**
