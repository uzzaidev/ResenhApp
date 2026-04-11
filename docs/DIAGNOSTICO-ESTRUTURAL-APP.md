# Diagnóstico Estrutural da Aplicação
## ResenhApp — Raio-X de Produto, Arquitetura e UX

> **Data:** 2026-03-11
> **Status:** ✅ Preenchido com dados reais do projeto
> **Propósito:** Pacote mínimo de diagnóstico para identificar problemas de produto, modelagem, navegação e técnica

---

## 1. Visão Real do Produto

### O app deveria ser
Uma plataforma de gestão de grupos esportivos amadores (especialmente peladas/futsal), onde organizadores criam grupos, gerenciam treinos e partidas, controlam presença e cobram mensalidades/taxas dos participantes.

### O app virou na prática
Um híbrido não resolvido entre:
- Plataforma de gestão operacional de grupos (treinos, jogos, frequência, financeiro)
- Rede social esportiva (feed de posts, curtidas, comentários, conquistas)
- Sistema de créditos e gamificação (achievements, badges, rankings, carteira)
- Sistema de onboarding com referrals

Cada camada foi adicionada sem substituir a anterior. O resultado é um app que tenta ser tudo ao mesmo tempo sem hierarquia clara de valor.

### Usuários principais
- **Organizador / Admin**: cria grupo, cria treinos/jogos, gerencia escalação, cobra pagamentos, publica resultados
- **Jogador / Membro**: confirma presença, vê jogos, paga cobranças, interage socialmente
- **Atlético Admin**: gerencia uma atlética (entidade-pai) com múltiplos grupos-filhos de modalidade

### Core do produto hoje

- [x] Gestão de treinos e partidas
- [x] Gestão de grupos esportivos
- [x] Financeiro (cobranças por evento, PIX)
- [ ] Rede social esportiva ← implementada mas não é o core percebido
- [ ] Sistema de créditos ← implementado mas não tem clareza de propósito para o usuário

### Partes que ficaram confusas ou "forçadas"
- **Feed social**: existe (`/feed`, `/api/social/`) mas não está integrado ao fluxo principal
- **Sistema de créditos**: moedas internas para criar grupos e eventos — confuso para o usuário, pois mistura monetização da plataforma com funcionalidade
- **Onboarding**: rota `/onboarding/` existe mas não está clara no fluxo de entrada real
- **Atlética vs Grupo vs Modalidade**: três conceitos que o usuário vê como "grupo" mas o sistema trata de formas diferentes

---

## 2. Mapa de Rotas Atual

### Árvore de rotas (Next.js App Router)

