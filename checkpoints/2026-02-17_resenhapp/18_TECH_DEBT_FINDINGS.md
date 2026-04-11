# ResenhApp V2.0 — Dívida Técnica
> FATO (do código) — análise de TODO/FIXME, dependências beta, scripts avulsos
> Atualizado em 2026-02-17 com status pós-implementação das Fases 0-7

## TODOs no Código
| Arquivo | Linha | Conteúdo |
|---------|-------|---------|
| src/lib/analytics.ts | ~33 | TODO - Integrate PostHog analytics |
| src/lib/analytics.ts | ~53 | TODO - Integrate PostHog analytics |
| src/components/dashboard/metrics-overview.tsx | ~41 | TODO - Connect real API in Sprint 2 |
| src/components/dashboard/upcoming-trainings.tsx | ~59 | TODO - Connect real API in Sprint 2 |
| src/app/api/groups/[groupId]/my-stats/route.ts | ~160 | TODO - Calculate draws when logic available |

## Dependências Beta/Instáveis
| Pacote | Versão | Risco |
|--------|--------|-------|
| next-auth | ^5.0.0-beta.25 | API pode mudar antes do release estável |

## Cron Jobs — RESOLVIDO na Fase 0
| Cron | Schedule | Status |
|------|----------|--------|
| /api/cron/send-reminders | Daily 10h | ✅ Criado — `src/app/api/cron/send-reminders/route.ts` |
| /api/cron/calculate-metrics | Daily 2h | ✅ Criado — `src/app/api/cron/calculate-metrics/route.ts` |
| /api/cron/cleanup-notifications | Weekly Sun 3h | ✅ Criado — `src/app/api/cron/cleanup-notifications/route.ts` |
| Auth de cron | — | ✅ `src/lib/cron-auth.ts` — CRON_SECRET via header Authorization |

**Pendente**: Adicionar `CRON_SECRET` ao ambiente de produção no Vercel.

## Scripts SQL Avulsos (não são migrations oficiais)
Localizados em /scripts/ e /supabase/ — aplicados manualmente sem controle de versão:
- adicionar-membro-grupo.sql
- verificar-e-corrigir-profiles.sql
- fix_users_policy_for_direct_connection.sql
- debug_signup.sql
- verify_migrations*.sql
- test-fase-*.sql

## Funcionalidades Declaradas mas Não Implementadas
| Feature | Evidência | Status (atualizado) |
|---------|-----------|---------------------|
| Email delivery | email_queue table existe | ❌ Sender ainda não implementado |
| Push notifications | push_tokens table existe | ❌ FCM/APNS não integrado |
| PostHog Analytics | TODO em analytics.ts | ❌ Ainda não integrado |
| Dashboard métricas reais | TODO em metrics-overview | ❌ Dados mock |
| Upcoming trainings reais | TODO em upcoming-trainings | ❌ Dados mock |
| Draws statistics | TODO em my-stats route | ❌ Não calculado |
| Notificações in-app | notifications.ts criado | ✅ Implementado (best-effort, sem push/email) |
| Conquistas UI/API | Schema existia | 🔶 API criada, UI parcial |

## Novas Dívidas Técnicas (criadas nas Fases 0-7)

| Item | Arquivo | Detalhe |
|------|---------|---------|
| Migrations pendentes no banco | `supabase/migrations/2026030100001*` | 8 migrations criadas mas NÃO aplicadas em produção |
| `CRON_SECRET` no Vercel | `.env.example` | Variável adicionada ao exemplo mas não ao painel Vercel |
| Social storage bucket | `000016_phase4_social_storage.sql` | Bucket `social-media` precisa ser criado via migration |
| Inconsistência MVP: `player_ratings` vs `votes` | `src/app/api/events/[eventId]/ratings/` | Dois sistemas de votação paralelos — limpar antes do social |
| Earning de créditos sem idempotência garantida no banco | `src/lib/credit-earning.ts` | Usa `ON CONFLICT` em `daily_credit_earnings` mas tabela pendente de migration |
| Testes de integração de rotas novas | `tests/integration/` | charge-status, referrals, social-feed cobertos; social APIs novas sem teste |
| UI de denúncia no feed | `src/app/feed/` | API de reports criada, UI de "Denunciar" ainda não implementada |
| Notificações com templates SQL | `src/lib/notifications.ts` | Inserção direta em `notifications` — quando migrations aplicadas, usar função SQL |

## Divergências de Schema
- Migrations anteriores usam BIGSERIAL, mais recentes usam UUID
- Inconsistência em nomenclatura (amount_cents vs amount DECIMAL)
- Tabela `users` (NextAuth) e `profiles` (Supabase Auth) coexistem
- RLS configurado para Supabase Auth mas app usa NextAuth + postgres direto

## Riscos de Segurança

| Risco | Status | Detalhe |
|-------|--------|---------|
| RLS inefetivo (NextAuth ≠ Supabase Auth) | ⚠️ Documentado | `docs/05-authentication/NEXTAUTH_RLS_BOUNDARY.md` criado; segurança está nas API routes |
| Sem middleware.ts centralizado | ⚠️ Em aberto | Cada rota verifica auth manualmente via `requireAuth()` |
| Debug endpoint público | ✅ RESOLVIDO | `/api/debug` agora retorna 404 fora de `NODE_ENV=development` |
| NextAuth em beta | ⚠️ Em aberto | v5 beta — monitorar releases para upgrade |
