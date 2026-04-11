# ResenhApp V2.0 — Políticas RLS (Row Level Security)

> FATO (do código) — extraído de backups/schema.sql e supabase/migrations/20260127000004_rls_policies.sql

---

As políticas RLS controlam quais rows cada usuário pode SELECT/INSERT/UPDATE/DELETE. São aplicadas automaticamente pelo PostgreSQL antes de retornar dados.

---

## Funções Helper de RLS

Funções criadas no schema `public` para simplificar as expressões das políticas:

| Função | Retorno | Implementação |
|--------|---------|---------------|
| `is_group_owner(group_id BIGINT)` | BOOLEAN | `EXISTS (SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = auth.uid() AND role = 'owner' AND is_active = true)` |
| `is_group_admin(group_id BIGINT)` | BOOLEAN | `EXISTS (SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = auth.uid() AND role IN ('owner','admin') AND is_active = true)` |
| `is_group_member(group_id BIGINT)` | BOOLEAN | `EXISTS (SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = auth.uid() AND is_active = true)` |
| `can_create_groups()` | BOOLEAN | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (can_create_groups = true OR platform_role IN ('organizer','admin','super_admin')))` |
| `has_platform_access()` | BOOLEAN | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_role IN ('admin','super_admin'))` |
| `has_group_permission(group_id BIGINT, permission TEXT)` | BOOLEAN | `EXISTS (SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = auth.uid() AND is_active = true AND (permissions->$2)::boolean = true)` |

---

## Políticas por Tabela

### users / profiles

#### `users`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `users_select_own` | SELECT | `auth.uid() = id` | Usuário vê apenas o próprio registro |
| `users_update_own` | UPDATE | `auth.uid() = id` | Usuário atualiza apenas os próprios dados |
| `admins_select_all_users` | SELECT | `has_platform_access()` | Admins de plataforma veem todos os usuários |

#### `profiles`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `profiles_select_own` | SELECT | `auth.uid() = id` | Usuário vê o próprio perfil sempre |
| `profiles_select_public` | SELECT | `(privacy_settings->>'isPublic')::boolean = true` | Perfis marcados como públicos são visíveis para todos autenticados |
| `profiles_update_own` | UPDATE | `auth.uid() = id AND deleted_at IS NULL` | Usuário edita apenas o próprio perfil (e não deletado) |
| `profiles_insert_own` | INSERT | `auth.uid() = id` | Usuário cria apenas o próprio perfil |
| `admins_select_all_profiles` | SELECT | `has_platform_access()` | Admins de plataforma veem todos os perfis |
| `admins_update_any_profile` | UPDATE | `has_platform_access()` | Admins podem editar qualquer perfil |

---

### groups

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `groups_select_public` | SELECT | `privacy = 'public' AND deleted_at IS NULL` | Grupos públicos são visíveis para qualquer autenticado |
| `groups_select_member` | SELECT | `is_group_member(id) AND deleted_at IS NULL` | Membros veem o próprio grupo (mesmo que privado) |
| `groups_insert_organizer` | INSERT | `can_create_groups()` | Somente organizadores/admins criam grupos |
| `groups_update_admin` | UPDATE | `is_group_admin(id) AND deleted_at IS NULL` | Somente admins e owners editam o grupo |
| `groups_delete_owner` | DELETE | `is_group_owner(id)` | Somente o owner pode deletar (soft delete) |
| `admins_select_all_groups` | SELECT | `has_platform_access()` | Admins de plataforma veem todos os grupos |
| `admins_update_any_group` | UPDATE | `has_platform_access()` | Admins de plataforma editam qualquer grupo |

---