```txt
src/app/
├── layout.tsx                                  ← root layout
├── page.tsx                                    ← landing / home
├── loading.tsx
│
├── (dashboard)/                                ← ROUTE GROUP: autenticado + sidebar
│   ├── layout.tsx                              ← sidebar + topbar + breadcrumbs
│   ├── dashboard/
│   │   ├── page.tsx                            ← página principal pós-login
│   │   └── loading.tsx
│   ├── atletas/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── loading.tsx
│   ├── financeiro/
│   │   ├── page.tsx
│   │   ├── charges/[chargeId]/page.tsx
│   │   └── loading.tsx
│   ├── frequencia/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── jogos/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── modalidades/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── loading.tsx
│   ├── rankings/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── treinos/
│       ├── page.tsx
│       └── loading.tsx
│
├── auth/                                       ← AUTENTICAÇÃO (fora do dashboard)
│   ├── page.tsx
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   └── error/page.tsx
│
├── groups/                                     ← GRUPOS (fora do dashboard, sem sidebar)
│   ├── new/page.tsx
│   ├── join/page.tsx
│   └── [groupId]/
│       ├── page.tsx                            ← detalhe do grupo
│       ├── settings/page.tsx
│       ├── payments/page.tsx
│       ├── credits/page.tsx
│       └── events/
│           ├── new/page.tsx
│           └── [eventId]/page.tsx
│
├── events/
│   └── [eventId]/page.tsx                      ← evento público (sem auth?)
│
├── feed/
│   ├── page.tsx
│   └── [postId]/page.tsx
│
├── credits/
│   └── buy/page.tsx
│
├── onboarding/
│   ├── page.tsx
│   └── step/[step]/page.tsx
│
├── profile/
│   └── [userId]/page.tsx
│
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── auth/signup/route.ts
    ├── events/route.ts
    ├── events/[eventId]/ (rsvp, draw, teams, actions, ratings...)
    ├── groups/route.ts
    ├── groups/managed/route.ts
    ├── groups/switch/route.ts
    ├── groups/join/route.ts
    ├── groups/[groupId]/ (members, charges, invites, rankings, stats...)
    ├── modalities/route.ts
    ├── notifications/route.ts
    ├── social/ (feed, posts, comments, reactions, reports)
    ├── credits/ (check, history, buy, validate-coupon, me)
    ├── onboarding/route.ts
    ├── referrals/me/route.ts
    ├── users/ (search, me/pending-charges-count, [userId]/achievements)
    ├── search/route.ts
    ├── cron/ (calculate-metrics, cleanup-notifications, send-reminders)
    └── debug/route.ts
```

### Classificação por domínio

| Rota (UI) | Domínio | Auth? | Tem sidebar? | Observação |
|-----------|---------|-------|--------------|------------|
| / | landing | não | não | |
| /auth/signin | auth | não | não | |
| /auth/signup | auth | não | não | |
| /onboarding | onboarding | sim | não | fluxo separado |
| /dashboard | dashboard | sim | sim | pós-login |
| /atletas | atletas | sim | sim | dentro do (dashboard) |
| /treinos | treinos | sim | sim | dentro do (dashboard) |
| /jogos | jogos | sim | sim | dentro do (dashboard) |
| /frequencia | frequencia | sim | sim | dentro do (dashboard) |
| /rankings | rankings | sim | sim | dentro do (dashboard) |
| /financeiro | financeiro | sim | sim | dentro do (dashboard) |
| /modalidades | modalidades | sim | sim | dentro do (dashboard) |
| /groups/[id] | grupos | sim | **não** | contexto visual diferente |
| /groups/new | grupos | sim | não | |
| /groups/[id]/events/[id] | eventos | sim | não | |
| /feed | social | sim | não | |
| /profile/[id] | perfil | sim | não | |
| /events/[id] | eventos | ? | não | público ou privado? |
| /credits/buy | créditos | sim | não | |

### Rotas suspeitas de duplicação ou sobreposição

- `/jogos` (dentro do dashboard com sidebar) **e** `/groups/[id]/events/[id]` (sem sidebar) — evento existe em dois contextos visuais sem hierarquia clara
- `/treinos` e `/jogos` — ambos listam eventos, diferenciados apenas pelo tipo; lógica de "o que vai nessa rota" não é óbvia
- `/financeiro` (dashboard) **e** `/groups/[id]/payments` — gestão financeira duplicada em dois contextos
- `/atletas` (dashboard) **e** `/profile/[userId]` — visualização de jogador em dois contextos
- `/rankings` (dashboard) **e** ranking dentro de `/groups/[id]` — ranking existe duplicado
- Feed (`/feed`) completamente desconectado do contexto de grupo

### Layouts por segmento

```txt
(dashboard)/layout.tsx   ← sidebar fixo esquerdo + topbar + breadcrumbs
groups/[groupId]/        ← sem layout próprio (sem sidebar)
feed/                    ← sem layout próprio
auth/                    ← sem layout próprio
onboarding/              ← sem layout próprio
```

### Middleware

- Arquivo: `middleware.ts` na raiz
- Tecnologia: NextAuth
- Protege rotas autenticadas, redireciona para `/auth/signin`

