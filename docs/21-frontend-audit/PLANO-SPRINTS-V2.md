# 🏃‍♂️ Plano de Sprints - Arquitetura V2
## Roadmap Completo de Implementação

> **Metodologia:** Scrum/Agile
> **Duração Total:** 8 sprints (16 semanas / 4 meses)
> **Sprint Duration:** 2 semanas cada
> **Data de Início:** A definir
> **Team Size:** 2-3 desenvolvedores frontend

---

## 📊 VISÃO GERAL DO PROJETO

### Objetivo
Transformar o frontend do Peladeiros de **55% para 95%** de qualidade visual e funcional, mostrando TODAS as features disponíveis.

### Métricas de Sucesso
| Métrica | Atual | Meta | Progresso |
|---------|-------|------|-----------|
| Qualidade Visual | 5.5/10 | 9.5/10 | 0% |
| Features Visíveis | 42% | 95% | 0% |
| Páginas Completas | 5/12 | 12/12 | 0% |
| Componentes Reutilizáveis | 12 | 35+ | 0% |
| Performance Score | 70 | 90+ | 0% |

### Sprints Overview

```
Sprint 1-2: Fundação (Layout + Design System)
   ├─ Sprint 1: DashboardLayout + Topbar + Sidebar
   └─ Sprint 2: Design System + Componentes Base

Sprint 3-4: Dashboard Principal
   ├─ Sprint 3: Hero + Métricas + Grid Modalidades
   └─ Sprint 4: Lista Treinos + Quick Actions

Sprint 5-6: Páginas Críticas
   ├─ Sprint 5: Página Treinos completa
   └─ Sprint 6: Página Financeiro completa

Sprint 7-8: Features Adicionais + Polimento
   ├─ Sprint 7: Frequência + Rankings + Jogos
   └─ Sprint 8: Polimento + Performance + Testes
```

---

## 🎯 SPRINT 1: Fundação - Layout Unificado

**Duração:** 2 semanas
**Objetivo:** Criar base sólida com layout unificado em todas as páginas
**Story Points:** 21

### User Stories

#### US-1.1: DashboardLayout Unificado
**Como** usuário
**Quero** ter uma navegação consistente em todas as páginas
**Para** navegar facilmente pelo aplicativo

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Criar `src/app/(dashboard)/layout.tsx`
- [ ] Estrutura flex com Sidebar + Main Content
- [ ] Implementar responsividade (mobile collapse)
- [ ] Adicionar transições de página
- [ ] Integrar com rotas existentes
- [ ] Testar em todos os breakpoints

**Critérios de Aceite:**
- ✅ Layout aparece em todas as páginas do dashboard
- ✅ Sidebar colapsa em mobile (< 768px)
- ✅ Transições suaves entre páginas
- ✅ Sem quebra de layout em nenhuma resolução
- ✅ Código TypeScript sem erros

**Arquivos Criados:**
- `src/app/(dashboard)/layout.tsx`

---

#### US-1.2: Topbar Completo
**Como** usuário
**Quero** ter acesso rápido à busca, notificações e meu perfil
**Para** encontrar informações rapidamente

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Criar `src/components/layout/topbar.tsx`
- [ ] Implementar logo + título dinâmico
- [ ] Adicionar SearchBar (placeholder)
- [ ] Criar NotificationsDropdown (mock)
- [ ] Criar UserProfileDropdown
- [ ] Implementar CreditsDisplay compact
- [ ] Adicionar QuickActionsDropdown
- [ ] Integrar com DashboardLayout
- [ ] Testar responsividade

**Critérios de Aceite:**
- ✅ Topbar fixo no topo (sticky)
- ✅ Título muda baseado na rota
- ✅ Dropdown de notificações abre/fecha
- ✅ Dropdown de perfil com logout funciona
- ✅ CreditsDisplay mostra saldo atual
- ✅ Mobile: menu hamburguer funcional

**Arquivos Criados:**
- `src/components/layout/topbar.tsx`
- `src/components/layout/user-profile-dropdown.tsx`
- `src/components/layout/quick-actions-dropdown.tsx`

---

#### US-1.3: Sidebar Melhorada
**Como** usuário
**Quero** ver claramente todas as seções disponíveis
**Para** navegar entre as funcionalidades

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Melhorar `src/components/layout/sidebar.tsx` existente
- [ ] Adicionar badges de notificação
- [ ] Implementar seções colapsáveis
- [ ] Adicionar ícones coloridos
- [ ] Highlight da rota ativa
- [ ] Suporte a hierarquia (atlética/pelada)
- [ ] Adicionar footer com créditos
- [ ] Testar navegação

**Critérios de Aceite:**
- ✅ Rota ativa destacada visualmente
- ✅ Ícones consistentes (Lucide)
- ✅ Seções colapsam/expandem
- ✅ Badge de notificações aparece quando > 0
- ✅ Footer mostra créditos do grupo

