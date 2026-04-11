# ResenhApp V2.0 — AI Context Pack
> Resumo executivo e instruções para outra IA trabalhar no projeto
> Gerado em 2026-02-17 | **Atualizado em 2026-02-17 pós-implementação Fases 0-7**

---

## ATENÇÃO — Estado Atual do Projeto

**O código está na frente do banco de dados.**

8 migrations foram criadas mas ainda NÃO foram aplicadas ao Supabase em produção.
O código opera em **deferred mode**: detecta automaticamente se as tabelas existem e, se não, retorna fallback (sem crash). A sidebar exibe badge `PENDENTE` no card de Créditos enquanto `/api/credits/me` retorna `{ deferred: true }`.

**Próximo passo obrigatório**: Aplicar as migrations e testar os 8 pontos listados abaixo.

---

## O que é este projeto?

**ResenhApp V2.0** é uma **rede social esportiva** com gestão de grupos de treino e jogos, monetizada por uma economia interna de créditos. É simultaneamente:
- **Plataforma de gestão**: organizar treinos, peladas, times, presenças, cobranças via PIX
- **Rede social esportiva**: feed de posts, curtidas, comentários, conquistas, rankings
- **Marketplace de créditos**: créditos ganhos por ações sociais, comprados ou obtidos via promoção

**Hierarquia de grupos**:
```
PLATAFORMA
└── ATLÉTICA (tenant, 1.000 créditos para criar)
    └── GRUPO DE MODALIDADE (200 créditos, admin pode ser externo à atlética)
        └── Participantes

OU

GRUPO STANDALONE (sem atlética, 200 créditos para criar)
└── Participantes  ← "pelada do João"
```

---

## Stack Resumida

- **Frontend/Backend**: Next.js 16.1.1 App Router + React 19 + TypeScript 5
- **Banco**: Supabase PostgreSQL (47 tabelas aplicadas + 8 tabelas em migrations pendentes)
- **Auth**: NextAuth.js v5 beta (Credentials + JWT) + @auth/pg-adapter
- **Pagamentos**: PIX via chave estática — admin cadastra chave, participante auto-declara pagamento, admin confirma
- **Deploy**: Vercel + Cloudflare
- **Estado**: Zustand + GroupContext + DirectModeContext
- **Monitoramento**: Sentry (client + server + edge)
- **Testes**: Vitest (unit + integration) + Playwright (E2E)

---

## Arquivos Mais Importantes

### Arquivos originais (fundamentais)
| Arquivo | O que faz |
|---------|-----------|
| `src/lib/auth.ts` | Configuração NextAuth — autenticação central |
| `src/db/client.ts` | Conexão com banco (postgres package direto) |
| `src/contexts/group-context.tsx` | Grupo ativo — estado global crítico (atualizado Fase 1) |
| `src/lib/permissions.ts` | RBAC e hierarquia de grupos (atualizado Fase 1) |
| `src/lib/validations.ts` | Schemas Zod para todas as entidades |
| `src/app/api/events/[eventId]/rsvp/route.ts` | RSVP + auto-charge + earning de créditos |

### Arquivos novos (criados nas Fases 0-7)
| Arquivo | O que faz |
|---------|-----------|
| `src/lib/cron-auth.ts` | Auth de cron jobs via `CRON_SECRET` |
| `src/lib/group-type.ts` | Tipos e helpers para group_type (atletica/modality_group/standalone) |
| `src/lib/group-helpers.ts` | Helpers de grupo atualizados (Fase 1) |
| `src/lib/group-creation-credits.ts` | Verifica/consome créditos ao criar grupo |
| `src/lib/credit-earning.ts` | Lógica de earning — ações sociais → créditos (idempotente + deferred) |
| `src/lib/personal-credits.ts` | Leitura de saldo pessoal (user_wallets) com fallback |
| `src/lib/pix-helpers.ts` | Formatar chave PIX para exibição + validação |
| `src/lib/charge-status.ts` | Normaliza status de cobrança + valida negação |
| `src/lib/referrals.ts` | Código de referral, validação e distribuição de créditos |
| `src/lib/notifications.ts` | Inserção best-effort em tabela notifications |
| `src/lib/validations-charges.ts` | Schemas Zod para cobranças (inclui self_report/deny) |

