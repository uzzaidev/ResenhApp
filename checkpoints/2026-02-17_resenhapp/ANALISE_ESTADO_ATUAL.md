# ResenhApp V2.0 — Análise do Estado Atual do Projeto
> Análise completa realizada em 2026-02-17 | Retomada de desenvolvimento

---

## 📊 Resumo Executivo

O **ResenhApp V2.0** é uma plataforma de gestão de grupos esportivos com rede social integrada, sistema de créditos e pagamentos PIX. O projeto está em um estado **híbrido**: código implementado para várias funcionalidades, mas com **8 migrations pendentes** no banco de dados.

### Status Geral

| Aspecto | Status | Observação |
|---------|--------|------------|
| **Código Base** | ✅ 85% completo | Core funcional, features novas implementadas |
| **Banco de Dados** | ⚠️ Migrations pendentes | 8 migrations criadas mas não aplicadas |
| **Testes** | 🔶 Parcial | Unit tests existem, E2E básico |
| **Produção** | ⚠️ Deferred Mode | Funciona com badges "PENDENTE" para features sem banco |
| **Documentação** | ✅ Completa | Checkpoint detalhado de 2026-02-17 |

---

## 🏗️ Arquitetura Atual

### Stack Tecnológico

- **Framework**: Next.js 16.1.1 (App Router)
- **Runtime**: React 19.2.0
- **Linguagem**: TypeScript 5
- **Banco**: Supabase/PostgreSQL (via postgres@3.4.8)
- **Auth**: NextAuth.js v5.0.0-beta.25 ⚠️ (versão beta)
- **State**: Zustand 5.0.8 + React Context
- **Styling**: Tailwind CSS 3.4.1 + shadcn/ui
- **Deploy**: Vercel + Cloudflare

### Estrutura do Projeto

```
peladeiros-main/
├── src/
│   ├── app/              # Next.js App Router (112 arquivos)
│   │   ├── (dashboard)/  # Rotas protegidas
│   │   └── api/         # 54 endpoints API
│   ├── components/      # 110 componentes React
│   ├── lib/             # 29 bibliotecas utilitárias
│   ├── contexts/        # GroupContext, DirectModeContext
│   └── hooks/          # Custom hooks
├── supabase/
│   └── migrations/      # 24 migrations aplicadas + 8 pendentes
└── tests/               # Unit, Integration, E2E
```

---

## ✅ O Que Está Funcionando

### Módulos Completos

1. **AUTH** ✅
   - NextAuth com Credentials Provider
   - Signup/Signin funcionais
   - JWT sessions
   - Middleware de proteção

2. **GROUPS** ✅
   - Criação de grupos
   - Hierarquia Atlética → Pelada
   - Gerenciamento de membros
   - Sistema de convites
   - GroupContext para estado global

3. **EVENTS** ✅
   - Criação e gestão de eventos
   - RSVP com waitlist
   - Sorteio de times (balanceado/aleatório)
   - Live score (registro de ações)
   - Votação de MVP com tiebreaker
   - Eventos recorrentes

4. **ATHLETES** ✅
   - Cadastro de atletas
   - Modalidades por atleta
   - Ratings (1-10) por modalidade
   - Posições configuráveis
   - Filtros e busca

5. **MODALITIES** ✅
   - CRUD de modalidades esportivas
   - Posições padrão por esporte
   - Soft delete

6. **FINANCIAL** ✅
   - Cobranças (charges)
   - Geração de PIX (BR Code EMV)
   - Receiver profiles (chaves PIX)
   - Wallets por grupo
   - Histórico de transações

7. **RANKINGS** ✅
   - Cálculo de performance score
   - Rankings por período (weekly/monthly/yearly/all_time)
   - Estatísticas individuais
   - Frequência de presença

8. **ATTENDANCE** ✅
   - Taxa de frequência (últimos 10 eventos)
   - Badges de desempenho
   - Ranking de presença

9. **NOTIFICATIONS** ✅
   - Notificações in-app
   - Polling de 30 segundos
   - Triggers de banco (charge_created, payment_received)
   - Soft delete

10. **TRAININGS** ✅
    - Treinos recorrentes
    - Geração automática de sessões
    - Consumo de créditos (5 por treino)

11. **CREDITS** ✅ (parcial)
    - Sistema de créditos por grupo
    - Compra de pacotes
    - Cupons promocionais
    - Middleware `withCreditsCheck`
    - ⚠️ **PENDENTE**: Migração para créditos pessoais (user_wallets)