**Arquivos Modificados:**
- `src/components/layout/sidebar.tsx`

---

### Entregáveis do Sprint 1
- ✅ Layout unificado funcionando
- ✅ Topbar completo com todos os dropdowns
- ✅ Sidebar melhorada e funcional
- ✅ Navegação consistente em todas as páginas
- ✅ Responsividade mobile completa

### Retrospectiva Sprint 1
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações para próximo sprint:**

---

## 🎨 SPRINT 2: Design System + Componentes Base

**Duração:** 2 semanas
**Objetivo:** Expandir Design System e criar componentes base reutilizáveis
**Story Points:** 21

### User Stories

#### US-2.1: Design System V2
**Como** desenvolvedor
**Quero** ter um Design System completo e documentado
**Para** manter consistência visual

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Criar `src/styles/design-tokens.ts`
- [ ] Definir paleta de cores por feature
- [ ] Definir tipografia (hero, h1-h6, metric, badge)
- [ ] Definir espaçamentos consistentes
- [ ] Definir border-radius, shadows, transitions
- [ ] Atualizar `tailwind.config.ts` com tokens
- [ ] Documentar uso (Storybook ou README)

**Critérios de Aceite:**
- ✅ Tokens exportados e tipados (TypeScript)
- ✅ Cores por feature definidas (6 features)
- ✅ Tailwind config estendido com tokens
- ✅ Documentação de uso criada

**Arquivos Criados:**
- `src/styles/design-tokens.ts`

**Arquivos Modificados:**
- `tailwind.config.ts`

---

#### US-2.2: MetricCard V2 Enhanced
**Como** usuário
**Quero** ver métricas importantes de forma visual e atraente
**Para** entender rapidamente o estado do grupo

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Melhorar `src/components/ui/metric-card.tsx`
- [ ] Adicionar gradiente de fundo
- [ ] Adicionar ícone colorido
- [ ] Adicionar trend indicator (↑↓)
- [ ] Adicionar sparkline (gráfico inline)
- [ ] Adicionar hover effects
- [ ] Suporte a subtitle
- [ ] Criar variants (compact, full)

**Critérios de Aceite:**
- ✅ Gradiente aplicado baseado em prop
- ✅ Trend mostra ↑ verde ou ↓ vermelho
- ✅ Sparkline renderiza corretamente
- ✅ Hover effect suave
- ✅ Responsivo em mobile

**Arquivos Modificados:**
- `src/components/ui/metric-card.tsx`

---

#### US-2.3: Loading Skeletons
**Como** usuário
**Quero** ver estados de loading profissionais
**Para** saber que o sistema está processando

**Story Points:** 3

**Tarefas Técnicas:**
- [ ] Criar `src/components/ui/loading-skeleton.tsx`
- [ ] Implementar CardSkeleton
- [ ] Implementar TableSkeleton
- [ ] Implementar ListSkeleton
- [ ] Adicionar animação shimmer
- [ ] Criar variants por tipo de conteúdo

**Critérios de Aceite:**
- ✅ Animação shimmer suave
- ✅ Skeletons match o tamanho real dos componentes
- ✅ Reutilizável em diferentes contextos

**Arquivos Criados:**
- `src/components/ui/loading-skeleton.tsx`

---

#### US-2.4: Empty States
**Como** usuário
**Quero** ver mensagens claras quando não há dados
**Para** saber o que fazer a seguir

**Story Points:** 3

**Tarefas Técnicas:**
- [ ] Criar `src/components/ui/empty-state.tsx`
- [ ] Implementar com ícone grande
- [ ] Adicionar título e descrição
- [ ] Adicionar botão de ação (opcional)
- [ ] Criar variants (sem dados, erro, busca vazia)
- [ ] Adicionar ilustrações (opcional)

**Critérios de Aceite:**
- ✅ Ícone grande e visível
- ✅ Mensagem clara e helpful
- ✅ Botão de ação funcional
- ✅ Centralizado verticalmente

**Arquivos Criados:**
- `src/components/ui/empty-state.tsx`

---

#### US-2.5: Breadcrumbs
**Como** usuário
**Quero** saber onde estou na hierarquia de páginas
**Para** navegar facilmente entre níveis

**Story Points:** 3

**Tarefas Técnicas:**
- [ ] Criar `src/components/layout/breadcrumbs.tsx`
- [ ] Integrar com Next.js router
- [ ] Gerar breadcrumbs automaticamente baseado na rota
- [ ] Adicionar ícones de home
- [ ] Adicionar separadores
- [ ] Implementar navegação ao clicar

**Critérios de Aceite:**
- ✅ Breadcrumbs aparecem em todas as páginas
- ✅ Gera automaticamente baseado na URL
- ✅ Links funcionam corretamente
- ✅ Última página não é link

