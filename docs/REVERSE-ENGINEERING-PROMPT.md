# PROMPT — ENGENHARIA REVERSA DO APP "RESENHAPP V2.0" (peladeiros)
> Data-alvo do checkpoint: 17/02/2026 (America/Sao_Paulo)
> Gerado a partir de análise real do repositório.

---

Você é um analista de engenharia de software + arquiteto, especialista em "reverse engineering" de aplicações a partir do código-fonte e backups de banco de dados.

**Objetivo:** Gerar um CHECKPOINT de documentação do dia **17/02/2026** (America/Sao_Paulo) do app **"ResenhApp V2.0"** (anteriormente chamado "Peladeiros"), baseado EXCLUSIVAMENTE no repositório atual + backups do Supabase disponíveis na pasta `/backups/`.

**IMPORTANTE:** A documentação existente em `/docs/` pode estar **DESATUALIZADA**. Use o CÓDIGO e os BACKUPS como fonte de verdade. Qualquer doc antiga deve ser marcada como **"LEGADO/possivelmente desatualizado"**.

---

## CONTEXTO TÉCNICO CONFIRMADO (do projeto)

### Stack Principal
- **Framework:** Next.js 16.1.1 (App Router), React 19.2.0, TypeScript 5
- **Banco de dados:** Supabase (PostgreSQL) — client via `postgres` package (v3.4.8)
- **Autenticação:** NextAuth.js v5.0.0-beta.25 com `@auth/pg-adapter` (NÃO usa Supabase Auth direto)
- **Estilização:** Tailwind CSS 3.4.1 + shadcn/ui (Radix UI)
- **Estado global:** Zustand 5.0.8 + React Context (GroupContext, DirectModeContext)
- **Pagamentos:** PIX (implementação customizada em `src/lib/pix.ts`)
- **Observabilidade:** Sentry 10.36.0 (client + server + edge)
- **Testes:** Vitest 4 (unit/integration) + Playwright 1.58 (E2E)
- **Deploy:** Vercel + Cloudflare

### Padrões de Roteamento (App Router confirmado)
- Existe `src/app/` com `layout.tsx` e `page.tsx` na raiz
- **NÃO existe** `src/pages/` (roteamento legado não está presente)
- Route group protegido: `src/app/(dashboard)/` com layout próprio
- Rotas: `page.tsx` (páginas), `layout.tsx` (layouts), `route.ts` (API Routes)
- Rotas dinâmicas: `[id]`, `[eventId]`, `[groupId]`
- Exemplos reais de rotas encontradas:
  - Página: `src/app/(dashboard)/atletas/[id]/page.tsx`
  - API: `src/app/api/events/[eventId]/rsvp/route.ts`
  - API: `src/app/api/groups/[groupId]/route.ts`

### Versões (confirmar em package.json)
- `"next": "16.1.1"` — App Router padrão
- `"react": "^19.2.0"`, `"typescript": "^5"`

---

## MÓDULOS FUNCIONAIS IDENTIFICADOS (confirmar e detalhar)

Com base na estrutura do repositório, os seguintes módulos foram identificados. Para cada um, aprofundar a análise:

| Módulo | Pasta de Páginas | Pasta de API | Componentes |
|--------|-----------------|--------------|-------------|
| **Groups** | `src/app/groups/` + `(dashboard)` | `src/app/api/groups/` | `src/components/groups/` |
| **Events/Jogos** | `src/app/(dashboard)/jogos/` | `src/app/api/events/` | `src/components/events/` |
| **Athletes/Atletas** | `src/app/(dashboard)/atletas/` | `src/app/api/athletes/` | `src/components/athletes/` |
| **Financial/Financeiro** | `src/app/(dashboard)/financeiro/` | `src/app/api/charges/` | `src/components/financial/`, `src/components/payments/` |
| **Credits** | *(via financeiro)* | `src/app/api/credits/` | `src/components/credits/` |
| **Modalities/Modalidades** | `src/app/(dashboard)/modalidades/` | `src/app/api/modalities/` | `src/components/modalities/` |
| **Rankings** | `src/app/(dashboard)/rankings/` | *(descobrir)* | *(descobrir)* |
| **Trainings/Treinos** | `src/app/(dashboard)/treinos/` | `src/app/api/recurring-trainings/` | `src/components/trainings/` |
| **Attendance/Frequência** | `src/app/(dashboard)/frequencia/` | *(descobrir)* | *(descobrir)* |
| **Notifications** | *(descobrir)* | `src/app/api/notifications/` | `src/components/notifications/` |
| **Dashboard** | `src/app/(dashboard)/dashboard/` | *(descobrir)* | `src/components/dashboard/` |
| **Auth** | `src/app/auth/` | `src/app/api/auth/` | *(descobrir)* |

