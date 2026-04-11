# Auditoria de Arquitetura — ResenhApp
## Estado real vs PLANO-ARQUITETURA-ALVO.md

> **Data:** 2026-03-11
> **Baseado em:** leitura direta de `middleware.ts`, `next.config.ts`, `src/app/(app)/layout.tsx`, `src/components/layout/authenticated-shell.tsx`, `src/components/layout/sidebar.tsx`, `src/app/(app)/groups/[groupId]/page.tsx`, `src/app/events/[eventId]/page.tsx`, `src/app/onboarding/**`, e glob completo de `src/app/**`
> **Tipo:** Read-only — nenhuma alteração feita durante a auditoria

---

## TL;DR

O projeto avançou muito além do que o `RAIO-X-ESTRUTURAL.md` descreve. Os 5 problemas críticos do diagnóstico original foram resolvidos. A implementação atual está ~75% alinhada com o `PLANO-ARQUITETURA-ALVO.md v1.2`.

| Problema original (RAIO-X) | Status atual |
|---|---|
| Middleware não existia | ✅ Implementado com auth gate + onboarding gate |
| Dois shells visuais incompatíveis | ✅ Shell unificado `(app)/` com `AuthenticatedShell` |
| "Novo Evento" no sidebar saía do shell | ✅ Removido do sidebar |
| `groups/[groupId]` era um app dentro do app | ✅ Movido para `(app)/groups/`, `DashboardHeader` removido |
| DirectMode era um terceiro layout silencioso | ✅ Removido completamente |

---

## Execução por Fase

**Estimativa global: ~75% do plano implementado**

| Fase | Descrição | Status |
|---|---|---|
| Fase 0 | Bridge imediato (quick wins) | ✅ ~90% |
| Fase 1 | Shell unificado | ✅ 100% |
| Fase 2 | Hub de eventos | ✅ ~90% |
| Fase 3 | Onboarding gate | ✅ 100% |
| Fase 4 | Nomenclatura (Quota, Atleta) | ✅ ~85% |
| Fase 5 | Consolidação `users` vs `profiles` | ⏸️ Não iniciada |
| Fase 6 | Migração URL para PT-BR | ❌ Não iniciada |

---

## Fase 0 — Bridge Imediato

| Item | Status | Evidência |
|---|---|---|
| `middleware.ts` criado com auth guard | ✅ | `middleware.ts:69-78` |
| `groups/layout.tsx` com Sidebar + Topbar | ⚠️ Órfão | `src/app/groups/layout.tsx` — inerte, nenhuma rota em `/groups/` fora de `(app)/` |
| `DashboardHeader` removido de `groups/page.tsx` | ✅ | `(app)/groups/[groupId]/page.tsx:1-11` — sem import |
| Back button `/dashboard` hardcoded removido | ✅ | `(app)/groups/[groupId]/page.tsx:449-480` — botão ausente |
| Nome do grupo no sidebar clicável | ✅ | `sidebar.tsx:144-150` — `Link href={/groups/${currentGroup.id}}` |

---

## Fase 1 — Shell Unificado

| Item | Status | Evidência |
|---|---|---|
| Route group `(app)/` com `AuthenticatedShell` | ✅ | `(app)/layout.tsx:10` — `<AuthenticatedShell>{children}</AuthenticatedShell>` |
| `AuthenticatedShell`: Sidebar + Topbar + Breadcrumbs | ✅ | `authenticated-shell.tsx:7-27` |
| `(dashboard)/` route group removido | ✅ | Glob `src/app/(dashboard)/**` retorna vazio |
| DirectMode removido | ✅ | Grep `isDirectMode` em `src/app/**` — zero ocorrências |
| Créditos removidos do sidebar | ✅ | Sidebar sem referência a `credits` |
| "Novo Evento" removido do sidebar | ✅ | Sidebar sem botão de criação de evento |
| Grupos como rota dentro de `(app)/` | ✅ | `(app)/groups/[groupId]/page.tsx` usa `AuthenticatedShell` automaticamente |

---

## Fase 2 — Hub de Eventos

| Item | Status | Evidência |
|---|---|---|
| Hub `/eventos` com filtro `?tipo=` | ✅ | `(app)/eventos/page.tsx:13` — `FilterType = "todos" \| "treino" \| "jogo"` |
| `/treinos` → `/eventos?tipo=treino` | ✅ | `next.config.ts:20-23` + `(app)/treinos/page.tsx:4` |
| `/jogos` → `/eventos?tipo=jogo` | ✅ | `next.config.ts:25-28` + `(app)/jogos/page.tsx` |
| `/grupos/:id/events/new` → `/eventos/novo?groupId=` | ✅ | `next.config.ts:35-38` |
| `/grupos/:id/events/:eventId` → `/eventos/:eventId` | ✅ | `next.config.ts:40-43` |
| `/eventos/novo/page.tsx` existe | ✅ | `(app)/eventos/novo/page.tsx` |
| Sidebar: Treinos/Jogos apontam para `/eventos?tipo=` | ✅ | `sidebar.tsx:90-91` |
| Hero gradient em `groups/page.tsx` removido | ⚠️ | `(app)/groups/[groupId]/page.tsx:449-502` — `DashboardHeader` e back button removidos, mas `div.bg-gradient-to-br` e `min-h-screen bg-gray-50` ainda presentes |