**Arquivos Criados:**
- `src/components/layout/breadcrumbs.tsx`

---

#### US-2.6: Sparkline Component
**Como** desenvolvedor
**Quero** exibir gráficos inline nas métricas
**Para** mostrar tendências visualmente

**Story Points:** 2

**Tarefas Técnicas:**
- [ ] Criar `src/components/ui/sparkline.tsx`
- [ ] Renderizar polyline SVG
- [ ] Calcular pontos baseado em data array
- [ ] Adicionar gradiente colorido
- [ ] Tornar responsivo
- [ ] Adicionar prop para cor customizada

**Critérios de Aceite:**
- ✅ Renderiza corretamente com array de números
- ✅ Gradiente baseado na cor passada
- ✅ Responsivo (preserveAspectRatio)
- ✅ Suporta dados vazios

**Arquivos Criados:**
- `src/components/ui/sparkline.tsx`

---

### Entregáveis do Sprint 2
- ✅ Design System V2 documentado
- ✅ MetricCard enhanced
- ✅ Loading Skeletons
- ✅ Empty States
- ✅ Breadcrumbs
- ✅ Sparkline component
- ✅ Biblioteca de componentes base completa

### Retrospectiva Sprint 2
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações para próximo sprint:**

---

## 🏠 SPRINT 3: Dashboard Principal - Parte 1

**Duração:** 2 semanas
**Objetivo:** Criar Hero Section, Métricas e Grid de Modalidades
**Story Points:** 21

### User Stories

#### US-3.1: Hero Section
**Como** usuário
**Quero** ser recebido com uma mensagem personalizada
**Para** me sentir engajado com o aplicativo

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Criar `src/components/dashboard/hero-section.tsx`
- [ ] Implementar gradiente de fundo
- [ ] Adicionar saudação baseada em horário
- [ ] Adicionar frase motivacional aleatória
- [ ] Adicionar mini stats (próximo treino, créditos)
- [ ] Adicionar background pattern
- [ ] Tornar responsivo

**Critérios de Aceite:**
- ✅ Saudação muda (manhã/tarde/noite)
- ✅ Nome do usuário aparece
- ✅ Frase motivacional aleatória
- ✅ Mini stats corretos
- ✅ Gradiente bonito e suave

**Arquivos Criados:**
- `src/components/dashboard/hero-section.tsx`
- `src/lib/motivational-quotes.ts`

---

#### US-3.2: Dashboard Metrics Overview
**Como** usuário
**Quero** ver 4 métricas principais do grupo
**Para** entender o estado atual rapidamente

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Criar `src/components/dashboard/metrics-overview.tsx`
- [ ] Criar hook `useDashboardMetrics()`
- [ ] Buscar dados da API
- [ ] Implementar 4 MetricCards:
  - [ ] Atletas Ativos (com trend)
  - [ ] Treinos Esta Semana (com sparkline)
  - [ ] Frequência Média (com trend)
  - [ ] Caixa do Mês (com subtitle pendente)
- [ ] Adicionar loading states
- [ ] Adicionar error handling
- [ ] Tornar responsivo (grid 1/2/4 cols)

**Critérios de Aceite:**
- ✅ 4 cards exibidos corretamente
- ✅ Dados carregam da API
- ✅ Trends calculados corretamente
- ✅ Sparklines renderizam
- ✅ Loading skeleton enquanto carrega
- ✅ Responsivo em mobile (1 coluna)

**Arquivos Criados:**
- `src/components/dashboard/metrics-overview.tsx`
- `src/hooks/use-dashboard-metrics.ts`

**APIs Necessárias:**
- `GET /api/groups/[groupId]/dashboard-metrics`

---

#### US-3.3: Grid de Modalidades Ativas
**Como** usuário
**Quero** ver todas as modalidades ativas em destaque
**Para** acessar rapidamente cada modalidade

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Criar `src/components/dashboard/modalities-grid.tsx`
- [ ] Melhorar `src/components/modalities/modality-card.tsx`
- [ ] Adicionar prop `enhanced` para modo dashboard
- [ ] Implementar gradientes nos cards
- [ ] Adicionar ícones grandes (48px)
- [ ] Adicionar 3 estatísticas (Atletas, Treinos/Sem, Freq%)
- [ ] Adicionar hover actions (Ver detalhes, Ver treinos)
- [ ] Adicionar loading state
- [ ] Tornar responsivo (grid 1/2/3 cols)

**Critérios de Aceite:**
- ✅ Cards visuais e atraentes
- ✅ Gradientes aplicados por modalidade
- ✅ Estatísticas corretas
- ✅ Hover effects suaves
- ✅ Links funcionam
- ✅ Responsivo em mobile

**Arquivos Criados:**
- `src/components/dashboard/modalities-grid.tsx`