---

## 3. Entidades do Sistema

| Entidade | Descrição | É "pai"? | Depende de |
|----------|-----------|----------|------------|
| `profiles` | dados do usuário autenticado | sim | `auth.users` |
| `groups` | grupos esportivos (atléticas, modalidades, standalone) | sim | `profiles` (created_by) |
| `group_members` | vínculo usuário ↔ grupo com role | não | `groups`, `profiles` |
| `events` | eventos genéricos (treino ou jogo, diferenciado por campo) | não | `groups` |
| `event_attendance` | RSVP de usuário em evento | não | `events`, `profiles` |
| `teams` | times formados para um evento | não | `events` |
| `team_members` | jogador escalado para um time | não | `teams`, `profiles` |
| `event_actions` | gols, assistências, cartões de um evento | não | `events`, `profiles` |
| `venues` | locais dos eventos | sim | — |
| `wallets` | carteiras (de usuário ou grupo) | sim | — |
| `charges` | cobranças de um evento para membros | não | `events`, `groups` |
| `charge_splits` | divisão individual da cobrança | não | `charges`, `profiles` |
| `transactions` | log de transações financeiras | não | `wallets` |
| `receiver_profiles` | conta bancária / chave PIX do recebedor | não | `profiles` ou `groups` |
| `notifications` | notificações do sistema | não | `profiles` |
| `posts` | posts do feed social | não | `profiles`, `groups` |
| `post_comments` | comentários de posts | não | `posts`, `profiles` |
| `post_reactions` | curtidas/reações | não | `posts`, `profiles` |
| `achievements` | definições de conquistas | sim | — |
| `player_badges` | conquistas desbloqueadas por usuário | não | `profiles`, `achievements` |
| `player_stats` | estatísticas agregadas do jogador | não | `profiles`, `groups` |
| `player_ratings` | avaliações de jogadores por evento | não | `events`, `profiles` |
| `sport_modalities` | configurações de modalidades esportivas | sim | — |
| `athlete_modalities` | preferências de modalidade do atleta | não | `profiles`, `sport_modalities` |
| `recurring_trainings` | templates de treinos recorrentes | não | `groups` |
| `game_convocations` | convocações para jogos | não | `events`, `profiles` |
| `checkin_qrcodes` | QR codes de check-in | não | `events` |
| `saved_tactics` | formações táticas salvas | não | `groups`, `profiles` |
| `promo_coupons` | cupons promocionais | sim | — |
| `credit_earning_rules` | regras de ganho de créditos | sim | — |
| `analytics_events` | eventos de analytics | não | `profiles` |

### Onde há sobreposição ou confusão

- **`groups` com `group_type`**: um mesmo modelo representa três conceitos distintos (atlética, grupo de modalidade, standalone). A diferenciação é feita por campo + hierarquia (`parent_group_id`), mas no código/UI isso vaza frequentemente.
- **`events` genérico**: treinos e jogos são o mesmo modelo `events`, diferenciados por algum campo (type?). Não há tabelas `trainings` ou `matches` separadas — mas as rotas de UI tratam como se fossem (`/treinos`, `/jogos`).
- **`wallets` polimórfica**: owner pode ser user ou group via `owner_type` + dois campos de id (`owner_id` bigint e `owner_uuid` uuid). Isso indica inconsistência histórica de tipos de PK.
- **Créditos vs Pagamentos**: o sistema tem créditos da plataforma (moeda interna para criar grupos) E cobranças financeiras reais (PIX). São duas camadas financeiras com terminologias que colidem.

---

## 4. Schema do Supabase

### Migrations aplicadas (em ordem)