Padrão esperado por módulo:
- Páginas: `src/app/(dashboard)/[modulo]/page.tsx`
- API Routes: `src/app/api/[modulo]/route.ts` (e sub-rotas)
- Componentes: `src/components/[modulo]/`
- Hooks: `src/hooks/use[Modulo].ts`

---

## BANCO DE DADOS (FUNDAMENTAL)

### Backups disponíveis em `/backups/`:
- `schema.sql` (791KB) — dump completo do schema atual ← **FONTE PRINCIPAL**
- `data.sql` (45KB) — export de dados (amostra/seed)
- `roles.sql` (1.7KB) — roles do PostgreSQL
- `peladeiros_full_20251030_182424.sql` — backup completo legado (out/2025)
- `peladeiros_structure_20251030_182424.sql` — schema legado
- `peladeiros_data_20251030_182424.sql` — dados legado

### Migrations em `/supabase/migrations/` (24 arquivos):
Analise TODOS em ordem cronológica. Prefixos de data indicam a ordem de aplicação.

**VOCÊ DEVE ANALISAR TODO** o conteúdo de `backups/schema.sql` (791KB) e confrontar com as migrations para entender:
- Schema completo: tabelas, colunas, tipos, constraints, FKs, indexes
- RLS Policies (Row Level Security): por tabela, expressões USING/WITH CHECK
- Functions/Procedures (RPC), Triggers, Views
- Storage buckets e suas policies
- Qualquer extensão ou configuração que afete comportamento

### Grupos de tabelas conhecidas (confirmar e expandir via backups):
- **Core:** profiles, groups, group_members, events, event_attendance, teams, team_members
- **Financial:** wallets, charges, charge_splits, transactions, pix_payments, receiver_profiles
- **Notifications:** notifications, notification_templates, push_tokens, email_queue
- **Analytics:** player_stats, group_stats (via migration `20260218000001_analytics.sql`)
- **Gamification:** achievements, badges, leaderboards (via `20260225000001_gamification.sql`)
- **Modalities:** modalities, athlete_modalities, positions (via `20260227000001` e `20260227000002`)
- **Trainings:** recurring_trainings (via `20260227000003`)
- **Advanced:** game_convocations, checkin_qrcodes, saved_tactics, promo_coupons, hierarchy + credits

---

## AUTENTICAÇÃO E CONTEXTO DE GRUPO (FUNDAMENTAL)

### Autenticação: NextAuth.js v5 (NÃO Supabase Auth)
- Configuração principal: `src/lib/auth.ts`
- Helpers: `src/lib/auth-helpers.ts`
- Adapter: `@auth/pg-adapter` (conecta NextAuth ao PostgreSQL/Supabase)
- Tipos estendidos: `src/types/next-auth.d.ts`
- Páginas: `src/app/auth/signin/`, `src/app/auth/signup/`, `src/app/auth/error/`
- API route: `src/app/api/auth/`
- Middleware: verificar se existe `middleware.ts` na raiz

### Contexto de Grupo (Multi-group)
- O app suporta múltiplos grupos por usuário
- `GroupContext` em `src/contexts/group-context.tsx` — gerencia o grupo ativo
- `DirectModeContext` em `src/contexts/direct-mode-context.tsx` — modo simplificado (1 grupo)
- `Group Switcher` em `src/components/layout/group-switcher.tsx` — UI para troca de grupo
- API route: `src/app/api/groups/switch/` — troca de grupo ativo

**Rastrear o "caminho do grupo" ponta-a-ponta:**
UI (GroupSwitcher) → API (`/api/groups/switch`) → BD → cookie/session/header → propagação para queries

---

## MISSÃO (o que você deve gerar)

Você vai produzir documentação completa **"como o sistema realmente funciona"**, para que outra IA consiga sugerir melhorias com contexto 100% confiável.