**Arquivos Modificados:**
- `src/components/modalities/modality-card.tsx`

---

### Entregáveis do Sprint 3
- ✅ Hero Section com saudação personalizada
- ✅ 4 Métricas principais funcionando
- ✅ Grid de modalidades visual e funcional
- ✅ Dashboard começando a ficar rico

### Retrospectiva Sprint 3
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações para próximo sprint:**

---

## 📅 SPRINT 4: Dashboard Principal - Parte 2

**Duração:** 2 semanas
**Objetivo:** Lista de Treinos, Quick Actions e finalizar Dashboard
**Story Points:** 21

### User Stories

#### US-4.1: Upcoming Trainings Component
**Como** usuário
**Quero** ver os próximos treinos com RSVP expandido
**Para** confirmar minha presença rapidamente

**Story Points:** 13

**Tarefas Técnicas:**
- [ ] Criar `src/components/dashboard/upcoming-trainings.tsx`
- [ ] Criar `src/components/trainings/training-card.tsx`
- [ ] Implementar date badge destacado
- [ ] Adicionar badge de modalidade
- [ ] Adicionar badge de status (CONFIRMADO/PENDENTE)
- [ ] Adicionar badge RECORRENTE
- [ ] Criar `src/components/trainings/rsvp-progress.tsx`
- [ ] Criar `src/components/trainings/confirmed-avatars.tsx`
- [ ] Implementar botão de ação (Confirmar/Responder)
- [ ] Adicionar loading state
- [ ] Tornar responsivo

**Critérios de Aceite:**
- ✅ Data grande e destacada
- ✅ Progress bar mostra % confirmação
- ✅ Avatares sobrepostos (max 5 + contador)
- ✅ Badges coloridos e claros
- ✅ Botão de ação funcional
- ✅ Responsivo em mobile

**Arquivos Criados:**
- `src/components/dashboard/upcoming-trainings.tsx`
- `src/components/trainings/training-card.tsx`
- `src/components/trainings/rsvp-progress.tsx`
- `src/components/trainings/confirmed-avatars.tsx`

**Hooks Criados:**
- `src/hooks/use-upcoming-trainings.ts`

---

#### US-4.2: Quick Actions
**Como** usuário
**Quero** ter acesso rápido às ações mais comuns
**Para** economizar tempo

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Criar `src/components/dashboard/quick-actions.tsx`
- [ ] Implementar botão flutuante "+ Novo Treino"
- [ ] Implementar botão "+ Convocar"
- [ ] Implementar botão "💰 Cobrar"
- [ ] Adicionar modals para cada ação
- [ ] Adicionar permissões (apenas admin)
- [ ] Tornar responsivo (collapse em mobile)

**Critérios de Aceite:**
- ✅ Botões visíveis e destacados
- ✅ Modals abrem corretamente
- ✅ Permissões verificadas
- ✅ Responsivo em mobile

**Arquivos Criados:**
- `src/components/dashboard/quick-actions.tsx`

---

#### US-4.3: Dashboard Page Integration
**Como** usuário
**Quero** ver todas as seções integradas no dashboard
**Para** ter uma visão completa do grupo

**Story Points:** 3

**Tarefas Técnicas:**
- [ ] Atualizar `src/app/(dashboard)/dashboard/page.tsx`
- [ ] Integrar HeroSection
- [ ] Integrar MetricsOverview
- [ ] Integrar ModalitiesGrid
- [ ] Integrar UpcomingTrainings
- [ ] Adicionar seção de Pagamentos Pendentes
- [ ] Adicionar seção de Rankings Top 3
- [ ] Adicionar QuickActions
- [ ] Implementar loading da página completa
- [ ] Adicionar error handling

**Critérios de Aceite:**
- ✅ Todas as seções aparecem
- ✅ Loading states consistentes
- ✅ Dados carregam corretamente
- ✅ Responsivo em todos os breakpoints
- ✅ Performance < 2s para carregar

**Arquivos Modificados:**
- `src/app/(dashboard)/dashboard/page.tsx`

---

### Entregáveis do Sprint 4
- ✅ Lista de treinos expandida com RSVP
- ✅ Quick Actions funcionais
- ✅ Dashboard Principal 100% completo
- ✅ Experiência visual profissional

### Retrospectiva Sprint 4
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações para próximo sprint:**

### Demo Sprint 4
- [ ] Apresentar Dashboard completo
- [ ] Demonstrar navegação
- [ ] Demonstrar responsividade
- [ ] Coletar feedback

---

## 💪 SPRINT 5: Página de Treinos Completa

**Duração:** 2 semanas
**Objetivo:** Criar página `/treinos` com gestão completa de RSVP
**Story Points:** 21

### User Stories