```
20260125000001_create_receiver_profiles.sql
20260125000002_add_event_price_fields.sql
20260125000003_add_receiver_profile_to_charges.sql
20260125000004_add_pix_fields_to_charges.sql
20260125000005_fix_notifications_users.sql
20260127000000_legacy_users_table_FIXED.sql         ← patch de tabela legada
20260127000001_initial_schema.sql                   ← extensions, enums, helpers
20260127000002_auth_profiles.sql                    ← profiles
20260127000003_groups_and_events.sql                ← grupos, eventos, venues, RSVP
20260127000004_rls_policies.sql                     ← RLS
20260204000001_financial_system.sql                 ← wallets, charges, PIX
20260211000001_notifications.sql
20260218000001_analytics.sql
20260225000001_gamification.sql                     ← achievements, badges
20260227000001_sport_modalities.sql
20260227000002_athlete_modalities.sql
20260227000003_recurring_trainings.sql
20260227000004_game_convocations.sql
20260227000005_checkin_qrcodes.sql
20260227000006_saved_tactics.sql
20260227000007_financial_by_training.sql
20260227000008_hierarchy_and_credits.sql            ← hierarquia de grupos + créditos
20260227000009_promo_coupons.sql
20260301000010_phase1_group_lifecycle.sql
20260301000011_phase2_user_wallets.sql
20260301000012_phase2_credit_earning_rules.sql
20260301000013_phase3_pix_simplified.sql
20260301000014_phase4_social_core.sql               ← posts, comments, reactions
20260301000015_phase5_onboarding_referrals.sql
20260301000016_phase4_social_storage.sql
20260301000017_phase7_credit_purchase_requests.sql
20260302000018_backfill_financial_core_uuid.sql     ← backfill de UUID
20260302000019_backfill_notifications_uuid.sql
20260302000020_backfill_analytics_uuid.sql
20260302000021_backfill_gamification_uuid.sql
20260302000022_backfill_permission_helpers_uuid.sql
20260303000023_sport_modalities_soft_delete_description.sql
```

**Sinal de alerta:** 5 primeiras migrations têm timestamp de **2026-01-25**, antes das migrations base de **2026-01-27**. Isso indica patches aplicados fora de ordem sobre uma base existente.

### Enums principais

```sql
platform_role_type:      player, organizer, admin, super_admin
group_role_type:         owner, admin, moderator, member
event_privacy_type:      private, public
rsvp_status_type:        yes, no, maybe, waitlist  (+ 'dm' usado no código)
player_position_type:    goalkeeper, defender, midfielder, forward, versatile
event_action_type:       goal, assist, own_goal, yellow_card, red_card, save, penalty_scored, penalty_missed
payment_status_type:     pending, paid, cancelled, refunded
pix_key_type:            cpf, cnpj, email, phone, random
achievement_category:    goals, assists, participation, streak, special
sport_modality_type:     futsal, futebol, society, beach_soccer
notification_type_type:  event_created, event_updated, event_cancelled, event_reminder,
                         rsvp_confirmed, waitlist_moved, team_drawn, payment_request,
                         payment_received, achievement_unlocked, group_invite
```

### Foreign keys e tabelas de junção

```txt
auth.users ← profiles (1:1)
profiles ← group_members → groups  (n:n)
groups ← groups (self-ref: parent_group_id, hierarquia)
groups ← events
events ← event_attendance → profiles
events ← teams ← team_members → profiles
events ← event_actions (gols, cartões)
events ← charges ← charge_splits → profiles
wallets (owner polimórfico: user uuid ou group bigint)
profiles ← posts ← post_comments → profiles
posts ← post_reactions → profiles
profiles ← player_badges → achievements
```

---

## 5. Fluxos Principais do Usuário

### Fluxo A — Novo usuário (como existe hoje)

1. Acessa `/` (landing) ou link direto
2. Vai para `/auth/signup`
3. Cria conta (email + senha via NextAuth Credentials)
4. API `/api/auth/signup` cria o usuário
5. Redireciona para... **incerto** (onboarding existe em `/onboarding` mas não está claro se é obrigatório)
6. Se não fizer onboarding, cai no `/dashboard`
7. No dashboard, vê métricas e grupos — **mas ainda não está em nenhum grupo**
8. Precisa criar (`/groups/new`) ou entrar num grupo (`/groups/join`) — **sem guia explícito**