### Regras de ouro:
- **Não invente nada.** Se não achar no código/backup, escreva `NÃO ENCONTRADO`.
- Tudo deve ser evidenciado com: **caminho do arquivo + trecho/descrição** do que foi observado.
- Preferir **precisão e rastreabilidade** (auditoria) a textos bonitos.
- Separar claramente: **`FATO (do código)`** vs **`INFERÊNCIA (provável)`**.

---

## ETAPAS OBRIGATÓRIAS (não pular)

---

### PASSADA 1 — INVENTÁRIO (rápida e completa)

#### 1) Varredura do repositório
- Gere árvore de diretórios ignorando: `node_modules`, `.next`, `dist`, `build`, `coverage`, `.git`.
- Identifique pastas-chave: `src/app`, `src/components`, `src/hooks`, `src/lib`, `src/types`, `src/contexts`, `src/db`, `supabase/`, `backups/`, `scripts/`, `docs/`, `tests/`.
- Leia e resuma (com evidências): `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `vercel.json`, `sentry.*.config.ts`.
- Liste scripts disponíveis (dev/build/test/lint/etc.).
- Identifique arquivos `.env*` (apenas nomes, nunca conteúdo).

#### 2) Inventário de rotas (App Router)
Para cada `src/app/**/page.tsx`:
- Path final (incluindo params dinâmicos)
- Objetivo da tela (inferir pelo código e nome)
- Se é Server Component ou Client Component (`"use client"`)
- Cadeia de layouts aplicados (`layout.tsx` ascendentes)
- Guardas/middlewares de autenticação e autorização (onde implementados)
- Links e transições principais (busca por `Link`, `router.push`, menus em sidebar/topbar)

Gere um mapa de navegação visual.

#### 3) Inventário de endpoints (API Routes)
Para cada `src/app/api/**/route.ts`:
- Métodos implementados (GET/POST/PUT/PATCH/DELETE)
- Path final (com params)
- Entradas: query params, body (schema Zod se existir), headers, cookies
- Saídas: status HTTP + shape do response
- Validações (Zod schemas em `src/lib/validations.ts`, `validations-charges.ts`, `validations-params.ts`)
- Autenticação/autorização (como valida sessão NextAuth)
- Verificação de grupo ativo (como obtém/valida o grupo do usuário)
- Tabelas/recursos afetados no banco e side effects
- Rate limiting (verificar `src/lib/rate-limit.ts`)
- Credits middleware (verificar `src/lib/credits-middleware.ts`)

---

### PASSADA 2 — PROFUNDA (mapeamento comportamental)

#### 4) Mapear acesso ao banco de dados (código)
Descubra todos os pontos de uso via client em `src/db/client.ts`:
- `sql\`...\`` (queries diretas com o package `postgres`)
- Padrão de autenticação nas queries (como o user/group é filtrado)
- `supabase.storage.*` (se houver referências diretas ao Supabase Storage)

Para cada acesso:
- Arquivo + função/handler
- Operação (SELECT/INSERT/UPDATE/DELETE)
- Tabela afetada
- Filtros aplicados (especialmente `group_id`, `user_id`, `created_by`)
- Paginação/ordenação
- Tratamento de erro

Gere DOIS catálogos:
- **A)** Por TELA/ROTA (`page.tsx` ou `route.ts` → queries/mutations)
- **B)** Por TABELA (tabela → arquivos que a acessam)

#### 5) Banco de dados: backups + migrations (prioridade máxima)
Leia COMPLETAMENTE:
- `backups/schema.sql` (791KB) — fonte primária
- `backups/roles.sql`
- `backups/data.sql` (amostra de dados)
- Todos os 24 arquivos em `supabase/migrations/`

Extraia e documente:
- **Schema completo:** tabelas, colunas (nome, tipo, nullable, default), constraints, FKs, indexes únicos e compostos
- **RLS Policies:** policies por tabela (USING/WITH CHECK) com **tradução para regra em português**
- **Functions/Procedures (RPC):** assinatura, lógica, tabelas afetadas
- **Triggers:** quando disparam, o que fazem
- **Views / Materialized Views:** se existirem
- **Storage buckets:** nomes, configurações, policies (verificar `supabase/setup_storage_and_realtime.sql`)
- **Realtime:** tabelas com Realtime habilitado (verificar `setup_storage_and_realtime.sql`)
- **Extensões PostgreSQL** ativas

