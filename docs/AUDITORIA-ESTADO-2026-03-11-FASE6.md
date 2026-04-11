# Auditoria de Estado â€” PÃ³s Fase 6
## ResenhApp Â· MigraÃ§Ã£o PT-BR concluÃ­da

> **Data:** 2026-03-11
> **SessÃ£o:** Fase 0 â†’ Fase 1 â†’ Fase 2 â†’ Fase 3 â†’ Fase 4 â†’ Fase 6 (PT-BR URLs)
> **ValidaÃ§Ã£o executada:** `pnpm tsc --noEmit` âœ… Â· `playwright onboarding-smoke` âœ…
> **Tipo:** Read-only â€” estado atual do projeto

---

## TL;DR

> UPDATE 2026-03-11 (sessao atual)
> - `rsvp-flow.spec.ts` migrado para `/eventos?tipo=treino`.
> - middleware de onboarding agora e JWT-only (sem fetch ao Supabase no request path).
> - `auth.ts` garante `onboardingCompleted` em tokens legados.
> - consolidacao `users vs profiles` segue como Fase 5, com reducao de uso de `profiles` no runtime.

> - `financeiro/charges/[chargeId]` agora usa apenas `users` e corrige validacao de ownership com `created_by`.
> - `auth.ts` removeu fallback legado `profiles + auth.users`; autenticacao agora e somente `users`.
> - auditoria de API auth concluida: 72 handlers mapeados, sem rotas sensiveis expostas.
> - `api/debug` agora exige auth (alem de `NODE_ENV=development`).
> - `eventos/page.tsx` ganhou fallback para schemas sem colunas `opponent/our_score/opponent_score`.
> - `financeiro/charges/[chargeId]` agora cobre schema UUID atual (`user_id/amount_cents`) com fallback legado.
> - smoke E2E: `onboarding-smoke` passou; `payment/rsvp` requerem `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` configurados.
> - smoke E2E atualizado para fixture automatica de usuario (sem dependencia de credenciais fixas) e execucao estavel em `--workers=1`.
> - OBS: secoes abaixo sobre cache TTL no middleware e pendencia do `rsvp-flow.spec.ts` sao historicas; o estado mais recente considera JWT-only + teste atualizado.
O projeto completou as 6 fases do `PLANO-ARQUITETURA-ALVO.md` com exceÃ§Ã£o de Fase 5 (consolidaÃ§Ã£o `users` vs `profiles`). O estado atual Ã© **~95% alinhado** com o plano aprovado.

Pendente principal apos esta sessao: fechar checklist operacional da Fase 5 (migrations + smoke final), sem regressao de auth.

---

## ExecuÃ§Ã£o por Fase â€” Estado Final

| Fase | DescriÃ§Ã£o | Status | Progresso |
|---|---|---|---|
| Fase 0 | Bridge imediato (middleware, DashboardHeader, back button, grupo clicÃ¡vel) | âœ… | 100% |
| Fase 1 | Shell unificado `(app)/` + `AuthenticatedShell` | âœ… | 100% |
| Fase 2 | Hub `/eventos` com filtro `?tipo=` | âœ… | 100% |
| Fase 3 | Onboarding gate no middleware + wizard | âœ… | 100% |
| Fase 4 | Nomenclatura Quota, Atleta, remoÃ§Ã£o de crÃ©ditos do sidebar | âœ… | 100% |
| Fase 5 | Consolidacao `users` vs `profiles` | 🟡 | Em andamento |
| Fase 6 | MigraÃ§Ã£o URL PT-BR + redirects de compatibilidade | âœ… | ~95% |

---

## O que foi feito nesta sessÃ£o

### P1 â€” OtimizaÃ§Ã£o do middleware de onboarding

**Problema anterior:** O middleware chamava `/api/onboarding` via fetch em cada request autenticado quando `onboarding_completed` nÃ£o estava no JWT â€” adicionando uma ida Ã  rede por navegaÃ§Ã£o.

**SoluÃ§Ã£o implementada:**
- Cache em memÃ³ria por `userId` com TTL de 60 segundos (`middleware.ts:5-46`)
- FunÃ§Ã£o `requiresOnboardingResolution(pathname)` que faz early-return para rotas que nÃ£o precisam do gate â€” evitando leitura desnecessÃ¡ria (`middleware.ts:18-23`)
- Fallback direto ao Supabase REST com resultado cacheado â€” removendo o hop intermediÃ¡rio para `/api/onboarding`