#### US-5.1: Trainings Page Structure
**Como** usuário
**Quero** ver todos os treinos organizados
**Para** gerenciar minhas confirmações

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Criar `src/app/(dashboard)/treinos/page.tsx`
- [ ] Criar PageHeader com título e ações
- [ ] Adicionar botão "Novo Treino" (admin only)
- [ ] Adicionar 4 métricas de treinos:
  - [ ] Treinos Hoje
  - [ ] Esta Semana
  - [ ] Pendentes RSVP
  - [ ] Taxa de Confirmação
- [ ] Implementar loading state
- [ ] Implementar error handling

**Critérios de Aceite:**
- ✅ Page header profissional
- ✅ 4 métricas carregam corretamente
- ✅ Botão "Novo Treino" apenas para admin
- ✅ Loading skeleton enquanto carrega

**Arquivos Criados:**
- `src/app/(dashboard)/treinos/page.tsx`
- `src/components/layout/page-header.tsx`

**Hooks Criados:**
- `src/hooks/use-trainings.ts`

---

#### US-5.2: Training Filters
**Como** usuário
**Quero** filtrar treinos por modalidade e status
**Para** encontrar treinos específicos

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Criar `src/components/trainings/training-filters.tsx`
- [ ] Adicionar filtro por modalidade (select)
- [ ] Adicionar filtro por status (Todos, Confirmados, Pendentes)
- [ ] Adicionar filtro por período (Hoje, Semana, Mês, Todos)
- [ ] Implementar lógica de filtragem
- [ ] Adicionar reset filters
- [ ] Tornar responsivo

**Critérios de Aceite:**
- ✅ Filtros funcionam corretamente
- ✅ Combinação de filtros funciona
- ✅ Reset limpa todos os filtros
- ✅ Responsivo em mobile

**Arquivos Criados:**
- `src/components/trainings/training-filters.tsx`

---

#### US-5.3: Trainings List with RSVP
**Como** usuário
**Quero** ver lista de treinos com detalhes completos
**Para** confirmar ou gerenciar minha presença

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Implementar lista de treinos
- [ ] Usar TrainingCard (já criado) em modo expanded
- [ ] Adicionar paginação ou infinite scroll
- [ ] Implementar RSVP inline
- [ ] Adicionar confirmação de presença
- [ ] Adicionar cancelamento de presença
- [ ] Adicionar loading states por card
- [ ] Implementar empty state
- [ ] Tornar responsivo

**Critérios de Aceite:**
- ✅ Lista carrega corretamente
- ✅ RSVP funciona inline
- ✅ Confirmação/cancelamento funcionam
- ✅ Loading state por ação
- ✅ Empty state quando sem treinos
- ✅ Paginação/scroll funciona

**Arquivos Modificados:**
- `src/app/(dashboard)/treinos/page.tsx`

**APIs Necessárias:**
- `GET /api/events?groupId=...&filters=...`
- `POST /api/events/[eventId]/rsvp`

---

### Entregáveis do Sprint 5
- ✅ Página `/treinos` completa
- ✅ Filtros funcionais
- ✅ RSVP inline funcional
- ✅ Métricas de treinos

### Retrospectiva Sprint 5
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações para próximo sprint:**

---

## 💰 SPRINT 6: Página Financeiro Completa

**Duração:** 2 semanas
**Objetivo:** Melhorar página `/financeiro` com pagamentos por treino
**Story Points:** 21

### User Stories

#### US-6.1: Financial Dashboard Metrics
**Como** admin
**Quero** ver métricas financeiras do grupo
**Para** entender a saúde financeira

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Criar `src/app/(dashboard)/financeiro/page.tsx`
- [ ] Adicionar 4 métricas financeiras:
  - [ ] Total Arrecadado (com trend)
  - [ ] Pendente
  - [ ] Despesas
  - [ ] Saldo (com trend)
- [ ] Implementar loading states
- [ ] Adicionar error handling

**Critérios de Aceite:**
- ✅ 4 métricas carregam corretamente
- ✅ Trends calculados
- ✅ Cores corretas (verde/vermelho)
- ✅ Valores formatados (moeda)

**Arquivos Criados:**
- `src/app/(dashboard)/financeiro/page.tsx`

**Hooks Criados:**
- `src/hooks/use-financial.ts`

**APIs Necessárias:**
- `GET /api/groups/[groupId]/financial-metrics`

---

#### US-6.2: Training Payments Section
**Como** admin
**Quero** ver pagamentos organizados por treino
**Para** cobrar quem está devendo

**Story Points:** 13

**Tarefas Técnicas:**
- [ ] Criar `src/components/financial/training-payment-card.tsx`
- [ ] Exibir total esperado vs recebido
- [ ] Adicionar progress bar de pagamentos
- [ ] Criar `src/components/financial/pending-payers-list.tsx`
- [ ] Exibir badges com status (100% PAGO)
- [ ] Adicionar botão "Cobrar" individual
- [ ] Implementar modal de cobrança
- [ ] Adicionar loading states
- [ ] Tornar responsivo