### Componentes novos
| Arquivo | O que faz |
|---------|-----------|
| `src/components/social/feed-client.tsx` | Feed social com posts, reações, comentários |
| `src/components/social/post-detail-client.tsx` | Detalhe de post com thread de comentários |
| `src/components/credits/credits-page-client.tsx` | Dashboard de carteira pessoal + histórico |
| `src/components/credits/buy-credits-page-client.tsx` | Compra de pacotes de créditos |
| `src/components/financial/pix-payment-card.tsx` | Card PIX: chave copiável + "já paguei" |
| `src/components/payments/charges-data-table.tsx` | Tabela de cobranças com auto-declaração |
| `src/components/layout/sidebar.tsx` | Sidebar com badge PENDENTE para créditos |
| `src/components/onboarding/complete-onboarding-button.tsx` | CTA de onboarding |

---

## Conceitos-Chave

### 1. Grupo Ativo (inalterado)
O usuário pertence a vários grupos. O "grupo ativo" é armazenado em:
- Cookie `currentGroupId` (server-side)
- localStorage (client-side)
- GroupContext (React)
Toda query de dados deve filtrar por `group_id = currentGroup.id`.

### 2. Hierarquia de Grupos (atualizado Fase 1)
```
group_type = 'atletica'         → tenant principal, requer 1.000 créditos
group_type = 'modality_group'   → filho de uma atlética, requer 200 créditos
group_type = 'standalone'       → independente, requer 200 créditos
```
Compatibilidade legado: no banco atual, `athletic` e `pelada` são os valores. `src/lib/group-type.ts` faz a tradução.

### 3. RSVP + Earning de Créditos (atualizado Fase 2)
```
RSVP status=yes → auto-charge (se price>0) + earn_credits(userId, 'rsvp_yes', +3 créditos)
```

### 4. PIX Simplificado (atualizado Fase 3)
```
Admin cadastra chave PIX estática → exibida para participante copiar
Participante paga no banco → POST /api/charges/[id]/self-report → status: self_reported
Admin lista cobranças → confirma (status: paid) ou nega com motivo (status: denied)
```
`src/lib/pix.ts` (BR Code EMV) está mantido mas depreciado. Use `src/lib/pix-helpers.ts` para o novo fluxo.

### 5. Créditos Pessoais (atualizado Fase 2)
```
user_wallets (tabela pendente de migration) → saldo pessoal por usuário
credit_earning_rules → define créditos por ação (post: +10, curtida: +1, etc.)
daily_credit_earnings → controle de limite diário anti-farm
```
`/api/credits/me` retorna `{ balance, deferred: true }` enquanto migrations não aplicadas.
Sidebar mostra badge `PENDENTE` baseado em `deferred: true`.

### 6. Módulo Social (novo — Fase 4)
```
social_posts → posts com tipo, privacidade, grupo vinculado
social_reactions → curtidas por usuário (UNIQUE por post+usuário)
social_comments → comentários com replies
social_reports → denúncias para moderação
```
APIs: `GET/POST /api/social/feed`, `POST /api/social/posts`, `POST /api/social/posts/[id]/react`, etc.

### 7. Auth ≠ Supabase Auth (inalterado — crítico)
O app usa **NextAuth.js**, NÃO Supabase Auth. Consequência:
- `auth.uid()` do RLS = NULL nas queries diretas (RLS inefetivo)
- Segurança está nas API routes via `requireAuth()` + `withPermissionCheck()`
- Documentado em: `docs/05-authentication/NEXTAUTH_RLS_BOUNDARY.md`