**Problema:** O onboarding existe (`/onboarding/step/[step]`) mas não parece ser o caminho forçado. O usuário pode acabar no dashboard vazio sem contexto.

### Fluxo B — Usuário comum no dia a dia

1. Abre `/dashboard`
2. Vê sidebar com: Dashboard, Treinos, Jogos, Frequência, Rankings, Financeiro, Atletas, Modalidades
3. Vai em **Treinos** (`/treinos`) para ver treinos do grupo atual
4. Clica em um treino → **muda de contexto**: vai para `/groups/[id]/events/[id]` (sem sidebar)
5. Confirma presença (RSVP) na tela do evento
6. Volta para onde? **Sem breadcrumb claro de retorno ao dashboard**

**Problema:** O fluxo passa de um contexto com sidebar para um sem sidebar. A navegação de volta não está clara.

### Fluxo C — Admin / Organizador

1. Acessa `/dashboard`
2. Para criar evento: vai para `/groups/[id]/events/new` (fora do (dashboard))
3. Preenche formulário de criação de evento (tipo, data, preço, recebedor)
4. Evento criado → grupo sabe disso
5. Para cobrar: vai em `/financeiro` (dentro do dashboard) **ou** `/groups/[id]/payments`
6. Para publicar resultado: dentro da tela do evento, registra gols/cartões via `/api/events/[id]/actions`
7. Para gerenciar membros: vai em `/groups/[id]/settings`

**Problema:** As ações do admin estão espalhadas entre o dashboard (com sidebar) e as páginas de grupo (sem sidebar), sem um painel unificado de administração.

### Fluxo D — Social

1. Usuário acessa `/feed`
2. Vê posts (global? por grupo? não está claro no código)
3. Pode criar post, curtir, comentar
4. **Esse fluxo está completamente desconectado do dashboard** — não tem link na sidebar principal
5. API: `GET /api/social/feed`, `POST /api/social/posts`

**Problema:** O feed existe tecnicamente mas não tem entrada clara na navegação principal.

---

## 6. Estrutura do Frontend

### Árvore de pastas (3 níveis)

```txt
src/
├── app/                        ← Next.js App Router (rotas + API)
│   ├── (dashboard)/            ← área autenticada com sidebar
│   ├── api/                    ← route handlers
│   ├── auth/                   ← login/signup
│   ├── credits/                ← comprar créditos
│   ├── events/                 ← evento público
│   ├── feed/                   ← feed social
│   ├── groups/                 ← grupos (sem sidebar)
│   ├── onboarding/             ← onboarding flow
│   └── profile/                ← perfil do usuário
│
├── components/
│   ├── athletes/
│   ├── credits/
│   ├── dashboard/              ← HeroSection, MetricsOverview, etc.
│   ├── events/
│   ├── financial/
│   ├── group/                  ← componentes da página de detalhe do grupo
│   ├── groups/                 ← CreateGroupForm, GroupSettingsTabs
│   ├── layout/                 ← Sidebar, Topbar, Breadcrumbs, GroupSwitcher
│   ├── modalities/
│   ├── notifications/
│   ├── onboarding/
│   ├── payments/
│   ├── providers/
│   ├── social/
│   ├── trainings/
│   └── ui/                     ← componentes base (button, card, badge...)
│
├── contexts/
│   ├── direct-mode-context.tsx ← toggle "modo direto" vs modo grupo
│   └── group-context.tsx       ← grupo ativo atual
│
├── db/
│   └── client.ts               ← conexão postgres (pool direto, não ORM)
│
├── hooks/
│   ├── use-debounce.ts
│   ├── use-error-handler.ts
│   └── use-notifications.ts
│
├── lib/
│   ├── auth.ts                 ← NextAuth config
│   ├── auth-helpers.ts         ← getCurrentUser, requireAuth
│   ├── permissions.ts          ← lógica de autorização e hierarquia
│   ├── group-type.ts           ← normalização de tipos de grupo
│   ├── credits.ts              ← sistema de créditos
│   ├── pix.ts                  ← integração PIX
│   ├── validations.ts          ← schemas Zod
│   └── error-handler.ts        ← tratamento de erros
│
└── types/
    └── next-auth.d.ts          ← extensão de tipos do NextAuth
```