**Critérios de Aceite:**
- ✅ Cards de treinos listados
- ✅ Valores corretos
- ✅ Progress bar preciso
- ✅ Lista de pendentes correta
- ✅ Botão "Cobrar" funciona
- ✅ Badge "100% PAGO" quando completo

**Arquivos Criados:**
- `src/components/financial/training-payment-card.tsx`
- `src/components/financial/pending-payers-list.tsx`
- `src/components/financial/charge-modal.tsx`

---

#### US-6.3: Financial Tabs (Charges & Transactions)
**Como** admin
**Quero** ver todas cobranças e histórico de transações
**Para** ter controle total

**Story Points:** 3

**Tarefas Técnicas:**
- [ ] Implementar Tabs (Treinos, Cobranças, Histórico)
- [ ] Criar `src/components/financial/charges-table.tsx`
- [ ] Criar `src/components/financial/transaction-history.tsx`
- [ ] Adicionar filtros (período, status, tipo)
- [ ] Adicionar paginação
- [ ] Tornar responsivo

**Critérios de Aceite:**
- ✅ Tabs funcionam
- ✅ Tabelas carregam corretamente
- ✅ Filtros funcionam
- ✅ Paginação funciona
- ✅ Responsivo em mobile

**Arquivos Criados:**
- `src/components/financial/charges-table.tsx`
- `src/components/financial/transaction-history.tsx`

---

### Entregáveis do Sprint 6
- ✅ Página `/financeiro` completa
- ✅ Pagamentos por treino funcionais
- ✅ Histórico de transações
- ✅ Sistema de cobranças

### Retrospectiva Sprint 6
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações para próximo sprint:**

### Demo Sprint 6
- [ ] Apresentar dashboard financeiro
- [ ] Demonstrar cobrança por treino
- [ ] Demonstrar histórico
- [ ] Coletar feedback

---

## 🎯 SPRINT 7: Features Adicionais

**Duração:** 2 semanas
**Objetivo:** Criar páginas Frequência, Rankings e Jogos
**Story Points:** 21

### User Stories

#### US-7.1: Attendance Page (Frequência)
**Como** admin
**Quero** controlar frequência dos atletas
**Para** saber quem é assíduo

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Criar `src/app/(dashboard)/frequencia/page.tsx`
- [ ] Adicionar 4 métricas de frequência
- [ ] Criar `src/components/attendance/qrcode-checkin.tsx`
- [ ] Criar `src/components/attendance/frequency-ranking.tsx`
- [ ] Criar `src/components/attendance/checkins-list.tsx`
- [ ] Implementar QR Code generation
- [ ] Implementar QR Code scanning
- [ ] Adicionar loading states

**Critérios de Aceite:**
- ✅ Métricas corretas
- ✅ QR Code gerado
- ✅ Check-in funciona
- ✅ Ranking Top 10 correto
- ✅ Lista de check-ins recentes

**Arquivos Criados:**
- `src/app/(dashboard)/frequencia/page.tsx`
- `src/components/attendance/qrcode-checkin.tsx`
- `src/components/attendance/frequency-ranking.tsx`
- `src/components/attendance/checkins-list.tsx`

**APIs Necessárias:**
- `POST /api/checkins/generate-qrcode`
- `POST /api/checkins/scan`
- `GET /api/groups/[groupId]/attendance-stats`

---

#### US-7.2: Rankings Page
**Como** usuário
**Quero** ver rankings de artilheiros e MVPs
**Para** competir e me motivar

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Criar `src/app/(dashboard)/rankings/page.tsx`
- [ ] Criar `src/components/rankings/top-ranking-card.tsx`
- [ ] Implementar 3 cards de Top 3:
  - [ ] Artilheiros (troféu ouro)
  - [ ] Assistências (troféu prata)
  - [ ] MVP (estrela)
- [ ] Criar `src/components/rankings/stats-table.tsx`
- [ ] Adicionar filtro por modalidade
- [ ] Adicionar loading states

**Critérios de Aceite:**
- ✅ Top 3 cards visuais
- ✅ Tabela completa funcional
- ✅ Filtro por modalidade
- ✅ Dados corretos

**Arquivos Criados:**
- `src/app/(dashboard)/rankings/page.tsx`
- `src/components/rankings/top-ranking-card.tsx`
- `src/components/rankings/stats-table.tsx`

**APIs Necessárias:**
- `GET /api/groups/[groupId]/rankings`

---

#### US-7.3: Games Page (Jogos Oficiais)
**Como** admin
**Quero** gerenciar jogos oficiais e convocações
**Para** organizar competições

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Criar `src/app/(dashboard)/jogos/page.tsx`
- [ ] Adicionar 4 métricas de jogos
- [ ] Criar `src/components/games/game-card.tsx`
- [ ] Criar `src/components/games/convocation-card.tsx`
- [ ] Implementar calendário de jogos
- [ ] Adicionar loading states