### 8. Deferred Mode (novo — conceito central)
Quando uma tabela nova não existe ainda (migration pendente), o código retorna dados neutros ao invés de crashar:
```typescript
// Exemplo em personal-credits.ts
try {
  const wallet = await sql`SELECT balance FROM user_wallets WHERE user_id = ${userId}`;
  return { balance: wallet[0]?.balance ?? 0, deferred: false };
} catch {
  return { balance: 0, deferred: true }; // tabela não existe ainda
}
```

---

## Convenções do Código (inalteradas)

```typescript
// Auth
const user = await requireAuth();

// Permissão
return withPermissionCheck(request, async (user, groupId, permissions) => {
  // handler
}, { requireAdmin: true });

// Validação
const validated = schema.safeParse(body);
if (!validated.success) return NextResponse.json({ error: ... }, { status: 400 });

// Query
const results = await sql`SELECT ... FROM table WHERE group_id = ${groupId}`;

// Earning de créditos (novo)
await earnCredits(user.id, 'post_training_photo', postId);
```

---

## Migrations Pendentes de Aplicação

| Arquivo | O que cria | Fase |
|---------|-----------|------|
| `20260301000010_phase1_group_lifecycle.sql` | `expires_at`, `is_suspended` em groups | 1 |
| `20260301000011_phase2_user_wallets.sql` | Tabela `user_wallets` + trigger auto-create | 2 |
| `20260301000012_phase2_credit_earning_rules.sql` | `credit_earning_rules`, `daily_credit_earnings` | 2 |
| `20260301000013_phase3_pix_simplified.sql` | `self_reported_at`, `denied_at`, `denial_reason` em charges | 3 |
| `20260301000014_phase4_social_core.sql` | `social_posts`, `social_reactions`, `social_comments`, `social_reports` | 4 |
| `20260301000015_phase5_onboarding_referrals.sql` | `referrals`, `referral_code` em profiles | 5 |
| `20260301000016_phase4_social_storage.sql` | Bucket `social-media` no Supabase Storage | 4 |
| `20260301000017_phase7_credit_purchase_requests.sql` | `credit_purchase_requests` | 7 |

---

## Testes a Executar Após Migrations

```bash
# 1. Créditos
curl /api/credits/me → { balance: 0, deferred: false }  ← deferred some

# 2. Social feed
curl /api/social/feed → { posts: [], total: 0 }

# 3. Auto-declaração de pagamento
POST /api/charges/[id]/self-report → { status: "self_reported" }

# 4. Confirmação de pagamento pelo admin
PATCH /api/groups/[gid]/charges/[cid] body={status:"paid"} → 200

# 5. Referral
GET /api/referrals/me → { code: "NOME_XXXX", earnings: 0 }

# 6. RSVP ganha créditos
POST /api/events/[id]/rsvp body={status:"yes"}
GET /api/credits/me → { balance: 3 }  ← +3 por rsvp_yes

# 7. Post no feed ganha créditos
POST /api/social/posts body={...}
GET /api/credits/me → { balance: 13 }  ← +10 por post_training_photo

# 8. Sidebar sem badge
/creditos → sem badge PENDENTE na sidebar
```

---

## Riscos Críticos (atualizados)

| Risco | Severidade | Status | Detalhes |
|-------|-----------|--------|---------|
| Migrations não aplicadas | CRÍTICO | ⏳ Pendente | App funciona em deferred mode mas features não ativas |
| RLS inefetivo | ALTO | Documentado | NextAuth≠Supabase Auth — ver NEXTAUTH_RLS_BOUNDARY.md |
| NextAuth beta | MÉDIO | Em aberto | v5 beta — monitorar releases |
| Crons sem `CRON_SECRET` no Vercel | MÉDIO | ⏳ Pendente | Adicionar variável no painel Vercel |
| Email/Push sem sender | MÉDIO | Em aberto | Tabelas existem, delivery não implementado |
| MVP: player_ratings vs votes | MÉDIO | Em aberto | Dois sistemas paralelos — limpar inconsistência |
| UI de denúncia social | BAIXO | Em aberto | API criada, UI não implementada |