Compare `migrations/` vs `backups/schema.sql`:
- O que está no backup mas não nas migrations (scripts manuais?)
- O que está nas migrations mas pode estar divergente no backup
- Marque divergências claramente

#### 6) Multi-group / contexto de grupo ativo
Descubra como o grupo ativo é definido e propagado:
- Como o grupo ativo é armazenado: cookie? session NextAuth? header? Context?
- `GroupContext` (`src/contexts/group-context.tsx`): estado, actions, como é inicializado
- `DirectModeContext` (`src/contexts/direct-mode-context.tsx`): quando ativa, como muda comportamento
- Como a API routes obtém o grupo ativo (cookie? session? param?)
- Como as queries no banco filtram por grupo (`group_id`)

Descreva o "caminho do grupo" ponta-a-ponta:
```
UI (GroupSwitcher) → API /api/groups/switch → BD → cookie/session → GroupContext → queries com group_id
```

Liste invariantes:
- Toda query que acessa dados de grupo tem filtro por `group_id`?
- Como prevenir cross-group data leakage?

#### 7) Sistema Financeiro e PIX (módulo crítico)
Aprofundar especificamente o módulo financeiro:

**PIX:**
- `src/lib/pix.ts` — implementação do gerador de PIX (BR Code / QR Code)
- `src/lib/pix-helpers.ts` — helpers auxiliares
- `src/app/api/charges/` — endpoints de cobrança
- `backups/schema.sql` → tabelas: `charges`, `charge_splits`, `pix_payments`, `receiver_profiles`
- Fluxo completo: criação de evento com preço → geração de cobrança → geração de PIX → confirmação

**Créditos:**
- `src/lib/credits.ts` — lógica de créditos
- `src/lib/credits-middleware.ts` — validação de créditos em endpoints
- `src/app/api/credits/` — endpoints
- `src/components/credits/` — componentes de UI
- Tabela `hierarchy_and_credits` (migration `20260227000008`)

**Carteiras:**
- Tabela `wallets` — vincular a quem (group? user?)

#### 8) Permissões e RBAC (controle de acesso)
Analisar `src/lib/permissions.ts` e `src/lib/permissions-middleware.ts`:
- Quais roles existem? (admin, member, organizer, etc.)
- Como as permissões são verificadas nas API routes?
- Relação com `group_members.role` no banco

#### 9) Notificações e Gamificação
**Notificações:**
- `src/hooks/use-notifications.ts`
- `src/app/api/notifications/` — endpoints
- `src/components/notifications/`
- Migrations: `20260211000001_notifications.sql`
- Como são disparadas (triggers SQL? chamadas diretas da API?)

**Gamificação:**
- Migration `20260225000001_gamification.sql` — achievements, badges, leaderboards
- Como são calculados/atualizados os pontos?
- Integração com eventos/jogos

#### 10) Observabilidade, testes e dívida técnica
**Observabilidade:**
- Sentry: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Logger: `src/lib/logger.ts` (Pino) — onde é usado?
- Analytics: `src/lib/analytics.ts` — o que rastreia?
- Error handler: `src/lib/error-handler.ts` — como padroniza erros?

**Testes existentes (mapear cobertura):**
- `tests/unit/lib/pix.test.ts`
- `tests/unit/lib/error-handler.test.ts`
- `tests/unit/lib/group-helpers.test.ts`
- `tests/unit/contexts/group-context.test.tsx`
- `tests/unit/api/rsvp-auto-charge.test.ts`
- `tests/integration/api/groups-switch-logic.test.ts`
- `tests/e2e/payment-flow.spec.ts`
- `tests/e2e/rsvp-flow.spec.ts`
- `tests/components/layout/group-switcher.test.tsx`

**Dívida técnica:**
- Buscar `TODO`, `FIXME`, `HACK`, `XXX` em todo o código
- Arquivos muito grandes (>300 linhas)
- Arquivos deprecated (pasta `docs/deprecated/`)
- Dependências com versões beta (ex: NextAuth v5 beta)
- Scripts SQL avulsos em `/scripts/` e `/supabase/` que não viraram migrations