**Critérios de Aceite:**
- ✅ Métricas corretas
- ✅ Lista de jogos
- ✅ Convocações funcionais
- ✅ Calendário visual

**Arquivos Criados:**
- `src/app/(dashboard)/jogos/page.tsx`
- `src/components/games/game-card.tsx`
- `src/components/games/convocation-card.tsx`

---

### Entregáveis do Sprint 7
- ✅ Página `/frequencia` completa
- ✅ Página `/rankings` completa
- ✅ Página `/jogos` completa
- ✅ Todas as páginas principais criadas

### Retrospectiva Sprint 7
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações para próximo sprint:**

---

## ✨ SPRINT 8: Polimento e Performance

**Duração:** 2 semanas
**Objetivo:** Polir UX, otimizar performance e testes finais
**Story Points:** 21

### User Stories

#### US-8.1: Animations & Micro-interactions
**Como** usuário
**Quero** ter feedback visual em cada ação
**Para** saber que o sistema está respondendo

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Instalar Framer Motion
- [ ] Adicionar page transitions
- [ ] Adicionar card hover animations
- [ ] Adicionar button ripple effects
- [ ] Adicionar toast animations
- [ ] Adicionar modal animations
- [ ] Adicionar loading spinner animations
- [ ] Testar performance das animações

**Critérios de Aceite:**
- ✅ Transições suaves (< 300ms)
- ✅ Hover effects em todos os cards
- ✅ Modals abrem com fade+scale
- ✅ Toasts slide in/out
- ✅ Performance mantida (60fps)

**Dependências:**
- `framer-motion`

---

#### US-8.2: Search Bar Functional
**Como** usuário
**Quero** buscar atletas, treinos e modalidades
**Para** encontrar informações rapidamente

**Story Points:** 8

**Tarefas Técnicas:**
- [ ] Implementar `src/components/ui/search-bar.tsx` funcional
- [ ] Criar API de busca global
- [ ] Implementar debounce (300ms)
- [ ] Categorizar resultados (Atletas, Treinos, Modalidades)
- [ ] Adicionar keyboard navigation (↑↓ Enter)
- [ ] Adicionar highlight de termos
- [ ] Adicionar empty state
- [ ] Tornar responsivo

**Critérios de Aceite:**
- ✅ Busca funciona
- ✅ Resultados categorizados
- ✅ Keyboard navigation funciona
- ✅ Debounce implementado
- ✅ Performance < 300ms

**APIs Criadas:**
- `GET /api/search?q=...&groupId=...`

---

#### US-8.3: Notifications System
**Como** usuário
**Quero** receber notificações de eventos importantes
**Para** não perder nada

**Story Points:** 5

**Tarefas Técnicas:**
- [ ] Criar `src/contexts/notification-context.tsx`
- [ ] Implementar NotificationsDropdown funcional
- [ ] Criar tipos de notificações (treino, cobrança, convocação)
- [ ] Implementar mark as read
- [ ] Implementar mark all as read
- [ ] Adicionar badge contador
- [ ] Integrar com Topbar
- [ ] Adicionar loading states

**Critérios de Aceite:**
- ✅ Notificações carregam
- ✅ Badge mostra contador correto
- ✅ Mark as read funciona
- ✅ Tipos diferentes têm ícones diferentes

**Arquivos Criados:**
- `src/contexts/notification-context.tsx`

**Arquivos Modificados:**
- `src/components/notifications/notifications-dropdown.tsx`

---

#### US-8.4: Performance Optimization
**Como** desenvolvedor
**Quero** otimizar performance do aplicativo
**Para** ter carregamento < 2s

**Story Points:** 3

**Tarefas Técnicas:**
- [ ] Implementar React Query para cache
- [ ] Adicionar prefetching de rotas
- [ ] Implementar lazy loading de componentes
- [ ] Otimizar imagens (next/image)
- [ ] Implementar code splitting
- [ ] Adicionar service worker (PWA)
- [ ] Rodar Lighthouse audit
- [ ] Corrigir issues encontrados

**Critérios de Aceite:**
- ✅ Lighthouse Performance > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Cumulative Layout Shift < 0.1

**Dependências:**
- `@tanstack/react-query`

---

### Entregáveis do Sprint 8
- ✅ Animações e micro-interações
- ✅ Busca global funcional
- ✅ Sistema de notificações
- ✅ Performance otimizada
- ✅ **PROJETO COMPLETO E PRONTO**

### Retrospectiva Final
- **Conquistas do projeto:**
- **Desafios superados:**
- **Aprendizados:**
- **Próximos passos (manutenção):**