### Elementos críticos

| Elemento | Caminho |
|----------|---------|
| App routes | `src/app/` |
| Dashboard routes | `src/app/(dashboard)/` |
| API routes | `src/app/api/` |
| Sidebar | `src/components/layout/sidebar.tsx` |
| Group switcher | `src/components/layout/group-switcher.tsx` |
| Auth config | `src/lib/auth.ts` |
| DB client | `src/db/client.ts` |
| Permissões | `src/lib/permissions.ts` |
| Grupo ativo (context) | `src/contexts/group-context.tsx` |
| Modo direto (context) | `src/contexts/direct-mode-context.tsx` |

---

## 7. Código das Rotas Mais Críticas

### Página inicial após login
- Caminho: `src/app/(dashboard)/dashboard/page.tsx`
- Carrega: grupos do usuário, próximos eventos, check de onboarding
- Componentes: HeroSection, MetricsOverview, UpcomingTrainings, PendingPaymentsCard

### Página de grupo
- Caminho: `src/app/groups/[groupId]/page.tsx`
- Carrega: info do grupo, próximos eventos, top scorers, últimas partidas, frequência, rankings, minha estatística
- Cálculo de score: `games*2 + goals*3 + assists*2 + mvps*5 + wins*1`

### Página de evento/treino/jogo
- Caminho: `src/app/groups/[groupId]/events/[eventId]/page.tsx`

### Criação de grupo
- Caminho: `src/app/groups/new/page.tsx`
- Componente: `src/components/groups/create-group-form.tsx`

### Criação de evento
- Caminho: `src/app/groups/[groupId]/events/new/page.tsx`
- API: `POST /api/events`

### Feed social
- Caminho: `src/app/feed/page.tsx`
- API: `GET /api/social/feed`

### Middleware / auth guard
- Caminho: `middleware.ts` (raiz)
- Tecnologia: NextAuth middleware

### Cliente do banco
- Caminho: `src/db/client.ts`
- Tecnologia: postgres (raw SQL pool), **sem ORM**

### Hook/context de sessão
- Auth: NextAuth `useSession()` / `getServerSession()`
- Grupo ativo: `src/contexts/group-context.tsx`

---

## 8. Regras de Permissão

### Implementação
- **RLS no Supabase**: controla acesso em nível de banco
- **`src/lib/permissions.ts`**: lógica de autorização no servidor
- **`src/lib/permissions-middleware.ts`**: middleware de API

### Hierarquia de grupos
- Atléticas (top-level) → Grupos de modalidade (filhos)
- Admin da atlética pode gerenciar filhos
- Máximo 2 níveis de profundidade

### Tabela de permissões

| Ação | Quem pode | Onde controlado |
|------|-----------|-----------------|
| Criar grupo standalone/atlética | qualquer usuário autenticado (com créditos) | API + lib/credits |
| Criar grupo de modalidade | admin da atlética pai | `canCreateGroup()` em permissions.ts |
| Criar evento | admin/owner do grupo | API + `canManageGroup()` |
| Editar evento | admin/owner do grupo | API |
| RSVP em evento | membro do grupo | API |
| Registrar gol/cartão | admin do grupo | API |
| Cobrar membros | admin do grupo | API |
| Ver financeiro | admin do grupo | API |
| Postar no feed | usuário autenticado (?) | não está claro |
| Gerenciar membros | admin/owner do grupo | API + RLS |