### group_members

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `members_select_group_roster` | SELECT | `is_group_member(group_id)` | Membros veem lista completa de outros membros |
| `members_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê sua própria participação em qualquer grupo |
| `admins_insert_members` | INSERT | `is_group_admin(group_id)` | Admins adicionam novos membros ao grupo |
| `admins_update_members` | UPDATE | `is_group_admin(group_id)` | Admins atualizam dados de membros (role, rating, etc.) |
| `admins_delete_members` | DELETE | `is_group_admin(group_id)` | Admins removem membros do grupo |
| `members_leave_own` | DELETE | `user_id = auth.uid()` | Membro pode sair do próprio grupo |

---

### invites

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `invites_select_member` | SELECT | `is_group_member(group_id)` | Membros veem convites do grupo |
| `invites_select_by_code` | SELECT | `is_active = true AND (expires_at IS NULL OR expires_at > now())` | Qualquer autenticado acessa convite pelo código |
| `invites_insert_admin` | INSERT | `is_group_admin(group_id)` | Admins criam convites |
| `invites_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins desativam/editam convites |
| `invites_delete_admin` | DELETE | `is_group_admin(group_id)` | Admins removem convites |

---

### venues

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `venues_select_member` | SELECT | `is_group_member(group_id)` | Membros veem locais do grupo |
| `venues_insert_admin` | INSERT | `is_group_admin(group_id)` | Admins adicionam locais |
| `venues_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins editam locais |
| `venues_delete_admin` | DELETE | `is_group_admin(group_id)` | Admins removem locais |

---

### events

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `events_select_member` | SELECT | `is_group_member(group_id) AND deleted_at IS NULL` | Membros veem eventos do grupo |
| `events_select_public` | SELECT | `privacy = 'public' AND deleted_at IS NULL` | Eventos públicos visíveis para autenticados |
| `events_insert_admin` | INSERT | `is_group_admin(group_id)` | Somente admins criam eventos |
| `events_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins editam qualquer campo do evento |
| `events_update_creator` | UPDATE | `created_by = auth.uid() AND status = 'scheduled'` | Criador pode editar enquanto status for 'scheduled' |
| `events_delete_admin` | DELETE | `is_group_admin(group_id)` | Admins cancelam/deletam eventos |

---

### event_attendance

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `attendance_select_member` | SELECT | `is_group_member(group_id)` | Membros veem presenças de todos no evento |
| `attendance_insert_authenticated` | INSERT | `auth.uid() IS NOT NULL AND auth.uid() = user_id` | Usuário autenticado confirma a própria presença |
| `attendance_update_own` | UPDATE | `user_id = auth.uid()` | Usuário atualiza apenas a própria presença (status, goalkeeper) |
| `attendance_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins atualizam presenças de qualquer jogador (check-in, pagamento) |
| `attendance_delete_own` | DELETE | `user_id = auth.uid()` | Usuário cancela a própria presença |
| `attendance_delete_admin` | DELETE | `is_group_admin(group_id)` | Admins removem presença de qualquer jogador |

---

### teams / team_members

#### `teams`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `teams_select_member` | SELECT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_member(e.group_id))` | Membros do grupo veem os times do evento |
| `teams_insert_admin` | INSERT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins criam times |
| `teams_update_admin` | UPDATE | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins atualizam placar e informações dos times |
| `teams_delete_admin` | DELETE | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins deletam times (refazer sorteio) |

#### `team_members`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `team_members_select_member` | SELECT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_member(e.group_id))` | Membros veem alocação nos times |
| `team_members_insert_admin` | INSERT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins alocam jogadores |
| `team_members_update_admin` | UPDATE | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins alteram posições |
| `team_members_delete_admin` | DELETE | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins removem jogadores dos times |

---

### event_actions

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `actions_select_member` | SELECT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_member(e.group_id))` | Membros veem ações do placar |
| `actions_insert_admin` | INSERT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins registram gols e cartões |
| `actions_update_admin` | UPDATE | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins corrigem ações |
| `actions_delete_admin` | DELETE | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins removem ações incorretas |

---

### votes

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `votes_select_member` | SELECT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_member(e.group_id))` | Membros veem votos do evento |
| `votes_insert_own` | INSERT | `voter_id = auth.uid()` | Usuário vota com o próprio ID |
| `votes_update_own` | UPDATE | `voter_id = auth.uid()` | Usuário altera o próprio voto |
| `votes_delete_own` | DELETE | `voter_id = auth.uid()` | Usuário remove o próprio voto |