12. **DASHBOARD** ✅
    - Dashboard principal
    - DirectMode (jogadores com 1 grupo)
    - Cards de métricas
    - Próximos eventos
    - Cobranças pendentes

---

## ⚠️ O Que Está Pendente (Migrations)

### 8 Migrations Não Aplicadas

| Migration | Fase | Descrição | Impacto |
|-----------|------|-----------|---------|
| `20260301000010_phase1_group_lifecycle.sql` | Fase 1 | `group_type` ENUM, expiração de grupos | Hierarquia multi-tenant |
| `20260301000011_phase2_user_wallets.sql` | Fase 2 | `user_wallets` (créditos pessoais) | Economia de créditos |
| `20260301000012_phase2_credit_earning_rules.sql` | Fase 2 | Regras de earning, limites diários | Sistema de recompensas |
| `20260301000013_phase3_pix_simplified.sql` | Fase 3 | Status `self_reported`, `denied` | Fluxo PIX simplificado |
| `20260301000014_phase4_social_core.sql` | Fase 4 | Tabelas sociais (posts, reactions, comments) | Módulo social |
| `20260301000015_phase5_onboarding_referrals.sql` | Fase 5 | Referrals, códigos de convite | Growth e onboarding |
| `20260301000016_phase4_social_storage.sql` | Fase 4 | Storage bucket `social-media` | Upload de mídia |
| `20260301000017_phase7_credit_purchase_requests.sql` | Fase 7 | Compra de créditos via PIX | Monetização |

### Deferred Mode

O código detecta automaticamente quando migrations não foram aplicadas:
- Endpoints retornam `{ deferred: true }` quando tabela não existe
- Sidebar mostra badge "PENDENTE" para features sem banco
- Sistema não quebra, apenas degrada funcionalidade

---

## 🔧 Funcionalidades Parcialmente Implementadas

### 1. GAMIFICATION 🔶
- ✅ Schema completo no banco (achievements, badges, milestones, challenges)
- ✅ Trigger `after_insert_event_action_check_achievements`
- ❌ API endpoints não implementados
- ❌ UI de conquistas não existe
- ❌ Integração com créditos pendente

### 2. Módulo Social 🔶
- ✅ Código implementado (Fase 4)
- ⚠️ Migrations pendentes (`000014`, `000016`)
- ❌ Não testado (banco não tem tabelas)

### 3. Onboarding + Referral 🔶
- ✅ Código parcial
- ⚠️ Migration pendente (`000015`)
- ❌ Fluxo completo não testado

### 4. PIX Simplificado 🔶
- ✅ Código implementado
- ⚠️ Migration pendente (`000013`)
- ⚠️ Ainda usa BR Code EMV (deve migrar para chave estática)

### 5. Créditos Pessoais 🔶
- ✅ Código implementado
- ⚠️ Migrations pendentes (`000011`, `000012`)
- ⚠️ Ainda usa `group_wallets` (deve migrar para `user_wallets`)

---

## 🐛 Problemas Conhecidos

### Críticos

1. **NextAuth Beta** ⚠️
   - Versão `5.0.0-beta.25` — API pode mudar
   - Monitorar releases para upgrade

2. **RLS Inefetivo** ⚠️
   - RLS configurado para Supabase Auth
   - App usa NextAuth → `auth.uid()` retorna NULL
   - Segurança está nas API routes (documentado)

3. **Cron Jobs** ✅ (RESOLVIDO na Fase 0)
   - Rotas criadas: `/api/cron/send-reminders`, `/api/cron/calculate-metrics`, `/api/cron/cleanup-notifications`
   - ⚠️ Pendente: Adicionar `CRON_SECRET` no Vercel

### Médios

4. **Debug Endpoint** ✅ (RESOLVIDO)
   - Agora retorna 404 fora de `NODE_ENV=development`

5. **TODOs no Código**
   - `metrics-overview.tsx`: Dados mockados
   - `upcoming-trainings.tsx`: Dados mockados
   - `my-stats/route.ts`: `draws` não calculado

6. **Email/Push Notifications**
   - Estrutura no banco existe
   - Sender não implementado

---

## 📋 Próximos Passos Recomendados

### Fase 0: Estabilização (1-2 dias)