```
Fluxo antigo: request â†’ JWT miss â†’ fetch /api/onboarding â†’ Supabase
Fluxo atual:  request â†’ JWT hit  â†’ cache hit â†’ skip (TTL 60s)
              request â†’ JWT miss â†’ cache miss â†’ Supabase â†’ cache set
```

**EvidÃªncia:** [middleware.ts:31-46](middleware.ts#L31), [middleware.ts:98-100](middleware.ts#L98)

---

### Fase 6 â€” MigraÃ§Ã£o de URLs para PT-BR

#### Rotas canÃ´nicas criadas

| Rota canÃ´nica | ImplementaÃ§Ã£o | EvidÃªncia |
|---|---|---|
| `/configuracoes` | `(app)/configuracoes/page.tsx` â†’ re-export de `settings/page` | [(app)/configuracoes/page.tsx](src/app/(app)/configuracoes/page.tsx) |
| `/grupos/new` | `(app)/grupos/new/page.tsx` â†’ re-export | [(app)/grupos/new/page.tsx](src/app/(app)/grupos/new/page.tsx) |
| `/grupos/join` | `(app)/grupos/join/page.tsx` â†’ re-export | [(app)/grupos/join/page.tsx](src/app/(app)/grupos/join/page.tsx) |
| `/grupos/[groupId]` | `(app)/grupos/[groupId]/page.tsx` â†’ re-export | [(app)/grupos/[groupId]/page.tsx](src/app/(app)/grupos/%5BgroupId%5D/page.tsx) |
| `/grupos/[groupId]/configuracoes` | `(app)/grupos/[groupId]/configuracoes/page.tsx` â†’ re-export | [(app)/grupos/[groupId]/configuracoes/page.tsx](src/app/(app)/grupos/%5BgroupId%5D/configuracoes/page.tsx) |
| `/grupos/[groupId]/pagamentos` | `(app)/grupos/[groupId]/pagamentos/page.tsx` â†’ re-export | [(app)/grupos/[groupId]/pagamentos/page.tsx](src/app/(app)/grupos/%5BgroupId%5D/pagamentos/page.tsx) |

#### Redirects 301 de compatibilidade (next.config.ts)

| Source (legado) | Destination (canÃ´nico) | Tipo | EvidÃªncia |
|---|---|---|---|
| `/settings` | `/configuracoes` | 301 | [next.config.ts:30-33](next.config.ts#L30) |
| `/groups/:groupId` | `/grupos/:groupId` | 301 | [next.config.ts:75-78](next.config.ts#L75) |
| `/groups/new` | `/grupos/new` | 301 | [next.config.ts:50-53](next.config.ts#L50) |
| `/groups/join` | `/grupos/join` | 301 | [next.config.ts:55-58](next.config.ts#L55) |
| `/groups/:groupId/settings` | `/grupos/:groupId/configuracoes` | 301 | [next.config.ts:40-43](next.config.ts#L40) |
| `/groups/:groupId/payments` | `/grupos/:groupId/pagamentos` | 301 | [next.config.ts:45-48](next.config.ts#L45) |
| `/groups/:groupId/events/new` | `/eventos/novo?groupId=:groupId` | 307 | [next.config.ts:60-63](next.config.ts#L60) |
| `/groups/:groupId/events/:eventId` | `/eventos/:eventId?returnTo=/grupos/:groupId` | 307 | [next.config.ts:65-68](next.config.ts#L65) |
| `/groups/:groupId/credits` | `/configuracoes?tab=quota&groupId=:groupId` | 307 | [next.config.ts:70-73](next.config.ts#L70) |
| `/treinos` | `/eventos?tipo=treino` | 307 | [next.config.ts:20-23](next.config.ts#L20) |
| `/jogos` | `/eventos?tipo=jogo` | 307 | [next.config.ts:25-28](next.config.ts#L25) |
| `/profile/:userId` | `/atletas/:userId` | 301 | [next.config.ts:35-38](next.config.ts#L35) |

#### Links internos atualizados para canÃ´nico PT-BR

| Componente | O que mudou | EvidÃªncia |
|---|---|---|
| `sidebar.tsx` | `groupHref` â†’ `/grupos/`, `Configuracoes` â†’ `/configuracoes`, grupo clicÃ¡vel â†’ `/grupos/:id` | [sidebar.tsx:61](src/components/layout/sidebar.tsx#L61) |
| `topbar.tsx` | `settingsHref` â†’ `/grupos/:id/configuracoes`, `invitesHref` â†’ PT-BR | [topbar.tsx](src/components/layout/topbar.tsx) |
| `group-switcher.tsx` | "Criar Grupo" â†’ `/grupos/new` | [group-switcher.tsx](src/components/layout/group-switcher.tsx) |
| `groups-card.tsx` | Link grupos â†’ `/grupos/:id` | [groups-card.tsx](src/components/dashboard/groups-card.tsx) |
| `create-group-form.tsx` | `router.push` â†’ `/grupos/:id` | [create-group-form.tsx](src/components/groups/create-group-form.tsx) |
| `join-group-form.tsx` | `router.push` â†’ `/grupos/:id` | [join-group-form.tsx](src/components/groups/join-group-form.tsx) |
| `invites-manager.tsx` | URL de convite â†’ `/grupos/join?code=` | [invites-manager.tsx](src/components/groups/invites-manager.tsx) |
| `event-form.tsx` | Link quota â†’ `/configuracoes?tab=quota` | [event-form.tsx](src/components/events/event-form.tsx) |
| `settings/page.tsx` | Todos os links internos â†’ PT-BR | [(app)/settings/page.tsx](src/app/(app)/settings/page.tsx) |
| `breadcrumbs.tsx` | Segmentos `grupos`, `configuracoes`, `pagamentos` mapeados | [breadcrumbs.tsx](src/components/layout/breadcrumbs.tsx) |
| `group-context.tsx` | DetecÃ§Ã£o de path de grupo inclui `/grupos/` | [group-context.tsx](src/contexts/group-context.tsx) |

---

## Estrutura de rotas â€” Estado atual completo

```
src/app/
â”‚
â”œâ”€â”€ layout.tsx                         # Root: ThemeProvider > ErrorBoundary > AuthProvider > GroupProvider
â”œâ”€â”€ page.tsx                           # Home â†’ redirect
â”‚
â”œâ”€â”€ (app)/                             # SHELL AUTENTICADO (AuthenticatedShell)
â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”œâ”€â”€ dashboard/page.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ eventos/                       # HUB CANÃ”NICO
â”‚   â”‚   â”œâ”€â”€ page.tsx                   # ?tipo= filter (todos | treino | jogo)
â”‚   â”‚   â”œâ”€â”€ [eventId]/page.tsx
â”‚   â”‚   â””â”€â”€ novo/page.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ treinos/page.tsx               # redirect â†’ /eventos?tipo=treino
â”‚   â”œâ”€â”€ jogos/page.tsx                 # redirect â†’ /eventos?tipo=jogo
â”‚   â”‚
â”‚   â”œâ”€â”€ grupos/                        # CANÃ”NICO PT-BR
â”‚   â”‚   â”œâ”€â”€ new/page.tsx               # re-export de groups/new
â”‚   â”‚   â”œâ”€â”€ join/page.tsx              # re-export de groups/join
â”‚   â”‚   â””â”€â”€ [groupId]/
â”‚   â”‚       â”œâ”€â”€ page.tsx               # re-export de groups/[groupId]
â”‚   â”‚       â”œâ”€â”€ configuracoes/page.tsx # re-export de groups/[groupId]/settings
â”‚   â”‚       â”œâ”€â”€ pagamentos/page.tsx    # re-export de groups/[groupId]/payments
â”‚   â”‚       â””â”€â”€ credits/page.tsx       # re-export (ainda redireciona internamente)
â”‚   â”‚
â”‚   â”œâ”€â”€ groups/                        # LEGADO â€” servido via redirect 301
â”‚   â”‚   â”œâ”€â”€ new/page.tsx
â”‚   â”‚   â”œâ”€â”€ join/page.tsx
â”‚   â”‚   â””â”€â”€ [groupId]/
â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚       â”œâ”€â”€ settings/page.tsx
â”‚   â”‚       â”œâ”€â”€ payments/page.tsx
â”‚   â”‚       â”œâ”€â”€ credits/page.tsx
â”‚   â”‚       â”œâ”€â”€ events/new/page.tsx
â”‚   â”‚       â””â”€â”€ events/[eventId]/page.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ configuracoes/page.tsx         # CANÃ”NICO PT-BR (re-export de settings)
â”‚   â”œâ”€â”€ settings/page.tsx              # LEGADO â€” servido via redirect 301
â”‚   â”‚
â”‚   â”œâ”€â”€ atletas/
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ [id]/page.tsx
â”‚   â”œâ”€â”€ modalidades/[id]/page.tsx
â”‚   â”œâ”€â”€ financeiro/
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ charges/[chargeId]/page.tsx
â”‚   â”œâ”€â”€ rankings/page.tsx
â”‚   â”œâ”€â”€ frequencia/page.tsx
â”‚   â””â”€â”€ modalidades/page.tsx
â”‚
â”œâ”€â”€ auth/                              # PÃšBLICO
â”‚   â”œâ”€â”€ signin/page.tsx
â”‚   â”œâ”€â”€ signup/page.tsx
â”‚   â””â”€â”€ error/page.tsx
â”‚
â”œâ”€â”€ onboarding/                        # AUTENTICADO, fora do (app)/
â”‚   â”œâ”€â”€ page.tsx                       # â†’ redirect step/1
â”‚   â””â”€â”€ step/[step]/page.tsx
â”‚
â””â”€â”€ events/[eventId]/page.tsx          # PÃšBLICO (preview â†’ redirect se autenticado)
```

---

## Middleware â€” Estado atual

**Arquivo:** [middleware.ts](middleware.ts) Â· 165 linhas

### Regras de proteÃ§Ã£o

```
NÃ£o autenticado + rota nÃ£o pÃºblica
  â†’ /auth/signin?callbackUrl=<path>

NÃ£o autenticado + rota pÃºblica (/auth/*, /events/*)
  â†’ pass-through

Autenticado + rota que nÃ£o precisa de gate (/events/*)
  â†’ requiresOnboardingResolution = false â†’ pass-through imediato

Autenticado + onboarding_completed=false + nÃ£o em /onboarding/* + nÃ£o em /events/*
  â†’ /onboarding/step/1?returnTo=<path>

Autenticado + onboarding_completed=true + em /onboarding/*
  â†’ returnTo ou /dashboard

Autenticado + acessa /auth/*
  â†’ se onboarding incompleto: /onboarding/step/1
  â†’ se completo: callbackUrl ou /dashboard
```

### Cache de onboarding

```
TTL: 60 segundos por userId (Map em memÃ³ria do processo)
Fontes em cascata:
  1. JWT token (onboardingCompleted no payload)  â†’ sem I/O
  2. Cache em memÃ³ria (TTL 60s)                  â†’ sem I/O
  3. Supabase REST direto                         â†’ 1 fetch, resultado cacheado
```

**Nota:** O cache Ã© por processo Node.js â€” em ambientes multi-instÃ¢ncia (serverless), cada instÃ¢ncia tem seu prÃ³prio cache. Comportamento correto: em pior caso, a instÃ¢ncia faz um fetch ao Supabase na primeira request apÃ³s cold start ou TTL expiration.

---

## Testes â€” Estado atual

### E2E (Playwright)

| Arquivo | URLs usadas | Status apÃ³s Fase 6 |
|---|---|---|
| `onboarding-smoke.spec.ts` | `/auth/signup`, `/onboarding/step/1`, `/dashboard` | âœ… CanÃ´nico â€” sem mudanÃ§a necessÃ¡ria |
| `payment-flow.spec.ts` | `/financeiro` | âœ… CanÃ´nico â€” sem mudanÃ§a necessÃ¡ria |
| `rsvp-flow.spec.ts` | `/treinos` (linha 26, 76), `/financeiro` | âš ï¸ Usa URL legada com redirect â€” ver abaixo |

**Detalhe de `rsvp-flow.spec.ts`:**

```typescript
// linha 26 â€” goto funciona (redirect 307 para /eventos?tipo=treino)
await page.goto('/treinos');

// linha 27 â€” PODE FALHAR: h1 provavelmente diz "Eventos" ou "Treinos/Jogos"
await expect(page.locator('h1')).toContainText('Treinos');
```

O `goto('/treinos')` ainda funciona porque o redirect 307 Ã© seguido pelo Playwright. O problema estÃ¡ na asserÃ§Ã£o da linha 27: se o hub `/eventos` usa um `h1` genÃ©rico como "Eventos", o teste falha. **Este Ã© o ajuste pendente que o usuÃ¡rio estÃ¡ executando agora.**

### Unit e Integration

| Arquivo | Escopo | Risco pÃ³s-Fase 6 |
|---|---|---|
| `tests/unit/lib/pix.test.ts` | LÃ³gica PIX | Nenhum â€” sem URLs |
| `tests/unit/lib/error-handler.test.ts` | Handler de erro | Nenhum |
| `tests/unit/lib/group-helpers.test.ts` | Helpers de grupo | Nenhum |
| `tests/unit/api/rsvp-auto-charge.test.ts` | LÃ³gica de cobranÃ§a | Nenhum |
| `tests/integration/api/groups-switch-logic.test.ts` | Troca de grupo | Verificar se usa `/groups/` em asserÃ§Ãµes |
| `tests/integration/api/social-feed-logic.test.ts` | Feed social | Nenhum |

---

## PendÃªncias remanescentes

### Em execuÃ§Ã£o agora

| # | AÃ§Ã£o | Arquivo | Detalhe |
|---|---|---|---|
| âœï¸ | Atualizar testes E2E que usam URLs legadas | `tests/e2e/rsvp-flow.spec.ts` | `goto('/treinos')` + asserÃ§Ã£o de h1; mudar para `/eventos?tipo=treino` e ajustar texto esperado |

### P1 â€” Fazer logo apÃ³s testes

| # | AÃ§Ã£o | Arquivo | Por quÃª |
|---|---|---|---|
| 1 | Verificar asserÃ§Ãµes em `groups-switch-logic.test.ts` | `tests/integration/api/groups-switch-logic.test.ts` | Pode referenciar `/groups/` em expects |
| 2 | Confirmar se `(app)/grupos/[groupId]/credits/page.tsx` redireciona para `/configuracoes?tab=quota` ou ainda para `/groups/[id]/credits` legado | `(app)/grupos/[groupId]/credits/page.tsx` | Rota canÃ´nica de crÃ©ditos ainda incerta |
| 3 | Validar backfill de `onboarding_completed` para usuÃ¡rios existentes no banco | migration/script SQL | `null` no campo nÃ£o ativa o gate (tratado como `undefined`) â€” verificar se Ã© comportamento intencional |

### P2 â€” Estrutural (Fase 5)

| # | AÃ§Ã£o | Impacto |
|---|---|---|
| 1 | Fase 5: decidir entre `users` e `profiles` como tabela canÃ´nica | Auth.ts faz fallback entre as duas â€” ambiguidade em produÃ§Ã£o |
| 2 | Adicionar `onboarding_completed` ao JWT callback em `auth.ts` | Eliminaria o fetch ao Supabase no middleware completamente |
| 3 | Audit de auth nas API routes | `/api/*` estÃ¡ fora do matcher do middleware; cada handler verifica auth manualmente |

---

## ComparaÃ§Ã£o com RAIO-X-ESTRUTURAL.md (diagnÃ³stico original)

| Problema original | Estado 2026-03-11 |
|---|---|
| `middleware.ts` nÃ£o existia | âœ… 165 linhas com auth + onboarding gate + cache em memÃ³ria |
| Dois shells visuais incompatÃ­veis | âœ… Um Ãºnico `AuthenticatedShell` â€” `(dashboard)/` removido |
| "Novo Evento" no sidebar saÃ­a do shell | âœ… Removido do sidebar |
| `groups/[groupId]` era app-within-app | âœ… Integrado em `(app)/groups/`, DashboardHeader removido |
| DirectMode era terceiro layout | âœ… Removido completamente |
| `/treinos` e `/jogos` rotas duplicadas | âœ… Unificadas em `/eventos?tipo=` |
| `/events/[eventId]` auth indefinida | âœ… Preview pÃºblico + redirect se autenticado |
| URLs em inglÃªs | âœ… Fase 6 concluÃ­da â€” `/grupos/`, `/configuracoes`, `/pagamentos` |
| CrÃ©ditos colidindo com financeiro | âœ… "Quota" em `/configuracoes?tab=quota` |
| `users` vs `profiles` coexistem | â¸ï¸ Fase 5 pendente |

---

## PrÃ³ximo passo apÃ³s os testes

Com os testes E2E atualizados e passando, o projeto estarÃ¡ **feature-complete** para as fases planejadas. O trabalho restante Ã© inteiramente Fase 5:

1. **Auditar o campo `onboarding_completed`** â€” confirmar se existe na tabela `users`, se estÃ¡ sendo populado no signup (`api/auth/signup/route.ts`), e se usuÃ¡rios existentes tÃªm o campo.

2. **Mover `onboarding_completed` para o JWT** â€” no callback `jwt` em `auth.ts`, buscar o campo na query do `authorize` e incluir no token. Isso elimina o fetch externo do middleware completamente.

3. **Decidir `users` vs `profiles`** â€” executar o checklist da Parte 13 do plano e consolidar.

---

> **Gerado em:** 2026-03-11
> **Baseado em:** leitura direta de `middleware.ts`, `next.config.ts`, glob completo de `src/app/(app)/**`, `tests/e2e/*.spec.ts`, e comparaÃ§Ã£o com `docs/PLANO-ARQUITETURA-ALVO.md v1.2`