---

### charges / charge_splits

#### `charges`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `charges_select_member` | SELECT | `is_group_member(group_id)` | Membros veem cobranças do grupo |
| `charges_insert_admin` | INSERT | `is_group_admin(group_id)` | Admins criam cobranças |
| `charges_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins editam/cancelam cobranças |
| `charges_delete_admin` | DELETE | `is_group_admin(group_id)` | Admins removem cobranças |

#### `charge_splits`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `splits_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê apenas suas próprias parcelas |
| `splits_select_admin` | SELECT | `is_group_admin(group_id)` | Admins veem todas as parcelas do grupo |
| `splits_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins marcam parcelas como pagas |
| `splits_insert_admin` | INSERT | `is_group_admin(group_id)` | Sistema/admins criam parcelas |

---

### pix_payments

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `pix_select_own` | SELECT | `payer_id = auth.uid()` | Usuário vê os próprios pagamentos PIX |
| `pix_select_admin` | SELECT | `is_group_admin(group_id)` | Admins veem todos os pagamentos do grupo |
| `pix_insert_authenticated` | INSERT | `auth.uid() = payer_id` | Usuário registra o próprio pagamento |
| `pix_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins confirmam ou rejeitam pagamentos |

---

### wallets / transactions

#### `wallets`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `wallets_select_admin` | SELECT | `is_group_admin(group_id)` | Apenas admins veem o saldo da carteira |
| `wallets_update_system` | UPDATE | `has_platform_access()` | Apenas plataforma atualiza saldos |

#### `transactions`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `transactions_select_admin` | SELECT | `is_group_admin(group_id)` | Admins veem transações do grupo |
| `transactions_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê transações próprias |
| `transactions_insert_system` | INSERT | `has_platform_access()` | Somente sistema insere transações |

---

### notifications

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `notifications_select_own` | SELECT | `user_id = auth.uid()` | Notificações são completamente privadas |
| `notifications_update_own` | UPDATE | `user_id = auth.uid()` | Usuário marca notificações como lidas |
| `notifications_delete_own` | DELETE | `user_id = auth.uid()` | Usuário deleta as próprias notificações |
| `notifications_insert_system` | INSERT | `has_platform_access() OR auth.uid() IS NOT NULL` | Sistema e usuários autenticados criam notificações |

---

### push_tokens

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `tokens_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê apenas seus próprios tokens |
| `tokens_insert_own` | INSERT | `user_id = auth.uid()` | Usuário registra o próprio token |
| `tokens_update_own` | UPDATE | `user_id = auth.uid()` | Usuário atualiza o próprio token |
| `tokens_delete_own` | DELETE | `user_id = auth.uid()` | Usuário remove o próprio token |

---

### player_stats / event_stats / group_stats

#### `player_stats`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `player_stats_select_member` | SELECT | `is_group_member(group_id)` | Membros veem estatísticas de todos no grupo |
| `player_stats_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê suas próprias stats sempre |
| `player_stats_update_system` | UPDATE | `has_platform_access()` | Apenas sistema atualiza stats (via trigger) |
| `player_stats_insert_system` | INSERT | `has_platform_access()` | Apenas sistema insere stats |

#### `event_stats`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `event_stats_select_member` | SELECT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_member(e.group_id))` | Membros veem estatísticas do evento |
| `event_stats_insert_system` | INSERT | `has_platform_access()` | Apenas sistema cria stats |
| `event_stats_update_system` | UPDATE | `has_platform_access()` | Apenas sistema atualiza stats |

#### `group_stats`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `group_stats_select_member` | SELECT | `is_group_member(group_id)` | Membros veem estatísticas gerais do grupo |
| `group_stats_insert_system` | INSERT | `has_platform_access()` | Apenas sistema insere stats |
| `group_stats_update_system` | UPDATE | `has_platform_access()` | Apenas sistema atualiza stats |

---