#### 11) Checklist por módulo
Para CADA módulo detectado, produzir seção própria com:
- [ ] Estrutura de rotas (pages + API routes)
- [ ] Componentes principais e hierarquia
- [ ] Hooks + estado (Zustand/Context/etc.)
- [ ] Schema do banco que o módulo usa (tabelas + policies RLS)
- [ ] Validações (Zod schemas)
- [ ] Integrações com outros módulos
- [ ] Fluxos de usuário principais (passo a passo)
- [ ] Casos de erro / edge cases
- [ ] Riscos de segurança (filtro de grupo, permissões)

---

## FORMATO DE SAÍDA (CHECKPOINT)

Crie uma pasta:
```
/checkpoints/2026-02-17_resenhapp/
```

### Arquivos obrigatórios — Geral:

| Arquivo | Conteúdo |
|---------|----------|
| `00_MANIFEST.json` | Data/hora, commit hash, versões do stack, lista de todos os arquivos gerados |
| `01_REPO_TREE.txt` | Árvore completa do repositório (sem node_modules/.next/etc.) |
| `02_BUILD_RUNBOOK.md` | Como rodar localmente: pré-requisitos, variáveis de ambiente, seeds, scripts |
| `03_DEPENDENCIES.md` | Todas as dependências com versão, propósito e notas (ex: "NextAuth em beta") |
| `04_ARCHITECTURE_FROM_CODE.md` | Arquitetura geral com diagrama Mermaid |
| `05_ROUTES_FROM_CODE.md` | Tabela completa de rotas (pages + API routes) |
| `06_UI_COMPONENTS_CATALOG.md` | Catálogo de componentes com hierarquia e responsabilidades |
| `07_DATA_ACCESS_MAP.md` | Mapa de acesso ao banco: por rota e por tabela |
| `08_DATABASE_SCHEMA_COMPLETE.md` | Schema completo extraído do backup + migrations (tabelas, colunas, tipos, FKs, indexes) |
| `09_RLS_POLICIES.md` | Todas as policies RLS com tradução para regra humana em PT-BR |
| `10_AUTH_AND_SESSION.md` | Fluxo NextAuth v5 ponta-a-ponta: signin, signup, sessão, adapter, tipos |
| `11_GROUP_CONTEXT_FLOW.md` | Como o grupo ativo é gerenciado e propagado + invariantes |
| `12_FINANCIAL_AND_PIX.md` | Sistema financeiro completo: cobranças, PIX, wallets, créditos |
| `13_PERMISSIONS_RBAC.md` | Papéis, permissões, middleware de autorização |
| `14_NOTIFICATIONS.md` | Sistema de notificações: tipos, triggers, delivery |
| `15_GAMIFICATION.md` | Achievements, badges, leaderboards: regras e cálculos |
| `16_WEBHOOKS_JOBS.md` | Webhooks, jobs agendados, crons (se existirem) |
| `17_TESTS_COVERAGE_MAP.md` | Mapa de testes: cobertura por módulo + lacunas identificadas |
| `18_TECH_DEBT_FINDINGS.md` | TODOs, FIXMEs, arquivos grandes, deps beta, scripts avulsos |
| `19_ERRORS_EDGE_CASES.md` | Casos de erro documentados, como são tratados, códigos retornados |
| `90_MODULE_DEPENDENCY_MAP.md` | Mapa de dependências entre módulos |
| `91_MAIN_FLOWS.md` | Fluxogramas Mermaid dos processos principais |
| `99_AI_CONTEXT_PACK.md` | Resumo executivo + instruções para outra IA trabalhar no projeto |

### Arquivos por módulo (um por módulo encontrado):
```
/checkpoints/2026-02-17_resenhapp/modules/
  GROUPS.md
  EVENTS.md
  ATHLETES.md
  FINANCIAL.md
  CREDITS.md
  MODALITIES.md
  RANKINGS.md
  TRAININGS.md
  ATTENDANCE.md
  NOTIFICATIONS.md
  GAMIFICATION.md
  DASHBOARD.md
  AUTH.md
```

---

## PADRÕES DE DOCUMENTAÇÃO