---

## Mapa Feature → Rotas → Endpoints → Tabelas

### Features Originais (mantidas)
| Feature | Página | Endpoint(s) | Tabelas |
|---------|--------|-------------|---------|
| Login | /auth/signin | POST /api/auth/[...nextauth] | users |
| Cadastro | /auth/signup | POST /api/auth/signup | users |
| Dashboard | /dashboard | GET /api/groups | groups, group_members |
| Eventos | /events | GET/POST /api/events | events |
| RSVP | /events/[id] | POST /api/events/[id]/rsvp | event_attendance, charges + **earn credits** |
| Sorteio | /events/[id] | POST /api/events/[id]/draw | teams, team_members |
| Live Score | /events/[id] | POST /api/events/[id]/actions | event_actions → player_stats |
| MVP | /events/[id] | POST /api/events/[id]/ratings | votes + **earn credits** |
| Rankings | /rankings | GET /api/groups/[gid]/rankings | player_stats, event_attendance |
| Treinos | /treinos | GET/POST /api/recurring-trainings | events |
| Atletas | /atletas | GET/POST /api/athletes/[uid]/modalities | athlete_modalities |
| Notificações | (topbar) | GET /api/notifications | notifications |
| Busca | — | GET /api/search | users, events, sport_modalities |

### Features Novas (Fases 0-7)
| Feature | Página | Endpoint(s) | Tabelas | Status |
|---------|--------|-------------|---------|--------|
| Carteira pessoal | /creditos | GET /api/credits/me | user_wallets | ⏳ deferred |
| Histórico créditos | /creditos | GET /api/credits/me/history | credit_transactions | ⏳ deferred |
| Comprar créditos | /credits/buy | POST /api/credits/buy/requests | credit_purchase_requests | ⏳ deferred |
| PIX chave estática | /financeiro | GET /api/charges/[id]/pix | receiver_profiles | ✅ ativo |
| Auto-declarar pagamento | /financeiro | POST /api/charges/[id]/self-report | charges | ⏳ deferred |
| Confirmar/negar pagamento | /financeiro | PATCH /api/groups/[g]/charges/[c] | charges | ⏳ deferred |
| Feed social | /feed | GET /api/social/feed | social_posts | ⏳ deferred |
| Criar post | /feed | POST /api/social/posts | social_posts | ⏳ deferred |
| Reagir a post | /feed/[id] | POST /api/social/posts/[id]/react | social_reactions | ⏳ deferred |
| Comentar | /feed/[id] | POST /api/social/posts/[id]/comments | social_comments | ⏳ deferred |
| Onboarding | /onboarding | POST /api/onboarding | profiles | ⏳ deferred |
| Referral | — | GET /api/referrals/me | referrals, profiles | ⏳ deferred |
| Conquistas | /perfil | GET /api/users/[id]/achievements | user_achievements | ✅ ativo |
| Cron lembretes | (cron) | GET /api/cron/send-reminders | events, notifications | ✅ ativo |
| Cron métricas | (cron) | GET /api/cron/calculate-metrics | — | ✅ ativo |
| Cron limpeza | (cron) | GET /api/cron/cleanup-notifications | notifications | ✅ ativo |

---

## Perguntas Abertas Restantes

1. `CRON_SECRET` foi adicionado ao Vercel dashboard em produção?
2. O banco em produção está na versão das 24 migrations aplicadas (ou divergiu)?
3. Email delivery: qual provider usar? (Resend, SendGrid, AWS SES)
4. Push notifications: FCM configurado?
5. Inconsistência MVP `player_ratings` vs `votes` — qual tabela manter?
6. Social feed: moderar conteúdo automaticamente ou apenas por denúncia?
