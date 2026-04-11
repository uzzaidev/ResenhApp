# ResenhApp UI/UX Map (Atual)

Data: 2026-02-23
Escopo: o que o usuario ve na interface + arquivos que sustentam cada tela

## 1) Layout Base (o que aparece em quase tudo)

- Shell global:
  - `src/app/layout.tsx`
  - depende de: `src/components/providers/auth-provider.tsx`, `src/components/error-boundary.tsx`, `src/components/ui/toaster.tsx`
- Shell do dashboard (areas autenticadas):
  - `src/app/(dashboard)/layout.tsx`
  - depende de: `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/breadcrumbs.tsx`
  - contexto: `src/contexts/direct-mode-context.tsx`
- Topbar:
  - `src/components/layout/topbar.tsx`
  - depende de: `src/components/layout/group-switcher.tsx`, `src/components/layout/direct-mode-toggle.tsx`, `src/components/notifications/notifications-dropdown.tsx`, `src/components/ui/search-command.tsx`
- Sidebar (menu principal visivel):
  - `src/components/layout/sidebar.tsx`
  - rotas visiveis: `/dashboard`, `/modalidades`, `/atletas`, `/treinos`, `/jogos`, `/financeiro`, `/frequencia`, `/rankings`, `/settings`, `/tabelinha`
  - observacao: badge `PENDENTE` vem de `GET /api/credits/me`

## 2) Rotas Visiveis Principais (o que voce ve)

### 2.1 Publico/Auth

- Landing: `/`
  - pagina: `src/app/page.tsx`
- Sign in: `/auth/signin`
  - pagina: `src/app/auth/signin/page.tsx`
- Sign up: `/auth/signup`
  - pagina: `src/app/auth/signup/page.tsx`
  - API usada: `POST /api/auth/signup`

### 2.2 Dashboard e navegacao principal

- Dashboard: `/dashboard`
  - pagina: `src/app/(dashboard)/dashboard/page.tsx`
  - componentes: `src/components/dashboard/dashboard-wrapper.tsx`, `src/components/dashboard/hero-section.tsx`, `src/components/dashboard/metrics-overview.tsx`, `src/components/dashboard/groups-card.tsx`, `src/components/dashboard/upcoming-events-card.tsx`, `src/components/dashboard/pending-payments-card.tsx`, `src/components/dashboard/modalities-grid.tsx`, `src/components/dashboard/upcoming-trainings.tsx`

- Atletas: `/atletas` e `/atletas/[id]`
  - paginas: `src/app/(dashboard)/atletas/page.tsx`, `src/app/(dashboard)/atletas/[id]/page.tsx`
  - componentes relacionados: `src/components/athletes/athletes-table.tsx`, `src/components/athletes/athlete-filters.tsx`, `src/components/athletes/add-modality-modal.tsx`, `src/components/athletes/edit-rating-modal.tsx`

- Modalidades: `/modalidades` e `/modalidades/[id]`
  - paginas: `src/app/(dashboard)/modalidades/page.tsx`, `src/app/(dashboard)/modalidades/[id]/page.tsx`
  - componentes: `src/components/modalities/modality-card.tsx`, `src/components/modalities/modality-form.tsx`, `src/components/modalities/modality-modal.tsx`, `src/components/modalities/positions-config.tsx`

- Treinos: `/treinos`
  - pagina: `src/app/(dashboard)/treinos/page.tsx`
  - componentes: `src/components/trainings/training-card.tsx`, `src/components/trainings/rsvp-progress.tsx`, `src/components/trainings/confirmed-avatars.tsx`

- Jogos: `/jogos`
  - pagina: `src/app/(dashboard)/jogos/page.tsx`

- Financeiro: `/financeiro` e `/financeiro/charges/[chargeId]`
  - paginas: `src/app/(dashboard)/financeiro/page.tsx`, `src/app/(dashboard)/financeiro/charges/[chargeId]/page.tsx`
  - componentes: `src/components/payments/payments-content.tsx`, `src/components/payments/charges-data-table.tsx`, `src/components/payments/create-charge-modal.tsx`, `src/components/financial/pix-payment-card.tsx`

- Frequencia: `/frequencia`
  - pagina: `src/app/(dashboard)/frequencia/page.tsx`

- Rankings: `/rankings`
  - pagina: `src/app/(dashboard)/rankings/page.tsx`

### 2.3 Grupos (fluxo completo)

- Criar grupo: `/groups/new`
  - pagina: `src/app/groups/new/page.tsx`
  - componente: `src/components/groups/create-group-form.tsx`
- Entrar em grupo: `/groups/join`
  - pagina: `src/app/groups/join/page.tsx`
  - componente: `src/components/groups/join-group-form.tsx`
- Home do grupo: `/groups/[groupId]`
  - pagina: `src/app/groups/[groupId]/page.tsx`
  - componentes: `src/components/group/rankings-card.tsx`, `src/components/group/my-stats-card.tsx`, `src/components/group/recent-matches-card.tsx`, `src/components/group/upcoming-events-card.tsx`