### Campos de permissão retornados por `getGroupPermissions()`

```ts
{
  canManage: boolean
  canCreateChild: boolean
  canEditSettings: boolean
  canManageMembers: boolean
  canManageFinances: boolean
  isAdmin: boolean
  isAthleticAdmin: boolean
}
```

---

## 9. Problemas Percebidos

### Para o usuário, está confuso...

- Não sabe a diferença entre **Treinos** e **Jogos** na sidebar — parece o mesmo tipo de conteúdo
- Quando clica num treino, **sai do contexto visual** (perde a sidebar) sem aviso
- **Grupo vs Modalidade vs Atlética** — três conceitos que o sistema diferencia mas o usuário vê como "grupo"
- Não tem clareza de **para que servem os créditos** da plataforma
- O **feed social** existe mas não está na navegação principal — usuário provavelmente não descobre
- **Dashboard** mostra muita coisa (métricas, treinos, pagamentos, grupos) sem hierarquia visual clara

### Para o dev, está confuso...

- **`events`** é um modelo único para treinos E jogos — diferenciação por campo não documentada. As rotas de UI `/treinos` e `/jogos` parecem domains separados mas são a mesma tabela
- **`wallets`** usa dois tipos de PK (`owner_id` bigint E `owner_uuid` uuid) — indica migração incompleta de bigint para uuid
- **5 migrations com timestamp anterior** ao schema base — patches fora de ordem que indicam histórico de mudanças não planejadas
- **Créditos da plataforma** vs **cobranças financeiras reais** — dois sistemas de "pagamento" com terminologia que colide
- **`group_type`** normalizado em `src/lib/group-type.ts` — DB usa uma representação, código usa outra, UI usa uma terceira
- **"Modo Direto"** (`DirectModeContext`) — conceito interno que não está claro para quem lê o código pela primeira vez
- Componentes divididos entre `components/group/` e `components/groups/` — duas pastas para coisas relacionadas

### Telas que parecem duplicadas

- `/treinos` (dashboard) + `/groups/[id]/events/[id]` (sem dashboard) — dois contextos para o mesmo conteúdo
- `/financeiro` (dashboard) + `/groups/[id]/payments` — financeiro em dois lugares
- `/rankings` (dashboard) + rankings dentro de `/groups/[id]` — ranking duplicado
- `/atletas` (dashboard) + `/profile/[userId]` — dois contextos para ver um jogador

### Nomenclatura inconsistente (DB ≠ código ≠ UI)

| Conceito | Banco de dados | Código TypeScript | Interface UI |
|----------|----------------|-------------------|--------------|
| Grupo raiz | `groups` com `group_type='atletica'` | `GroupType.ATLETICA` | "Atlética" |
| Subgrupo | `groups` com `parent_group_id` | `GroupType.MODALITY_GROUP` | "Modalidade" |
| Grupo simples | `groups` com `group_type='standalone'` | `GroupType.STANDALONE` | "Grupo" |
| Treino | `events` (campo type) | `Event` | "Treino" |
| Jogo | `events` (campo type) | `Event` | "Jogo" / "Pelada" |
| Presença | `event_attendance` | `RSVP` | "Confirmação" / "Frequência" |
| Crédito plataforma | `wallets` / `credit_earning_rules` | `Credits` | "Créditos" |
| Cobrança financeira | `charges` | `Charge` | "Cobrança" / "Pagamento" |

### Fluxos frágeis (ninguém quer mexer)

- Sistema de créditos (múltiplas tabelas, regras de ganho, consumo, compra — muito acoplado)
- Hierarquia de grupos (parent_group_id + tipos + permissões cascateadas)
- PIX integration (pix.ts + receiver_profiles + charge_splits)
- Sistema de wallets (polimorfismo com dois tipos de PK)