1. ✅ Aplicar migrations pendentes (ordem):
   ```bash
   psql $DATABASE_URL -f supabase/migrations/20260301000010_phase1_group_lifecycle.sql
   psql $DATABASE_URL -f supabase/migrations/20260301000011_phase2_user_wallets.sql
   psql $DATABASE_URL -f supabase/migrations/20260301000012_phase2_credit_earning_rules.sql
   psql $DATABASE_URL -f supabase/migrations/20260301000013_phase3_pix_simplified.sql
   psql $DATABASE_URL -f supabase/migrations/20260301000014_phase4_social_core.sql
   psql $DATABASE_URL -f supabase/migrations/20260301000015_phase5_onboarding_referrals.sql
   psql $DATABASE_URL -f supabase/migrations/20260301000016_phase4_social_storage.sql
   psql $DATABASE_URL -f supabase/migrations/20260301000017_phase7_credit_purchase_requests.sql
   ```

2. ✅ Configurar `CRON_SECRET` no Vercel

3. ✅ Testar endpoints após migrations:
   - `/api/credits/me` → deve retornar `{ balance, deferred: false }`
   - `/api/social/feed` → deve retornar array
   - Criar post → deve incrementar créditos
   - RSVP yes → deve ganhar 3 créditos

### Fase 1: Completar Features Pendentes (1 semana)

1. **Gamificação**
   - Implementar API endpoints de achievements
   - Criar UI de conquistas
   - Integrar com sistema de créditos

2. **Módulo Social**
   - Testar criação de posts
   - Implementar feed com filtros
   - Upload de mídia (storage bucket)

3. **PIX Simplificado**
   - Migrar de BR Code EMV para chave estática
   - Implementar fluxo `self_reported` → `paid`/`denied`
   - UI de "Já paguei" para participantes

4. **Onboarding**
   - Completar fluxo de onboarding
   - Implementar sistema de referral
   - Página de "Como ganhar créditos"

### Fase 2: Melhorias e Testes (1 semana)

1. **Testes**
   - E2E para flows críticos (RSVP, pagamento, social)
   - Testes de integração para APIs novas
   - Coverage de componentes principais

2. **Performance**
   - Otimizar queries de feed social
   - Cache de rankings
   - Paginação em listas grandes

3. **UX**
   - Completar métricas reais no dashboard
   - Melhorar feedback visual de créditos
   - Notificações push (FCM)

---

## 📚 Documentação Disponível

### Checkpoint Completo (2026-02-17)

- ✅ `00_MANIFEST.json` — Metadados do projeto
- ✅ `01_REPO_TREE.txt` — Estrutura de arquivos
- ✅ `02_BUILD_RUNBOOK.md` — Como buildar e rodar
- ✅ `03_DEPENDENCIES.md` — Dependências e versões
- ✅ `04_ARCHITECTURE_FROM_CODE.md` — Arquitetura
- ✅ `05_ROUTES_FROM_CODE.md` — Inventário de rotas
- ✅ `06_UI_COMPONENTS_CATALOG.md` — Catálogo de componentes
- ✅ `07_DATA_ACCESS_MAP.md` — Mapa de acesso a dados
- ✅ `08_DATABASE_SCHEMA_COMPLETE.md` — Schema completo
- ✅ `09_RLS_POLICIES.md` — Políticas RLS
- ✅ `10_AUTH_AND_SESSION.md` — Autenticação
- ✅ `11_GROUP_CONTEXT_FLOW.md` — Fluxo de grupos
- ✅ `12_FINANCIAL_AND_PIX.md` — Financeiro e PIX
- ✅ `13_PERMISSIONS_RBAC.md` — Permissões
- ✅ `14_NOTIFICATIONS.md` — Notificações
- ✅ `15_GAMIFICATION.md` — Gamificação
- ✅ `16_WEBHOOKS_JOBS.md` — Webhooks e jobs
- ✅ `17_TESTS_COVERAGE_MAP.md` — Cobertura de testes
- ✅ `18_TECH_DEBT_FINDINGS.md` — Dívida técnica
- ✅ `19_ERRORS_EDGE_CASES.md` — Erros e edge cases
- ✅ `90_MODULE_DEPENDENCY_MAP.md` — Dependências entre módulos
- ✅ `91_MAIN_FLOWS.md` — Fluxos principais
- ✅ `99_AI_CONTEXT_PACK.md` — Contexto para IA

### Módulos Documentados

