# ResenhApp V2.0 — Catálogo de Componentes UI

## Visão Geral

Este catálogo documenta todos os componentes de interface da aplicação ResenhApp V2.0, organizados em dois grupos: primitivos de UI baseados em shadcn/ui e componentes customizados por módulo de negócio.

---

## shadcn/ui Components (32 componentes em `src/components/ui/`)

Todos os primitivos abaixo são baseados na biblioteca [shadcn/ui](https://ui.shadcn.com/), construídos sobre Radix UI e estilizados com Tailwind CSS. São componentes sem estado próprio que aceitam props e delegam comportamento ao caller.

### Primitivos Base

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `button` | `button.tsx` | Botão com variantes: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Tamanhos: `default`, `sm`, `lg`, `icon`. |
| `input` | `input.tsx` | Campo de texto base com suporte a todos os atributos HTML input. |
| `label` | `label.tsx` | Label acessível para campos de formulário, integrado com Radix UI. |
| `badge` | `badge.tsx` | Badge/tag com variantes: `default`, `secondary`, `destructive`, `outline`. |
| `card` | `card.tsx` | Container card com sub-componentes: `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`. |
| `avatar` | `avatar.tsx` | Avatar circular com imagem e fallback de iniciais. Sub-componentes: `AvatarImage`, `AvatarFallback`. |
| `checkbox` | `checkbox.tsx` | Checkbox acessível com estado controlado/não controlado. |
| `radio-group` | `radio-group.tsx` | Grupo de radio buttons acessíveis. Sub-componentes: `RadioGroupItem`. |
| `select` | `select.tsx` | Select dropdown acessível. Sub-componentes: `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`. |
| `textarea` | `textarea.tsx` | Área de texto multi-linha com suporte a resize. |

### Overlays e Navegação

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `dialog` | `dialog.tsx` | Modal acessível com overlay. Sub-componentes: `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`. |
| `sheet` | `sheet.tsx` | Painel lateral deslizante (drawer). Posições: `top`, `right`, `bottom`, `left`. |
| `popover` | `popover.tsx` | Popover flutuante posicionado. Sub-componentes: `PopoverTrigger`, `PopoverContent`. |
| `command` | `command.tsx` | Componente de busca/comando estilo Spotlight. Usado internamente por outros seletores. |
| `dropdown-menu` | `dropdown-menu.tsx` | Menu dropdown com suporte a sub-menus, separadores e checkboxes. |
| `tooltip` | `tooltip.tsx` | Tooltip acessível com delay. Sub-componentes: `TooltipProvider`, `TooltipTrigger`, `TooltipContent`. |

### Dados e Layout

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `table` | `table.tsx` | Tabela acessível. Sub-componentes: `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`. |
| `tabs` | `tabs.tsx` | Abas acessíveis. Sub-componentes: `TabsList`, `TabsTrigger`, `TabsContent`. |
| `progress` | `progress.tsx` | Barra de progresso animada. Props: `value` (0-100). |
| `slider` | `slider.tsx` | Slider de valor numérico arrastável. |
| `collapsible` | `collapsible.tsx` | Container colapsável. Sub-componentes: `CollapsibleTrigger`, `CollapsibleContent`. |
| `scroll-area` | `scroll-area.tsx` | Área de scroll customizada com scrollbar estilizada. |
| `separator` | `separator.tsx` | Separador visual horizontal ou vertical. |

### Feedback e Estado

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `alert` | `alert.tsx` | Bloco de alerta informativo. Variantes: `default`, `destructive`. Sub-componentes: `AlertTitle`, `AlertDescription`. |
| `alert-dialog` | `alert-dialog.tsx` | Dialog de confirmação destrutiva. Sub-componentes: `AlertDialogAction`, `AlertDialogCancel`. |
| `toast` | `toast.tsx` | Notificação temporária toast. |
| `toaster` | `toaster.tsx` | Container global de toasts; deve ser colocado no layout raiz. |
| `skeleton` | `skeleton.tsx` | Placeholder animado de carregamento (loading state). |

### Componentes Customizados em `src/components/ui/`

Os componentes abaixo foram criados especificamente para o ResenhApp, mas seguem o padrão de primitivos do shadcn/ui:

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `form-field` | `form-field.tsx` | Wrapper de campo de formulário que combina `Label`, `Input`/`Select`/etc e mensagem de erro. Integrado com react-hook-form. |
| `button-with-loading` | `button-with-loading.tsx` | Extensão do `Button` com estado de loading: exibe spinner e desabilita o botão durante operações assíncronas. Props: `isLoading: boolean`, `loadingText?: string`. |
| `empty-state` | `empty-state.tsx` | Estado vazio padronizado para listas e tabelas. Props: `title: string`, `description: string`, `icon?: ReactNode`, `action?: ReactNode`. |
| `metric-card` | `metric-card.tsx` | Card de métrica numérica para dashboards. Props: `title: string`, `value: string | number`, `change?: number`, `changeLabel?: string`, `icon?: ReactNode`. |
| `status-badge` | `status-badge.tsx` | Badge especializado para status de entidades (eventos, cobranças). Mapeia strings de status para cores e labels em português. |
| `design-system-showcase` | `design-system-showcase.tsx` | Componente de documentação visual do design system. Exibe todos os tokens de cor, tipografia e componentes. Usado apenas em desenvolvimento. |

---

## Componentes Customizados por Módulo

### Módulo: Athletes (`src/components/athletes/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `athletes-table` | Client | `athletes: Athlete[]`, `onRatingEdit`, `onModalityAdd`, `onModalityRemove`, `isAdmin` | Tabela principal de atletas do grupo com filtros inline, avatares, badges de modalidade e ações de edição |
| `add-modality-modal` | Client | `athleteId`, `availableModalities`, `isOpen`, `onClose`, `onSuccess` | Modal para adicionar nova modalidade a um atleta com rating e posições |
| `athlete-filters` | Client | `modalities`, `onFilterChange: (filters) => void` | Barra de filtros: busca por nome, modalidade, rating mínimo, posição |
| `edit-rating-modal` | Client | `athleteId`, `modalityId`, `currentRating`, `currentPositions`, `availablePositions`, `isOpen`, `onClose`, `onSuccess` | Modal de edição de rating (slider 1-10) e posições de um atleta em uma modalidade |
| `modality-badge` | Client | `name`, `color?`, `showRating?`, `rating?` | Badge visual de modalidade com cor configurável e rating opcional |

---

### Módulo: Credits (`src/components/credits/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `buy-credits-modal` | Client | `groupId`, `packages: CreditPackage[]`, `onPurchaseSuccess: (balance) => void`, `isOpen`, `onClose` | Modal de compra de créditos com seleção de pacote, campo de cupom e resumo do pedido com desconto |
| `credits-balance` | Client | `balance: number`, `onBuyClick: () => void` | Exibição do saldo atual de créditos com indicador de saldo baixo e botão de compra |
| `credits-page-client` | Client | `groupId`, `initialBalance`, `initialHistory: CreditTransaction[]`, `packages` | Componente principal da página de créditos: combina saldo, histórico e compra |

---

### Módulo: Dashboard (`src/components/dashboard/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `dashboard-wrapper` | Client | `user`, `groups`, `upcomingEvents`, `pendingPayments` | Container principal que decide entre DirectMode e modo normal baseado no perfil do usuário |
| `direct-mode-dashboard` | Client | `user`, `group`, `upcomingEvents`, `pendingPayments` | Layout simplificado para jogadores de único grupo (sem sidebar) |
| `hero-section` | Client | `userName`, `groupName`, `memberCount`, `isAdmin` | Seção de boas-vindas com saudação, nome do grupo e papel do usuário |
| `metrics-overview` | Client | `metrics: GroupMetrics` | Grid de cards com métricas do grupo (TODO: dados mockados no Sprint 2) |
| `modalities-grid` | Client/Server | `modalities: Modality[]`, `groupId` | Grid de cards das modalidades do grupo com contagem de atletas |
| `groups-card` | Client | `groups: GroupWithMemberCount[]`, `activeGroupId`, `onSwitch` | Card de grupos com seletor de grupo ativo e links de ação |
| `pending-payments-card` | Client | `charges: Charge[]`, `groupId` | Card de alertas de cobranças pendentes com acesso rápido ao PIX |
| `upcoming-events-card` | Client | `events: UpcomingEvent[]`, `groupId`, `currentUserId` | Card de próximos eventos com RSVP rápido |
| `upcoming-trainings` | Client | `trainings: UpcomingTraining[]` | Card de próximos treinos (TODO: dados mockados no Sprint 2) |

---

### Módulo: Events (`src/components/events/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `event-form` | Client | `mode: 'create' \| 'edit'`, `groupId`, `eventId?`, `defaultValues?` | Formulário unificado de criação e edição de evento com suporte a recorrência e cobrança automática |
| `event-tabs` | Client | `eventId`, `event: Event`, `currentUserId` | Container de abas da página do evento (Confirmação, Times, Ao Vivo, Avaliações, Estatísticas) |
| `confirmation-tab` | Client | `eventId`, `attendance: Attendance[]`, `maxParticipants`, `currentUserId` | Tab de RSVP com lista de confirmados, fila de espera e botão de confirmar/cancelar |
| `live-match-tab` | Client | `eventId`, `teams: Team[]`, `actions: EventAction[]` | Painel de partida ao vivo com placar, controles e timeline de ações |
| `teams-tab` | Client | `eventId`, `teams: Team[]`, `drawConfig: DrawConfig`, `isAdmin` | Exibição de times sorteados com opções de sorteio e reorganização manual |
| `ratings-tab` | Client | `eventId`, `participants: User[]`, `currentUserId`, `hasVoted` | Tab de votação de MVP pós-evento |
| `stats-tab` | Client | `eventId`, `playerStats: PlayerStat[]` | Estatísticas individuais do evento por jogador |
| `draw-config-modal` | Client | `groupId`, `eventId`, `currentConfig: DrawConfig`, `isOpen`, `onClose` | Modal de configuração do algoritmo de sorteio de times |
| `team-draw-button` | Client | `eventId`, `onDrawComplete: () => void`, `isDisabled` | Botão de execução do sorteio automático de times com loading state |
| `admin-player-manager` | Client | `eventId`, `teams: Team[]`, `availablePlayers: User[]` | Gerenciador de jogadores avulsos nos times (não-RSVPados) |
| `manual-team-manager` | Client | `eventId`, `teams: Team[]`, `onSave` | Interface de drag-and-drop para reorganização manual dos times |
| `match-scoreboard` | Client | `teams: Team[]` | Placar visual dos times com nome, cor e pontuação |
| `match-controls` | Client | `eventId`, `eventStatus`, `onActionRegister`, `isAdmin` | Botões de controle da partida: iniciar, pausar, encerrar e registrar ação |
| `match-timeline` | Client | `actions: EventAction[]`, `teams: Team[]` | Linha do tempo cronológica de ações da partida |
| `mvp-tiebreaker-card` | Client | `tiebreaker: MvpTiebreaker`, `currentUserId`, `onVote` | Card de votação de desempate de MVP com candidatos e contagem de votos |

---

### Módulo: Financial (`src/components/financial/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `pix-payment-card` | Client | `chargeId`, `amount`, `receiverName`, `pixKey`, `brCode`, `expiresAt?` | Card com QR Code e código PIX Copia e Cola, com polling de status de pagamento |
| `charges-data-table` | Client | `charges: Charge[]`, `onMarkPaid`, `onCancel`, `onViewPix`, `isAdmin` | Tabela de cobranças com filtros de status/tipo, ordenação e ações inline |
| `create-charge-modal` | Client | `groupId`, `members: GroupMember[]`, `isOpen`, `onClose`, `onSuccess` | Modal de criação manual de cobranças individuais ou em lote |
| `payments-content` | Client | `groupId`, `initialCharges`, `wallet: Wallet`, `receiverProfiles` | Componente principal da página financeiro com resumo de saldo e tabela de cobranças |

---

### Módulo: Group/Groups (`src/components/group/` e `src/components/groups/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `create-group-form` | Client | `parentGroups: Group[]`, `onSuccess` | Formulário de criação de grupo com tipo, privacidade e grupo pai |
| `group-info-form` | Client | `group: Group`, `onSave` | Formulário de edição das informações básicas do grupo |
| `group-settings-tabs` | Client | `groupId`, `group: Group`, `members`, `invites`, `eventSettings`, `venues` | Container de abas de configurações do grupo |
| `event-settings-form` | Client | `groupId`, `eventSettings`, `venues: Venue[]` | Formulário de configurações padrão de eventos do grupo |
| `members-manager` | Client | `groupId`, `members: GroupMember[]`, `currentUserId` | Tabela de membros com ações de promover, rebaixar e remover |
| `invites-manager` | Client | `groupId`, `invites: Invite[]` | Gerenciamento de códigos e links de convite com cópia e revogação |
| `join-group-form` | Client | `onSuccess: (groupId) => void` | Formulário de entrada em grupo via código de convite |

---

### Módulo: Layout (`src/components/layout/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `sidebar` | Client | `groupId: string`, `pendingPayments: number` | Navegação lateral principal com itens de menu por módulo. Badge de cobranças pendentes no item Financeiro. Recolhível em mobile. |
| `topbar` | Client | `user: User`, `groups: Group[]`, `activeGroupId` | Barra superior com logo, seletor de grupo, notificações e menu do usuário |
| `mobile-nav` | Client | `groupId`, `pendingPayments` | Navegação inferior mobile (bottom bar) |
| `page-header` | Server | `title: string`, `description?: string`, `action?: ReactNode` | Cabeçalho de página padronizado com título, descrição e slot para ação |
| `breadcrumbs` | Client | `items: { label, href }[]` | Breadcrumb de navegação para páginas aninhadas |

---

### Módulo: Modalities (`src/components/modalities/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `modality-card` | Client | `modality: Modality`, `athleteCount`, `onEdit`, `onDelete`, `isAdmin` | Card de modalidade com ícone, nome, cor e contagem de atletas |
| `modality-form` | Client | `mode: 'create' \| 'edit'`, `modality?`, `groupId`, `onSuccess`, `onCancel` | Formulário de criação/edição de modalidade com posições configuráveis |
| `modality-icon` | Server | `icon: string`, `size?`, `color?` | Ícone SVG correspondente à modalidade esportiva |
| `modality-modal` | Client | `mode`, `modality?`, `groupId`, `isOpen`, `onClose`, `onSuccess` | Wrapper modal para o formulário de modalidade |
| `positions-config` | Client | `positions: string[]`, `onChange`, `suggestions: string[]` | Configurador de posições com tags, input e drag-and-drop |

---

### Módulo: Notifications (`src/components/notifications/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `notifications-dropdown` | Client | (sem props — usa hook internamente) | Dropdown de notificações na topbar com badge de não lidas, polling de 30s e ações de marcar como lida/deletar |

---

### Módulo: Payments (`src/components/payments/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `payment-form` | Client | `chargeId`, `amount`, `receiverProfile`, `onSuccess` | Formulário de confirmação de pagamento manual |
| `payment-history-table` | Client | `payments: Payment[]` | Tabela de histórico de pagamentos de uma cobrança |

---

### Módulo: Trainings (`src/components/trainings/`)

| Componente | Tipo | Props Principais | Propósito |
|------------|------|-----------------|-----------|
| `training-card` | Client | `training: RecurringTraining`, `upcomingSessions`, `avgParticipation`, `onEdit`, `onCancel`, `isAdmin` | Card de treino recorrente com próximas sessões, taxa de participação e ações |
| `confirmed-avatars` | Client | `confirmedUsers: User[]`, `maxDisplay?`, `total` | Cluster de avatares sobrepostos dos participantes confirmados com contador |
| `rsvp-progress` | Client | `confirmed`, `maxParticipants`, `waitlist` | Barra de progresso de vagas confirmadas com indicador de fila de espera |

---

## Sidebar: Detalhes de Implementação

**Arquivo:** `src/components/layout/sidebar.tsx`

**Tipo:** Client Component

**Props:**
```typescript
interface SidebarProps {
  groupId: string
  pendingPayments: number
}
```

**Itens de navegação e regras:**

```typescript
const navigationItems = [
  { label: 'Dashboard',    href: '/dashboard',                   icon: Home,       adminOnly: false },
  { label: 'Atletas',      href: '/(dashboard)/atletas',         icon: Users,      adminOnly: false },
  { label: 'Eventos',      href: '/(dashboard)/eventos',         icon: Calendar,   adminOnly: false },
  { label: 'Treinos',      href: '/(dashboard)/treinos',         icon: Dumbbell,   adminOnly: false },
  { label: 'Modalidades',  href: '/(dashboard)/modalidades',     icon: Medal,      adminOnly: false },
  { label: 'Financeiro',   href: '/(dashboard)/financeiro',      icon: DollarSign, adminOnly: false, badge: pendingPayments },
  { label: 'Rankings',     href: '/(dashboard)/rankings',        icon: Trophy,     adminOnly: false },
  { label: 'Frequência',   href: '/(dashboard)/frequencia',      icon: BarChart,   adminOnly: false },
  { label: 'Configurações',href: `/groups/${groupId}/settings`,  icon: Settings,   adminOnly: true  },
]
```

**Comportamento:**
- Itens com `adminOnly: true` são renderizados condicionalmente baseado no contexto do `GroupContext`
- O badge do Financeiro exibe `pendingPayments` quando maior que 0
- A sidebar é recolhível em breakpoints mobile via estado interno
- O item ativo é identificado pelo `usePathname()` do Next.js

---

## `event-form`: Detalhes de Implementação

**Arquivo:** `src/components/events/event-form.tsx`

**Tipo:** Client Component

**Props:**
```typescript
interface EventFormProps {
  mode: 'create' | 'edit'
  groupId: string
  eventId?: string
  defaultValues?: Partial<EventFormData>
  onSuccess?: (event: Event) => void
}
```

**Campos do formulário:**

| Campo | Tipo | Validação |
|-------|------|-----------|
| `title` | text | Obrigatório, mín 3 chars |
| `event_type` | select | `training`, `official_game`, `friendly` |
| `scheduled_at` | datetime-local | Obrigatório, deve ser futuro |
| `venue_id` | select | Opcional |
| `max_participants` | number | Opcional, mín 2 |
| `description` | textarea | Opcional |
| `auto_charge` | toggle | Default: false |
| `auto_charge_amount` | number | Obrigatório se auto_charge = true |
| `is_recurring` | toggle | Default: false |
| `recurrence_pattern` | JSONB fields | Obrigatório se is_recurring = true |

**Comportamento de modo:**
- `mode: 'create'` → `POST /api/events`
- `mode: 'edit'` → `PATCH /api/events/[eventId]`

---

## `dashboard-wrapper`: Detalhes de Implementação

**Arquivo:** `src/components/dashboard/dashboard-wrapper.tsx`

**Tipo:** Client Component

**Props:**
```typescript
interface DashboardWrapperProps {
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'player'
  }
  groups: GroupWithMemberCount[]
  upcomingEvents: UpcomingEvent[]
  pendingPayments: Charge[]
}
```

**Lógica de decisão de layout:**
```typescript
const isDirectMode = user.role === 'player' && groups.length === 1

return isDirectMode
  ? <DirectModeDashboard user={user} group={groups[0]} events={upcomingEvents} payments={pendingPayments} />
  : <NormalDashboard user={user} groups={groups} events={upcomingEvents} payments={pendingPayments} />
```

---

## `buy-credits-modal`: Detalhes de Implementação

**Arquivo:** `src/components/credits/buy-credits-modal.tsx`

**Tipo:** Client Component

**Props:**
```typescript
interface BuyCreditsModalProps {
  groupId: string
  packages: CreditPackage[]
  onPurchaseSuccess: (newBalance: number) => void
  isOpen: boolean
  onClose: () => void
}
```

**Estados internos:**
- `selectedPackage: CreditPackage | null`
- `couponCode: string`
- `couponValidation: CouponValidation | null`
- `isValidatingCoupon: boolean`
- `isPurchasing: boolean`

**Fluxo interno:**
1. Usuário seleciona pacote → `selectedPackage` é atualizado
2. Usuário digita cupom e clica "Validar" → `POST /api/credits/validate-coupon`
3. Se válido: `couponValidation` é atualizado com desconto
4. Usuário clica "Comprar" → `POST /api/credits { packageId, couponCode }`
5. Em sucesso: chama `onPurchaseSuccess(newBalance)` e fecha modal

---

## `athletes-table`: Detalhes de Implementação

**Arquivo:** `src/components/athletes/athletes-table.tsx`

**Tipo:** Client Component

**Props:**
```typescript
interface AthletesTableProps {
  athletes: Athlete[]
  onRatingEdit: (athleteId: string, modalityId: string) => void
  onModalityAdd: (athleteId: string) => void
  onModalityRemove: (athleteId: string, modalityId: string) => void
  isAdmin: boolean
}

interface Athlete {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl?: string
  role: 'admin' | 'player'
  modalities: {
    id: string
    name: string
    color: string
    rating: number
    positions: string[]
  }[]
}
```

**Funcionalidades internas:**
- Filtragem client-side por nome (debounced 300ms)
- Filtragem por modalidade, rating mínimo e posição
- Ordenação por nome, rating médio
- Ações condicionais baseadas em `isAdmin`

---

## Design System

### Paleta de Cores UzzAI

O design system da plataforma utiliza a identidade visual UzzAI como base.

| Token | Cor | Hex | Uso |
|-------|-----|-----|-----|
| `uzzai-mint` | Verde Menta UzzAI | `#00FF87` | Cor primária, CTAs, destaques |
| `uzzai-black` | Preto UzzAI | `#0A0A0A` | Backgrounds escuros, texto |
| `uzzai-silver` | Prata UzzAI | `#8B8B8B` | Textos secundários, bordas |
| `uzzai-blue` | Azul UzzAI | `#0088FF` | Links, informações, estados ativos |
| `uzzai-gold` | Dourado UzzAI | `#FFD700` | Medalhas, destaques premium, MVP |

### Cores por Feature/Módulo

| Feature | Cor | Hex |
|---------|-----|-----|
| Eventos | Azul | `#3B82F6` |
| Financeiro | Verde | `#22C55E` |
| Treinos | Laranja | `#F97316` |
| Rankings | Dourado | `#EAB308` |
| Frequência | Roxo | `#8B5CF6` |
| Conquistas | Rosa | `#EC4899` |

### Tipografia

| Font | Uso | Weights |
|------|-----|---------|
| **Poppins** | Títulos principais, headings | 600, 700, 800 |
| **Inter** | Corpo de texto, parágrafos, UI geral | 400, 500, 600 |
| **Exo 2** | Labels de dados, métricas numéricas | 400, 600 |
| **Fira Code** | Códigos PIX, tokens, dados técnicos | 400 |

### Design Tokens (`design-system.ts`)

**Localização:** `src/lib/design-system.ts` ou `src/styles/design-system.ts`

O arquivo de design tokens exporta objetos de configuração usados como referência no `tailwind.config.ts`:

```typescript
export const colors = {
  brand: {
    mint:   '#00FF87',
    black:  '#0A0A0A',
    silver: '#8B8B8B',
    blue:   '#0088FF',
    gold:   '#FFD700',
  },
  status: {
    success: '#22C55E',
    warning: '#EAB308',
    error:   '#EF4444',
    info:    '#3B82F6',
  },
  feature: {
    events:       '#3B82F6',
    financial:    '#22C55E',
    trainings:    '#F97316',
    rankings:     '#EAB308',
    attendance:   '#8B5CF6',
    achievements: '#EC4899',
  },
}

export const typography = {
  fonts: {
    heading: 'Poppins, sans-serif',
    body:    'Inter, sans-serif',
    data:    'Exo 2, sans-serif',
    code:    'Fira Code, monospace',
  },
}

export const spacing = {
  // Tailwind spacing scale usada como base
  // Sem customizações além do padrão
}
```

### Configuração Tailwind

Os tokens do design system são adicionados à configuração do Tailwind:

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'uzzai-mint':   '#00FF87',
        'uzzai-black':  '#0A0A0A',
        'uzzai-silver': '#8B8B8B',
        'uzzai-blue':   '#0088FF',
        'uzzai-gold':   '#FFD700',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        data:    ['Exo 2', 'sans-serif'],
        code:    ['Fira Code', 'monospace'],
      },
    },
  },
}
```

---

## Padrões de Componentização

### Server vs Client Components

| Cenário | Tipo recomendado |
|---------|-----------------|
| Leitura de dados sem interatividade | Server Component |
| Formulários com estado | Client Component |
| Polling / WebSocket | Client Component |
| Listas com filtros client-side | Client Component |
| Cards estáticos de informação | Server Component |
| Modais e dropdowns | Client Component |
| Tabelas com sorting/filtering | Client Component |

### Convenções de Nomenclatura

- Componentes: PascalCase (ex: `AthleteFilters`)
- Arquivos: kebab-case (ex: `athlete-filters.tsx`)
- Props interfaces: `ComponentNameProps` (ex: `AthletesTableProps`)
- Hooks: `use-` prefix (ex: `use-notifications.ts`)
- Utilitários: camelCase (ex: `formatCurrency`, `validateEmail`)

### Estrutura de Arquivo de Componente

```typescript
// 1. Imports externos
import { useState } from 'react'