### Bugs que mais aparecem

- (a preencher com dados reais de uso)

---

## 10. Telas Principais

| Tela | Caminho no App | O que aparece hoje |
|------|----------------|-------------------|
| Dashboard | `/dashboard` | Hero, métricas, treinos próximos, pagamentos pendentes, grupos |
| Treinos | `/treinos` | Lista de eventos do tipo treino do grupo ativo |
| Jogos | `/jogos` | Lista de eventos do tipo jogo do grupo ativo |
| Frequência | `/frequencia` | Histórico de presença |
| Rankings | `/rankings` | Ranking de jogadores do grupo |
| Financeiro | `/financeiro` | Cobranças, status de pagamento |
| Atletas | `/atletas` | Lista de atletas do grupo |
| Modalidades | `/modalidades` | Modalidades esportivas configuradas |
| Grupo (detalhe) | `/groups/[id]` | Próximos eventos, ranking, estatísticas, histórico de partidas |
| Grupo (settings) | `/groups/[id]/settings` | Configurações do grupo, membros, escalação |
| Evento (detalhe) | `/groups/[id]/events/[id]` | Info do evento, RSVP, escalação, resultado |
| Criação de grupo | `/groups/new` | Formulário de criação |
| Criação de evento | `/groups/[id]/events/new` | Formulário de criação |
| Feed | `/feed` | Posts sociais (sem link na nav principal) |
| Perfil | `/profile/[id]` | Perfil do usuário (sem link claro na nav) |
| Onboarding | `/onboarding` | Wizard de entrada (não forçado no fluxo) |

---

## Pacote Mínimo — Checklist de Preenchimento

- [x] **1. Visão do produto atual** — o que deveria ser vs o que virou
- [x] **2. Árvore de rotas** — completa, com grupos
- [x] **3. Tabelas principais** — lista com descrição
- [x] **5. 3 fluxos principais** — novo usuário, usuário comum, admin, social
- [x] **9. Lista de problemas percebidos** — crua e estruturada

---

## O que este diagnóstico revela

Com base nos dados acima, os problemas estruturais identificados são:

### Problema 1 — Dois contextos visuais sem hierarquia
O app tem duas "zonas" visuais: o `(dashboard)` com sidebar e as páginas de `/groups/` sem sidebar. O usuário transita entre eles sem perceber, sem breadcrumb de retorno claro.

### Problema 2 — `events` é um modelo que faz dois trabalhos
Treinos e jogos são o mesmo modelo no banco mas rotas diferentes na UI. Isso cria confusão conceitual tanto para o usuário quanto para o dev.

### Problema 3 — Três sistemas de "grupos" num só modelo
Atlética, grupo de modalidade e grupo standalone são o mesmo modelo `groups` com diferenciação por campos. A normalização em `group-type.ts` é um sinal de que essa abstração vazou para o código.

### Problema 4 — Dois sistemas financeiros paralelos
Créditos da plataforma (moeda interna) + cobranças reais (PIX) coexistem com terminologia que colide. O usuário não distingue "crédito" de "pagamento" facilmente.

### Problema 5 — Features sem entrada na navegação
Feed social e perfil existem como rotas mas não têm link na sidebar do dashboard. São features invisíveis na navegação principal.

### Problema 6 — Onboarding não é obrigatório
O wizard de onboarding existe mas o fluxo de novo usuário não garante que ele passe por lá. Resultado: usuário pode chegar ao dashboard sem nenhum grupo.

### Problema 7 — Migração histórica incompleta de bigint → uuid
Wallets com dois campos de PK (`owner_id` bigint + `owner_uuid` uuid) e 5 migrations de backfill de UUID indicam uma refatoração em andamento que não terminou limpa.

---

**Última atualização:** 2026-03-11
**Versão:** 1.1 — preenchido com dados reais
**Status:** ✅ Pronto para análise estrutural