---

## Fase 3 — Onboarding

| Item | Status | Evidência |
|---|---|---|
| Rota `/onboarding/step/[step]` | ✅ | `onboarding/step/[step]/page.tsx` |
| Gate: `onboarding_completed=false` → `/onboarding` | ✅ | `middleware.ts:125-134` |
| `?returnTo=` preservado e validado | ✅ | `middleware.ts:131-133`, `onboarding/page.tsx:14-16` |
| User com flag `true` não entra em `/onboarding` | ✅ | `middleware.ts:136-140` |
| Link público de evento bypassa gate | ✅ | `middleware.ts:12-13` — `/events/*` em `isPublicPath` |
| Evento público (`/events/:id`) redireciona se autenticado | ✅ | `events/[eventId]/page.tsx:34-36` — redirect para `/eventos/:id?returnTo=...` |

---

## Fase 4 — Nomenclatura

| Item | Status | Evidência |
|---|---|---|
| "Créditos" removido do sidebar | ✅ | `sidebar.tsx:76-124` — sem item de créditos |
| Rename "Quota" em Settings | ✅ | `(app)/settings/page.tsx:11` — `SettingsTab` inclui `"quota"` |
| `/groups/:id/credits` → `/settings?tab=quota` | ✅ | `next.config.ts:44-48` |
| "Atleta" como nome canônico no sidebar | ✅ | `sidebar.tsx:64` — `athleteRole = "Atleta"` |
| `/profile/:userId` → `/atletas/:userId` | ✅ | `next.config.ts:30-33` |
| Sidebar: "Atletas" como item de nav | ✅ | `sidebar.tsx:104` |

---

## Fase 5 — Consolidação de identidade (`users` vs `profiles`)

**Status: ⏸️ Não iniciada — não bloqueia Fases 0–4**

O plano marca como "hipótese preferencial, não dogma congelado". A validação requer acesso direto ao banco.

---

## Fase 6 — Migração de URL para PT-BR

**Status: ❌ Não iniciada — intencional**

Definida como sprint isolado no plano para evitar misturar reorganização arquitetural com renomeação de URL.

| URL atual | URL alvo (Fase 6) |
|---|---|
| `/groups/:id` | `/grupos/:id` |
| `/settings` | `/configuracoes` |
| `/events/:id` | mantém como público |

---

## Estrutura de Rotas Real (2026-03-11)

```
src/app/
│
├── layout.tsx                    # Root: ThemeProvider > ErrorBoundary > AuthProvider > GroupProvider
├── page.tsx                      # Home redirect
│
├── (app)/                        # SHELL AUTENTICADO
│   ├── layout.tsx                # 'use client' → <AuthenticatedShell>
│   ├── dashboard/page.tsx
│   ├── eventos/
│   │   ├── page.tsx              # Hub com ?tipo= filter
│   │   ├── [eventId]/page.tsx
│   │   └── novo/page.tsx
│   ├── treinos/page.tsx          # redirect → /eventos?tipo=treino
│   ├── jogos/page.tsx            # redirect → /eventos?tipo=jogo
│   ├── groups/
│   │   ├── new/page.tsx
│   │   ├── join/page.tsx
│   │   └── [groupId]/
│   │       ├── page.tsx          # landing contextual (sem DashboardHeader)
│   │       ├── events/new/page.tsx
│   │       ├── events/[eventId]/page.tsx
│   │       ├── settings/page.tsx
│   │       ├── payments/page.tsx
│   │       └── credits/page.tsx
│   ├── atletas/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── modalidades/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── financeiro/
│   │   ├── page.tsx
│   │   └── charges/[chargeId]/page.tsx
│   ├── rankings/page.tsx
│   ├── frequencia/page.tsx
│   └── settings/page.tsx         # Hub com tabs: profile | group | invites | quota
│
├── auth/                         # PÚBLICO (AUTH_PATHS no middleware)
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   └── error/page.tsx
│
├── onboarding/                   # AUTENTICADO, fora do (app)/ shell
│   ├── page.tsx                  # redirect → /onboarding/step/1
│   └── step/[step]/page.tsx
│
└── events/[eventId]/page.tsx     # PÚBLICO (preview), redirect se autenticado
```