### leaderboards

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `leaderboards_select_member` | SELECT | `is_group_member(group_id)` | Membros veem ranking do grupo |
| `leaderboards_insert_system` | INSERT | `has_platform_access()` | Apenas sistema cria rankings |
| `leaderboards_update_system` | UPDATE | `has_platform_access()` | Apenas sistema atualiza rankings |

---

### achievement_types / badges

#### `achievement_types`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `achievement_types_select_active` | SELECT | `is_active = true` | Todos autenticados veem achievements ativos |
| `achievement_types_insert_admin` | INSERT | `has_platform_access()` | Apenas plataforma cria tipos de achievement |
| `achievement_types_update_admin` | UPDATE | `has_platform_access()` | Apenas plataforma edita achievements |

#### `user_achievements`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `user_achievements_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê as próprias conquistas |
| `user_achievements_select_member` | SELECT | `is_group_member(group_id)` | Membros veem conquistas contextuais do grupo |
| `user_achievements_insert_system` | INSERT | `has_platform_access()` | Apenas sistema concede achievements |

#### `badges`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `badges_select_active` | SELECT | `is_active = true` | Todos autenticados veem badges disponíveis |
| `badges_insert_admin` | INSERT | `has_platform_access()` | Apenas plataforma cria badges |
| `badges_update_admin` | UPDATE | `has_platform_access()` | Apenas plataforma edita badges |

#### `user_badges`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `user_badges_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê os próprios badges |
| `user_badges_select_member` | SELECT | `is_group_member(group_id)` | Membros veem badges contextuais do grupo |
| `user_badges_insert_admin` | INSERT | `is_group_admin(group_id) OR has_platform_access()` | Admins de grupo e plataforma concedem badges |

---

### sport_modalities / athlete_modalities

#### `sport_modalities`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `modalities_select_member` | SELECT | `is_group_member(group_id)` | Membros veem modalidades do grupo |
| `modalities_insert_admin` | INSERT | `is_group_admin(group_id)` | Admins criam modalidades |
| `modalities_update_admin` | UPDATE | `is_group_admin(group_id)` | Admins editam modalidades |
| `modalities_delete_admin` | DELETE | `is_group_admin(group_id)` | Admins removem modalidades |

#### `athlete_modalities`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `athlete_modalities_select_own` | SELECT | `user_id = auth.uid()` | Usuário vê as próprias modalidades |
| `athlete_modalities_select_member` | SELECT | `EXISTS (SELECT 1 FROM sport_modalities sm WHERE sm.id = modality_id AND is_group_member(sm.group_id))` | Membros do grupo veem modalidades dos colegas |
| `athlete_modalities_insert_own` | INSERT | `user_id = auth.uid()` | Usuário vincula as próprias modalidades |
| `athlete_modalities_update_own` | UPDATE | `user_id = auth.uid()` | Usuário atualiza o próprio nível |
| `athlete_modalities_delete_own` | DELETE | `user_id = auth.uid()` | Usuário remove a própria modalidade |

---

### game_convocations / convocation_responses

#### `game_convocations`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `convocations_select_member` | SELECT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_member(e.group_id))` | Membros veem convocações do evento |
| `convocations_insert_admin` | INSERT | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins criam convocações |
| `convocations_update_admin` | UPDATE | `EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_group_admin(e.group_id))` | Admins editam convocações |

#### `convocation_responses`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `responses_select_member` | SELECT | `EXISTS (SELECT 1 FROM game_convocations gc JOIN events e ON e.id = gc.event_id WHERE gc.id = convocation_id AND is_group_member(e.group_id))` | Membros veem respostas |
| `responses_insert_own` | INSERT | `user_id = auth.uid()` | Usuário responde a própria convocação |
| `responses_update_own` | UPDATE | `user_id = auth.uid()` | Usuário atualiza a própria resposta |

---

### credit_transactions / promo_coupons / coupon_usages

#### `credit_transactions`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `credit_txn_select_admin` | SELECT | `is_group_admin(group_id)` | Admins veem transações de crédito do grupo |
| `credit_txn_insert_platform` | INSERT | `has_platform_access()` | Apenas plataforma cria transações |