- ✅ `modules/AUTH.md`
- ✅ `modules/GROUPS.md`
- ✅ `modules/EVENTS.md`
- ✅ `modules/ATHLETES.md`
- ✅ `modules/FINANCIAL.md`
- ✅ `modules/CREDITS.md`
- ✅ `modules/MODALITIES.md`
- ✅ `modules/RANKINGS.md`
- ✅ `modules/TRAININGS.md`
- ✅ `modules/ATTENDANCE.md`
- ✅ `modules/NOTIFICATIONS.md`
- ✅ `modules/GAMIFICATION.md`
- ✅ `modules/DASHBOARD.md`

### Roadmaps e Análises

- ✅ `DELTA_ANALYSIS.md` — O que existe vs. o que precisa mudar
- ✅ `IMPLEMENTATION_ROADMAP.md` — Plano de implementação
- ✅ `CONCEPT_V2_VISION.md` — Visão conceitual revisada

---

## 🎯 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| **Arquivos TypeScript/TSX** | ~320 |
| **Linhas de Código** | ~50.000 LOC |
| **API Endpoints** | 54 |
| **Componentes React** | 125 |
| **Tabelas do Banco** | 47 |
| **Migrations Aplicadas** | 24 |
| **Migrations Pendentes** | 8 |
| **Funções SQL** | 70 |
| **Triggers** | 22 |
| **Testes** | 21 arquivos |

---

## 🔄 Estado de Implementação por Fase

| Fase | Nome | Código | Banco | Status |
|------|------|--------|-------|--------|
| **0** | Correções Críticas | ✅ | ✅ | CONCLUÍDA |
| **1** | Arquitetura de Grupos | ✅ | ⏳ | Migration pendente |
| **2** | Créditos Pessoais + Earning | ✅ | ⏳ | Migrations pendentes |
| **3** | PIX Simplificado | ✅ | ⏳ | Migration pendente |
| **4** | Módulo Social | ✅ | ⏳ | Migrations pendentes |
| **5** | Onboarding + Referral | 🔶 | ⏳ | Parcial + migration pendente |
| **6** | Gamificação Completa | 🔶 | ✅ | UI pendente |
| **7** | Compra de Créditos | 🔶 | ⏳ | Migration pendente |

---

## 💡 Recomendações Imediatas

1. **Aplicar Migrations** (Prioridade ALTA)
   - Sem as migrations, features novas não funcionam
   - Ordem importa (dependências entre migrations)
   - Testar em ambiente de staging primeiro

2. **Testar Após Migrations**
   - Verificar que badges "PENDENTE" sumiram
   - Testar criação de posts sociais
   - Testar earning de créditos
   - Testar fluxo PIX simplificado

3. **Completar Gamificação**
   - API endpoints são rápidos de implementar
   - UI pode ser simples inicialmente
   - Alto valor para engajamento

4. **Melhorar Testes**
   - E2E para flows críticos
   - Testes de integração para APIs novas
   - Coverage mínimo de 60%

5. **Monitorar NextAuth**
   - Versão beta pode ter breaking changes
   - Planejar upgrade para v5 estável quando lançar

---

## 📞 Pontos de Atenção

### Segurança
- ✅ Segurança nas API routes (não no RLS)
- ✅ NextAuth JWT com HttpOnly cookies
- ⚠️ RLS inefetivo (documentado, não é problema crítico)

### Performance
- ⚠️ Queries de feed social podem ser lentas (implementar paginação)
- ⚠️ Rankings calculados on-demand (usar `leaderboards` quando disponível)
- ✅ Polling de notificações otimizado (30s, pausa em background)

### Escalabilidade
- ✅ Soft delete em todas as tabelas principais
- ✅ Paginação em listagens grandes
- ⚠️ Feed social sem cache (implementar Redis futuramente)

---

## 🎉 Conclusão

O **ResenhApp V2.0** está em um estado **sólido e bem documentado**. O código está ~85% completo, com a maioria das funcionalidades core implementadas. O principal bloqueio é a aplicação das 8 migrations pendentes, que desbloquearão features novas (social, créditos pessoais, PIX simplificado).

**Próximo passo crítico**: Aplicar migrations em ordem e testar funcionalidades.

**Tempo estimado para MVP completo**: 2-3 semanas (aplicar migrations + completar features pendentes + testes).

---

*Documento gerado em 2026-02-17 | Baseado em checkpoint completo do projeto*