---

## Middleware — Resumo de regras

**Arquivo:** `middleware.ts` (148 linhas)
**Matcher:** `/((?!api|_next/static|_next/image|favicon.ico|simple-test).*)`

```
Não autenticado + rota não pública
  → redirect /auth/signin?callbackUrl=<path>

Não autenticado + rota pública (/auth/*, /events/*)
  → NextResponse.next()

Autenticado + onboarding_completed=false + não em /onboarding/* + não em /events/*
  → redirect /onboarding/step/1?returnTo=<path>

Autenticado + onboarding_completed=true + está em /onboarding/*
  → redirect returnTo ou /dashboard

Autenticado + acessa /auth/* + onboarding_completed=false
  → redirect /onboarding/step/1

Autenticado + acessa /auth/* + onboarding_completed=true
  → redirect callbackUrl ou /dashboard
```

**Fontes de `onboarding_completed` (em cascata):**
1. JWT token (`authContext.user.onboardingCompleted`) — `middleware.ts:95-98`
2. Fetch interno para `/api/onboarding` — `middleware.ts:100-102`
3. Supabase REST direto (`/rest/v1/users`) — `middleware.ts:104-106`

---

## Redirects configurados (next.config.ts)

| Source | Destination | Tipo |
|---|---|---|
| `/treinos` | `/eventos?tipo=treino` | 307 |
| `/jogos` | `/eventos?tipo=jogo` | 307 |
| `/profile/:userId` | `/atletas/:userId` | 307 |
| `/groups/:groupId/events/new` | `/eventos/novo?groupId=:groupId` | 307 |
| `/groups/:groupId/events/:eventId` | `/eventos/:eventId?returnTo=/groups/:groupId` | 307 |
| `/groups/:groupId/credits` | `/settings?tab=quota&groupId=:groupId` | 307 |

---

## Pendências remanescentes

### P0 — Fazer antes do próximo PR

| # | Ação | Arquivo | Por quê |
|---|---|---|---|
| 1 | Deletar `src/app/groups/layout.tsx` | `src/app/groups/layout.tsx` | Arquivo órfão criado na sessão 2026-03-11; nenhuma rota em `/groups/` fora de `(app)/` |
| 2 | Remover hero gradient de `groups/[groupId]/page.tsx` | `(app)/groups/[groupId]/page.tsx:449-502` | `div.bg-gradient-to-br + min-h-screen bg-gray-50` cria visual inconsistente dentro do `brand-panel` do `AuthenticatedShell` |

### P1 — Alta prioridade

| # | Ação | Risco |
|---|---|---|
| 1 | Cachear `onboarding_completed` no JWT para evitar fetch por request no middleware | Latência por request autenticado |
| 2 | Confirmar se `(app)/groups/[groupId]/credits/page.tsx` deve ser mantida ou deletada | Redirect no next.config cobre, mas rota ainda existe |
| 3 | Validar backfill de `onboarding_completed` para usuários existentes | `null` é tratado como `undefined` no gate, não como `false` — comportamento correto a confirmar |

### P2 — Estrutural (Fase 5 e 6)

| # | Ação |
|---|---|
| 1 | Fase 6: renomear `/groups` → `/grupos`, `/settings` → `/configuracoes` (sprint isolado) |
| 2 | Fase 5: consolidar `users` vs `profiles` como tabela canônica |
| 3 | Audit de auth nas API routes — `/api/*` está fora do matcher do middleware; cada handler verifica manualmente |

---

## Comparação com diagnóstico original

| Problema (RAIO-X-ESTRUTURAL.md) | Status 2026-03-11 |
|---|---|
| `middleware.ts` não existia | ✅ Existe, com auth + onboarding gate |
| Dois shells visuais (Shell A + Shell B) | ✅ Unificado em `(app)/` + `AuthenticatedShell` |
| Sidebar apontava para fora do shell | ✅ Links internos corrigidos; "Novo Evento" e "Créditos" removidos |
| `groups/[groupId]` tinha seu próprio header, hero, back button | ⚠️ `DashboardHeader` e back button removidos; hero gradient ainda presente |
| DirectMode era um terceiro layout silencioso | ✅ Removido |
| `/treinos` e `/jogos` eram rotas duplicadas | ✅ Unificadas em `/eventos` com filtro `?tipo=` |
| `/events/[eventId]` com auth indefinida | ✅ Preview público com redirect se autenticado |
| `users` vs `profiles` coexistem | ⏸️ Não resolvido — Fase 5 pendente |

---

> **Próximo passo:** Fase 6 (URL PT-BR) após resolver P0 e P1 acima.
> **Gerado em:** 2026-03-11
> **Baseado na auditoria:** comparação direta entre `docs/PLANO-ARQUITETURA-ALVO.md` e código-fonte real