#### `promo_coupons`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `coupons_select_authenticated` | SELECT | `is_active = true AND (valid_until IS NULL OR valid_until > now())` | Qualquer autenticado busca cupons ativos |
| `coupons_insert_platform` | INSERT | `has_platform_access()` | Apenas plataforma cria cupons |
| `coupons_update_platform` | UPDATE | `has_platform_access()` | Apenas plataforma edita cupons |

#### `coupon_usages`

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `coupon_usages_select_admin` | SELECT | `is_group_admin(group_id)` | Admins veem usos de cupons do grupo |
| `coupon_usages_insert_admin` | INSERT | `is_group_admin(group_id)` | Admins aplicam cupons ao grupo |

---

### activity_log

| Policy | Tipo | Expression | Regra (PT-BR) |
|--------|------|------------|---------------|
| `activity_log_select_admin` | SELECT | `is_group_admin(group_id) OR has_platform_access()` | Admins do grupo e plataforma veem logs |
| `activity_log_insert_authenticated` | INSERT | `auth.uid() IS NOT NULL` | Qualquer ação autenticada pode ser logada |

---

## Riscos de Segurança Identificados

### Risco 1 — Conflito NextAuth vs Supabase Auth (CRITICO)

O projeto usa **NextAuth.js v5 com `@auth/pg-adapter`** para autenticação, realizando queries via o pacote `postgres` diretamente. As políticas RLS foram escritas baseando-se em `auth.uid()`, que é uma função do **Supabase Auth** (JWT gerenciado pelo GoTrue).

**Consequência**: Em API routes do Next.js que usam `db` (cliente `postgres` direto), `auth.uid()` retorna `NULL`, portanto **todas as políticas RLS falham silenciosamente** — o usuário ou não consegue dados (violação de policy) ou os dados são retornados sem filtragem (se RLS foi desabilitado).

**Verificar**: Se as tabelas têm `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` sem uma policy de `FORCE`, queries pelo cliente postgres direto sem `SET LOCAL role` e `SET LOCAL request.jwt.claim.sub` podem ignorar RLS completamente quando feitas como `postgres` superuser.

### Risco 2 — RLS Possivelmente Ineficaz nas API Routes (ALTO)

As API routes (`src/app/api/**`) usam o cliente `db` (pool de conexões postgres direto) que se conecta com as credenciais do `SUPABASE_DB_URL`. Se essa URL usa o usuário `postgres` ou `service_role`, RLS é **bypassado automaticamente** pelo PostgreSQL.

**Indicador**: A presença de `prepared: false` na configuração do cliente indica uso de Supabase Pooler (Transaction mode), o que é incompatível com `SET LOCAL` para simular o contexto do Supabase Auth.

**Consequência prática**: O filtro de grupo (`group_id`) nas queries deve ser implementado **manualmente no código das API routes**, pois RLS não pode ser confiado como barreira de segurança nesta arquitetura.

### Risco 3 — Ausência de Middleware de Proteção de Rotas (MEDIO)

Nenhum `middleware.ts` foi encontrado no projeto. A proteção de rotas é feita individualmente em cada `page.tsx` e `route.ts`. Isso cria risco de:
- Rotas esquecidas sem verificação de autenticação
- Inconsistência entre rotas protegidas e não-protegidas
- Dificuldade de auditoria de segurança

**Recomendação**: Implementar `middleware.ts` com `matcher` para proteger `/dashboard/**` e `/api/**` globalmente.

### Risco 4 — NextAuth v5 em BETA (BAIXO)

A versão `5.0.0-beta.25` é uma versão beta com API instável. Mudanças breaking podem ocorrer entre versões beta sem deprecation notice adequado.

### Resumo dos Riscos

| Risco | Severidade | Status |
|-------|-----------|--------|
| auth.uid() NULL em API routes | Critico | Verificar se RLS está ativo |
| Queries com superuser bypassam RLS | Alto | Confirmar URL do banco utilizada |
| Sem middleware global de auth | Medio | Implementar middleware.ts |
| NextAuth v5 BETA instável | Baixo | Monitorar releases |