- **Diagramas:** Mermaid dentro do Markdown (arquitetura, auth, group flow, fluxo principal de evento)
- **Fluxogramas:** Mermaid flowchart ou sequenceDiagram
- **Para cada afirmação importante:** cite evidência — `src/lib/pix.ts:42` ou `backups/schema.sql: tabela charges`
- **Sugestões:** colocar em seção `## Hipóteses/Melhorias (INFERÊNCIA)` separada

---

## REQUISITOS DE QUALIDADE (críticos)

- **Cobertura completa:** rotas, endpoints, queries, schema, RLS, auth, group context, PIX, créditos.
- **Nada de achismo:** se não encontrou, escreva `NÃO ENCONTRADO`.
- **Ao final do `99_AI_CONTEXT_PACK.md`**, produza obrigatoriamente:
  1. **Lista de "Perguntas em aberto"** — o que só dá pra confirmar rodando o app
  2. **Lista de "Riscos críticos"** — autenticação, filtro de grupo, dados sensíveis, PIX, side effects
  3. **"Mapa Feature → Rotas → Endpoints → Tabelas"** — tabela cruzada completa

---

## ORDEM DE EXECUÇÃO RECOMENDADA

```
1. Leia package.json, tsconfig.json, next.config.ts → arquivo 03_DEPENDENCIES.md + 02_BUILD_RUNBOOK.md
2. Gere árvore de diretórios → arquivo 01_REPO_TREE.txt
3. Analise TODOS os 24 arquivos de migrations + backups/schema.sql (791KB) → arquivo 08_DATABASE_SCHEMA_COMPLETE.md + 09_RLS_POLICIES.md
4. Inventarie todas as pages (page.tsx) → arquivo 05_ROUTES_FROM_CODE.md (parte 1)
5. Inventarie todas as API routes (route.ts) → arquivo 05_ROUTES_FROM_CODE.md (parte 2)
6. Analise src/lib/auth.ts + auth-helpers.ts + types/next-auth.d.ts → arquivo 10_AUTH_AND_SESSION.md
7. Analise src/contexts/ → arquivo 11_GROUP_CONTEXT_FLOW.md
8. Analise src/lib/pix.ts + pix-helpers.ts + credits.ts + api/charges/ + api/credits/ → arquivo 12_FINANCIAL_AND_PIX.md
9. Analise src/lib/permissions.ts + permissions-middleware.ts → arquivo 13_PERMISSIONS_RBAC.md
10. Analise src/components/ (todos) → arquivo 06_UI_COMPONENTS_CATALOG.md
11. Rastreie todos os acessos ao banco (sql`` queries) → arquivo 07_DATA_ACCESS_MAP.md
12. Analise todos os módulos → pasta modules/*.md
13. Analise tests/ → arquivo 17_TESTS_COVERAGE_MAP.md
14. Busque TODO/FIXME/HACK + avalie dívida técnica → arquivo 18_TECH_DEBT_FINDINGS.md
15. Construa diagramas Mermaid → arquivos 04_ARCHITECTURE_FROM_CODE.md + 91_MAIN_FLOWS.md
16. Gere 99_AI_CONTEXT_PACK.md como resumo final
17. Gere 00_MANIFEST.json com metadados de tudo
```

---

## INFORMAÇÕES ADICIONAIS DO PROJETO

- **Nome do app:** ResenhApp V2.0 (rebrand de "Peladeiros")
- **Domínio:** resenhapp.uzzai.com.br
- **Package manager:** pnpm 10.18.1
- **Commit mais recente:** `7e6e15c` — backup: include roles dump
- **Branch:** main
- **Status do projeto:** Em desenvolvimento (~80% completo, Sprint 7 em andamento)
- **Pasta de docs existente (pode estar desatualizada):** `/docs/` (100+ arquivos MD)
- **Pasta de scripts SQL avulsos:** `/scripts/` e `/supabase/` (não são migrations oficiais)
- **Arquivos Sentry:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- **220 arquivos TypeScript/TSX** em `src/`, ~35.545 linhas de código
- **50+ endpoints de API** em `src/app/api/`
- **105 componentes React** em `src/components/`
- **24 migrations SQL** em `supabase/migrations/`
- **13 arquivos de teste** em `tests/` (unit + integration + E2E)

---

*Prompt gerado em 17/02/2026 por análise automatizada do repositório peladeiros-main.*
*Baseado no template de engenharia reversa do projeto UzzOps.*