- Eventos do grupo:
  - novo: `/groups/[groupId]/events/new` -> `src/app/groups/[groupId]/events/new/page.tsx`
  - detalhe: `/groups/[groupId]/events/[eventId]` -> `src/app/groups/[groupId]/events/[eventId]/page.tsx`
- Pagamentos do grupo: `/groups/[groupId]/payments`
  - `src/app/groups/[groupId]/payments/page.tsx`
- Configuracoes do grupo: `/groups/[groupId]/settings`
  - `src/app/groups/[groupId]/settings/page.tsx`
  - componente principal: `src/components/groups/group-settings-tabs.tsx`
- Creditos do grupo: `/groups/[groupId]/credits`
  - `src/app/groups/[groupId]/credits/page.tsx`
  - componente: `src/components/credits/credits-page-client.tsx`

### 2.4 Eventos / social / perfil / onboarding

- Evento (visao geral): `/events/[eventId]`
  - pagina: `src/app/events/[eventId]/page.tsx`
  - componentes: `src/components/events/event-rsvp-form.tsx`, `src/components/events/event-tabs.tsx`, `src/components/events/admin-player-manager.tsx`
- Feed social: `/feed`
  - pagina: `src/app/feed/page.tsx`
  - componente: `src/components/social/feed-client.tsx`
- Post social: `/feed/[postId]`
  - pagina: `src/app/feed/[postId]/page.tsx`
  - componente: `src/components/social/post-detail-client.tsx`
- Perfil: `/profile/[userId]`
  - pagina: `src/app/profile/[userId]/page.tsx`
- Onboarding:
  - `/onboarding` -> `src/app/onboarding/page.tsx`
  - `/onboarding/step/[step]` -> `src/app/onboarding/step/[step]/page.tsx`

- Comprar creditos: `/credits/buy`
  - pagina: `src/app/credits/buy/page.tsx`
  - componente: `src/components/credits/buy-credits-page-client.tsx`

## 3) Dependencias de estado (contexts/hooks que afetam UX)

- Grupo ativo:
  - `src/contexts/group-context.tsx`
  - impacto: GroupSwitcher, telas de grupo, filtros de dashboard
- Direct mode:
  - `src/contexts/direct-mode-context.tsx`
  - impacto: layout com/sem sidebar
- Notificacoes:
  - `src/hooks/use-notifications.ts`
  - impacto: dropdown de notificacoes na topbar

## 4) APIs que mais impactam o que o usuario ve

- Auth/sessao:
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/app/api/auth/signup/route.ts`
- Grupos:
  - `src/app/api/groups/route.ts`, `src/app/api/groups/switch/route.ts`, `src/app/api/groups/managed/route.ts`, `src/app/api/groups/join/route.ts`
- Eventos/RSVP/times/live/mvp:
  - `src/app/api/events/route.ts`
  - `src/app/api/events/[eventId]/rsvp/route.ts`
  - `src/app/api/events/[eventId]/draw/route.ts`
  - `src/app/api/events/[eventId]/actions/route.ts`
  - `src/app/api/events/[eventId]/ratings/*`
- Financeiro/PIX:
  - `src/app/api/groups/[groupId]/charges/route.ts`
  - `src/app/api/groups/[groupId]/charges/[chargeId]/route.ts`
  - `src/app/api/charges/[chargeId]/pix/route.ts`
  - `src/app/api/charges/[chargeId]/self-report/route.ts`
- Social:
  - `src/app/api/social/feed/route.ts`
  - `src/app/api/social/posts/route.ts`
  - `src/app/api/social/posts/[postId]/react/route.ts`
  - `src/app/api/social/posts/[postId]/comments/route.ts`
- Creditos:
  - `src/app/api/credits/me/route.ts`
  - `src/app/api/credits/me/history/route.ts`
  - `src/app/api/credits/buy/requests/route.ts`
- Notificacoes:
  - `src/app/api/notifications/route.ts`
  - `src/app/api/notifications/[id]/route.ts`

## 5) Mapa rapido do que depende de que (visao executiva)

- Qualquer tela autenticada depende de:
  - `src/lib/auth.ts` + `src/lib/auth-helpers.ts`
- Qualquer tela com dados de grupo depende de:
  - `src/contexts/group-context.tsx` + APIs de `/api/groups/*`
- UX de menu lateral/topbar depende de:
  - `src/components/layout/sidebar.tsx`
  - `src/components/layout/topbar.tsx`
- UX de financeiro depende de:
  - `src/components/payments/*`
  - `src/components/financial/pix-payment-card.tsx`
  - `/api/groups/[groupId]/charges/*`, `/api/charges/[chargeId]/*`
- UX de social depende de:
  - `src/components/social/*`
  - `/api/social/*`

## 6) Observacoes de consistencia

- Existem rotas no menu que podem nao ter pagina pronta (`/tabelinha`, `/settings`) e podem cair em 404.
- Ha coexistencia de rotas antigas de grupo (`/groups/...`) e dashboard novo (`/dashboard`, `/financeiro`, etc.).
- Algumas paginas ainda usam textos/mock parcial no dashboard (`metrics-overview`, `upcoming-trainings`).