// 2. Imports internos (componentes UI)
import { Button } from '@/components/ui/button'

// 3. Imports de tipos
import type { SomeType } from '@/types'

// 4. Interface de props
interface ComponentNameProps {
  required: string
  optional?: number
}

// 5. Componente (const arrow function)
const ComponentName = ({ required, optional = 0 }: ComponentNameProps) => {
  // 6. Hooks
  const [state, setState] = useState(false)

  // 7. Handlers (funções puras quando possível)
  const handleClick = () => setState(true)

  // 8. Render
  return <div>{required}</div>
}

// 9. Export
export { ComponentName }
```

---

## Notas Gerais de Implementação

- Todos os componentes Client têm `'use client'` no topo do arquivo
- Componentes sem estado ou sem interatividade são Server Components por padrão (sem diretiva)
- O `GroupContext` é consumido via `useGroupContext()` em qualquer Client Component que precise do grupo ativo
- O sistema de toasts usa o `useToast()` hook do shadcn/ui — o `Toaster` está no layout raiz
- Formulários usam `react-hook-form` com resolvers Zod para validação tipada
- Loading states são gerenciados com o primitivo `button-with-loading` ou `skeleton` para carregamento de dados
- Todos os modais são construídos sobre o primitivo `dialog` do shadcn/ui
- A acessibilidade segue as diretrizes WCAG 2.1 AA via atributos Radix UI automáticos