### Demo Final
- [ ] Apresentação completa do sistema
- [ ] Demonstração de todas as features
- [ ] Métricas de sucesso alcançadas
- [ ] Feedback final da equipe
- [ ] Celebração! 🎉

---

## 📊 MÉTRICAS DE ACOMPANHAMENTO

### Burndown Chart (por Sprint)

```
Sprint Points:
Sprint 1: 21 → Fundação Layout
Sprint 2: 21 → Design System
Sprint 3: 21 → Dashboard Parte 1
Sprint 4: 21 → Dashboard Parte 2
Sprint 5: 21 → Treinos
Sprint 6: 21 → Financeiro
Sprint 7: 21 → Frequência + Rankings + Jogos
Sprint 8: 21 → Polimento

Total Story Points: 168
```

### Velocity Tracking

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| Sprint 1 | 21 | - | - |
| Sprint 2 | 21 | - | - |
| Sprint 3 | 21 | - | - |
| Sprint 4 | 21 | - | - |
| Sprint 5 | 21 | - | - |
| Sprint 6 | 21 | - | - |
| Sprint 7 | 21 | - | - |
| Sprint 8 | 21 | - | - |

### Quality Metrics

| Métrica | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Sprint 6 | Sprint 7 | Sprint 8 |
|---------|----------|----------|----------|----------|----------|----------|----------|----------|
| Bugs Found | - | - | - | - | - | - | - | - |
| Bugs Fixed | - | - | - | - | - | - | - | - |
| Code Coverage | - | - | - | - | - | - | - | - |
| Performance Score | - | - | - | - | - | - | - | - |
| Accessibility Score | - | - | - | - | - | - | - | - |

---

## 🎯 DEFINITION OF DONE

### Para User Stories

Uma User Story está "Done" quando:
- ✅ Código desenvolvido e testado
- ✅ Code review aprovado
- ✅ Testes unitários criados (se aplicável)
- ✅ Documentação atualizada
- ✅ Responsividade testada (mobile, tablet, desktop)
- ✅ Acessibilidade básica verificada
- ✅ Performance verificada (sem regressão)
- ✅ Critérios de aceite atendidos
- ✅ Deploy em staging realizado
- ✅ PO/Stakeholder aprovou

### Para Sprints

Um Sprint está "Done" quando:
- ✅ Todas as User Stories planejadas estão Done
- ✅ Retrospectiva realizada
- ✅ Demo apresentada ao stakeholder
- ✅ Feedback coletado e documentado
- ✅ Bugs críticos corrigidos
- ✅ Métricas atualizadas
- ✅ Documentação do sprint criada

---

## 🚀 CERIMÔNIAS SCRUM

### Daily Standup (15min)
**Quando:** Diariamente, 9h
**Formato:**
1. O que fiz ontem?
2. O que vou fazer hoje?
3. Há algum impedimento?

### Sprint Planning (2h)
**Quando:** Primeiro dia do sprint
**Agenda:**
1. Revisar backlog
2. Selecionar User Stories
3. Estimar Story Points
4. Definir Sprint Goal
5. Quebrar em tarefas

### Sprint Review/Demo (1h)
**Quando:** Último dia do sprint
**Agenda:**
1. Demo das funcionalidades
2. Feedback dos stakeholders
3. Atualizar backlog

### Sprint Retrospective (1h)
**Quando:** Último dia do sprint (após review)
**Formato:**
1. O que funcionou bem?
2. O que pode melhorar?
3. Ações para próximo sprint

---

## 📝 BACKLOG MANAGEMENT

### Priorização (MoSCoW)

**Must Have (Sprint 1-4):**
- Layout unificado
- Dashboard principal
- Página de treinos

**Should Have (Sprint 5-6):**
- Página financeiro
- Sistema de cobranças

**Could Have (Sprint 7):**
- Frequência
- Rankings
- Jogos

**Won't Have (Future):**
- App mobile nativo
- Notificações push
- Modo offline

---

## 🎉 CONCLUSÃO

### Roadmap Resumido

```
📅 16 semanas (4 meses)

Mês 1 (Sprint 1-2): Fundação + Design System
Mês 2 (Sprint 3-4): Dashboard Principal
Mês 3 (Sprint 5-6): Treinos + Financeiro
Mês 4 (Sprint 7-8): Features Adicionais + Polimento

🎯 Resultado: Frontend V2 completo e profissional
```

### Próximos Passos

1. ✅ Validar plano com stakeholders
2. ✅ Montar equipe (2-3 devs)
3. ✅ Definir data de início
4. ✅ Configurar ferramentas (Jira, GitHub Projects, etc)
5. ✅ Iniciar Sprint 1

---

**Plano de Sprints V2 - Peladeiros Platform**
**"Do planejamento à execução: transformando o frontend"**

📅 Criado em: 2026-01-24
🎯 Status: Pronto para execução
🚀 Próxima ação: Sprint Planning do Sprint 1
