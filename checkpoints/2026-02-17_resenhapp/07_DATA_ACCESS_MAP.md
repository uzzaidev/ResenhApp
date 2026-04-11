# ResenhApp V2.0 — Mapa de Acesso a Dados
> FATO (do código) — Mapeamento de quais tabelas são acessadas por quais rotas/componentes

## Catálogo A: Por Rota (Route → Tabelas)

### Rotas de Autenticação

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/auth/signup` | POST | `users` (check duplicado) | `users` |
| `/api/auth/[...nextauth]` | GET/POST | `users` (credentials) | `sessions` (adapter) |

---

### Rotas de Grupos

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/groups` | GET | `groups`, `group_members` | — |
| `/api/groups` | POST | `groups`, `group_members` | `groups`, `group_members`, `wallets`, `invites` |
| `/api/groups/[groupId]` | GET | `groups`, `group_members`, `events`, `wallets` | — |
| `/api/groups/[groupId]` | PATCH | `groups` | `groups` |
| `/api/groups/[groupId]` | DELETE | `groups` | `groups` (is_active=false) |
| `/api/groups/switch` | POST | `group_members` | cookie `currentGroupId` |
| `/api/groups/join` | POST | `invites`, `group_members` | `group_members`, `invites` (use_count++) |
| `/api/groups/managed` | GET | `groups`, `group_members` | — |
| `/api/groups/[groupId]/members` | GET | `group_members`, `users` | — |
| `/api/groups/[groupId]/members/[memberId]` | PATCH | `group_members` | `group_members` |
| `/api/groups/[groupId]/members/[memberId]` | DELETE | `group_members` | `group_members` |
| `/api/groups/[groupId]/members/create-user` | POST | `users`, `group_members` | `users`, `group_members` |
| `/api/groups/[groupId]/invites` | GET | `invites` | — |
| `/api/groups/[groupId]/invites` | POST | — | `invites` |
| `/api/groups/[groupId]/invites/[id]` | DELETE | `invites` | `invites` (is_active=false) |
| `/api/groups/[groupId]/event-settings` | GET | `group_event_settings` | — |
| `/api/groups/[groupId]/event-settings` | PATCH | — | `group_event_settings` |
| `/api/groups/[groupId]/draw-config` | GET | `draw_configs` | — |
| `/api/groups/[groupId]/draw-config` | PATCH | — | `draw_configs` |
| `/api/groups/[groupId]/receiver-profiles` | GET | `receiver_profiles` | — |
| `/api/groups/[groupId]/receiver-profiles` | POST | — | `receiver_profiles` |
| `/api/groups/[groupId]/receiver-profiles/[id]` | PATCH | — | `receiver_profiles` |
| `/api/groups/[groupId]/receiver-profiles/[id]` | DELETE | — | `receiver_profiles` (is_active=false) |
| `/api/groups/[groupId]/charges` | GET | `charges`, `charge_splits`, `users` | — |
| `/api/groups/[groupId]/charges` | POST | `group_members` | `charges`, `charge_splits` |
| `/api/groups/[groupId]/charges/[chargeId]/mark-paid` | POST | `charges` | `charges`, `transactions`, `wallets` |
| `/api/groups/[groupId]/charges/[chargeId]/cancel` | POST | `charges` | `charges` |
| `/api/groups/[groupId]/rankings` | GET | `leaderboards`, `event_actions`, `event_attendance`, `player_stats` | — |
| `/api/groups/[groupId]/my-stats` | GET | `event_actions`, `event_attendance`, `player_stats`, `votes` | — |
| `/api/groups/[groupId]/stats` | GET | `events`, `event_actions`, `event_attendance` | — |

---

### Rotas de Eventos

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/events` | GET | `events`, `venues`, `event_attendance` | — |
| `/api/events` | POST | `groups`, `venues` | `events` |
| `/api/events/[eventId]` | GET | `events`, `venues`, `event_attendance`, `teams`, `team_members`, `event_actions` | — |
| `/api/events/[eventId]` | PATCH | — | `events` |
| `/api/events/[eventId]` | DELETE | — | `events` (is_active=false) |
| `/api/events/[eventId]/rsvp` | POST | `events`, `event_attendance`, `receiver_profiles` | `event_attendance`, `charges`, `pix_payments` |
| `/api/events/[eventId]/attendance` | GET | `event_attendance`, `users` | — |
| `/api/events/[eventId]/attendance/[id]` | PATCH | — | `event_attendance` |
| `/api/events/[eventId]/attendance/[id]` | DELETE | `event_attendance` | `event_attendance` (promote waitlist) |
| `/api/events/[eventId]/teams` | GET | `teams`, `team_members`, `users` | — |
| `/api/events/[eventId]/teams/draw` | POST | `event_attendance`, `athlete_modalities` | `teams`, `team_members` |
| `/api/events/[eventId]/teams/[teamId]` | PATCH | — | `teams` |
| `/api/events/[eventId]/teams/[teamId]/members` | POST | — | `team_members` |
| `/api/events/[eventId]/teams/[teamId]/members/[id]` | DELETE | — | `team_members` |
| `/api/events/[eventId]/actions` | GET | `event_actions`, `users`, `teams` | — |
| `/api/events/[eventId]/actions` | POST | `events`, `teams`, `users` | `event_actions`, `teams` (score), `player_stats` (via trigger) |
| `/api/events/[eventId]/actions/[id]` | DELETE | `event_actions` | `event_actions`, `teams` (score revert) |
| `/api/events/[eventId]/score` | POST | — | `teams` |
| `/api/events/[eventId]/votes` | GET | `votes`, `users` | — |
| `/api/events/[eventId]/votes` | POST | `votes` (check duplicate) | `votes` |
| `/api/events/[eventId]/mvp-tiebreakers` | GET | `mvp_tiebreakers`, `mvp_tiebreaker_votes` | — |
| `/api/events/[eventId]/mvp-tiebreakers` | POST | `votes` (calcular empate) | `mvp_tiebreakers` |
| `/api/events/[eventId]/mvp-tiebreakers/[id]/votes` | POST | — | `mvp_tiebreaker_votes` |
| `/api/events/[eventId]/confirm` | POST | — | `events` (status=confirmed) |
| `/api/events/[eventId]/start` | POST | — | `events` (status=in_progress) |
| `/api/events/[eventId]/finish` | POST | `votes`, `event_actions` | `events` (status=completed), `player_stats` |
| `/api/events/[eventId]/cancel` | POST | — | `events` (status=cancelled) |
| `/api/events/[eventId]/draw-config` | GET | `draw_configs` | — |
| `/api/events/[eventId]/draw-config` | PATCH | — | `draw_configs` |

---

### Rotas de Atletas

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/athletes/[userId]/modalities` | GET | `athlete_modalities`, `sport_modalities` | — |
| `/api/athletes/[userId]/modalities` | POST | `sport_modalities`, `athlete_modalities` (check) | `athlete_modalities` |
| `/api/athletes/[userId]/modalities/[modalityId]` | PATCH | — | `athlete_modalities` |
| `/api/athletes/[userId]/modalities/[modalityId]` | DELETE | — | `athlete_modalities` |

---

### Rotas Financeiras (Charges / PIX)

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/charges/[chargeId]/pix` | GET | `charges`, `pix_payments`, `receiver_profiles` | — |
| `/api/charges/[chargeId]/pix` | POST | `charges`, `receiver_profiles` | `pix_payments`, `charges` |

---

### Rotas de Créditos

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/credits` | GET | `credit_transactions`, `groups` | — |
| `/api/credits` | POST | `credit_packages`, `promo_coupons` | `credit_transactions`, `coupon_usages`, `groups` (balance) |
| `/api/credits/check` | GET | `groups` (credits_balance) | — |
| `/api/credits/history` | GET | `credit_transactions` | — |
| `/api/credits/validate-coupon` | POST | `promo_coupons`, `coupon_usages` | — |

---

### Rotas de Modalidades

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/modalities` | GET | `sport_modalities` | — |
| `/api/modalities` | POST | `sport_modalities` (check unique) | `sport_modalities` |
| `/api/modalities/[modalityId]` | GET | `sport_modalities` | — |
| `/api/modalities/[modalityId]` | PATCH | — | `sport_modalities` |
| `/api/modalities/[modalityId]` | DELETE | — | `sport_modalities` (is_active=false) |

---

### Rotas de Notificações

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/notifications` | GET | `notifications` | — |
| `/api/notifications?action=mark-all-read` | POST | — | `notifications` (read_at) |
| `/api/notifications/[id]` | PATCH | — | `notifications` (read_at) |
| `/api/notifications/[id]` | DELETE | — | `notifications` (deleted_at) |

---

### Rotas de Busca

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/search` | GET | `users`, `events`, `sport_modalities`, `groups` | — |

---

### Rotas de Treinos Recorrentes

| Rota | Método | Tabelas Lidas | Tabelas Escritas |
|------|--------|---------------|-----------------|
| `/api/recurring-trainings` | GET | `events` (is_recurring=true) | — |
| `/api/recurring-trainings` | POST | `groups` (credits_balance) | `events`, `credit_transactions` |
| `/api/recurring-trainings/[id]` | PATCH | — | `events` |
| `/api/recurring-trainings/[id]` | DELETE | — | `events` (is_active=false) |

---

## Catálogo B: Por Tabela (Tabela → Rotas que a Acessam)

| Tabela | Rotas de Leitura | Rotas de Escrita |
|--------|-----------------|-----------------|
| `users` | `/api/auth/*`, `/api/groups/[id]/members`, `/api/search`, `/api/events/[id]/attendance` | `/api/auth/signup`, `/api/groups/[id]/members/create-user` |
| `groups` | `/api/groups`, `/api/groups/[id]`, `/api/groups/managed`, `/api/credits/check` | `/api/groups` (POST), `/api/groups/[id]` (PATCH/DELETE), `/api/credits` (POST, balance) |
| `group_members` | `/api/groups`, `/api/groups/[id]/members`, `/api/groups/join`, `/api/groups/switch` | `/api/groups` (POST), `/api/groups/join`, `/api/groups/[id]/members/*` |
| `invites` | `/api/groups/join`, `/api/groups/[id]/invites` | `/api/groups` (POST), `/api/groups/[id]/invites` (POST/DELETE) |
| `venues` | `/api/events`, `/api/events/[id]` | — (gerenciado via settings) |
| `events` | `/api/events`, `/api/events/[id]`, `/api/groups/[id]/stats`, `/api/recurring-trainings` | `/api/events` (POST/PATCH/DELETE), `/api/events/[id]/*` (ciclo de vida), `/api/recurring-trainings` |
| `event_attendance` | `/api/events`, `/api/events/[id]`, `/api/events/[id]/attendance`, `/api/groups/[id]/stats`, `/api/groups/[id]/rankings` | `/api/events/[id]/rsvp`, `/api/events/[id]/attendance/*` |
| `teams` | `/api/events/[id]`, `/api/events/[id]/teams`, `/api/events/[id]/actions` | `/api/events/[id]/teams/draw`, `/api/events/[id]/teams/[teamId]`, `/api/events/[id]/actions` (score) |
| `team_members` | `/api/events/[id]/teams` | `/api/events/[id]/teams/draw`, `/api/events/[id]/teams/[teamId]/members` |
| `event_actions` | `/api/events/[id]/actions`, `/api/groups/[id]/rankings`, `/api/groups/[id]/my-stats`, `/api/groups/[id]/stats` | `/api/events/[id]/actions` (POST/DELETE) |
| `player_stats` | `/api/groups/[id]/rankings`, `/api/groups/[id]/my-stats` | Trigger `after_insert_event_action_update_stats` |
| `votes` | `/api/events/[id]/votes`, `/api/events/[id]/mvp-tiebreakers`, `/api/groups/[id]/my-stats` | `/api/events/[id]/votes` (POST) |
| `mvp_tiebreakers` | `/api/events/[id]/mvp-tiebreakers` | `/api/events/[id]/mvp-tiebreakers` (POST) |
| `mvp_tiebreaker_votes` | `/api/events/[id]/mvp-tiebreakers` | `/api/events/[id]/mvp-tiebreakers/[id]/votes` |
| `leaderboards` | `/api/groups/[id]/rankings` | Cron `/api/cron/calculate-metrics` (NOT FOUND) |
| `charges` | `/api/groups/[id]/charges`, `/api/charges/[id]/pix` | `/api/groups/[id]/charges` (POST), `/api/events/[id]/rsvp`, `/api/charges/[id]/pix` |
| `charge_splits` | `/api/groups/[id]/charges` | `/api/groups/[id]/charges` (POST) |
| `transactions` | — | `/api/groups/[id]/charges/[id]/mark-paid` |
| `wallets` | `/api/groups/[id]` | `/api/groups` (POST), `/api/groups/[id]/charges/[id]/mark-paid` |
| `receiver_profiles` | `/api/groups/[id]/receiver-profiles`, `/api/events/[id]/rsvp`, `/api/charges/[id]/pix` | `/api/groups/[id]/receiver-profiles` (POST/PATCH/DELETE) |
| `pix_payments` | `/api/charges/[id]/pix` (GET) | `/api/charges/[id]/pix` (POST), `/api/events/[id]/rsvp` |
| `sport_modalities` | `/api/modalities`, `/api/athletes/[id]/modalities`, `/api/search` | `/api/modalities` (POST/PATCH/DELETE) |
| `athlete_modalities` | `/api/athletes/[id]/modalities`, `/api/events/[id]/teams/draw` | `/api/athletes/[id]/modalities` (POST/PATCH/DELETE) |
| `credit_transactions` | `/api/credits`, `/api/credits/history` | `/api/credits` (POST), `/api/recurring-trainings` (POST) |
| `credit_packages` | `/api/credits` (POST) | — (admin direto no banco) |
| `promo_coupons` | `/api/credits/validate-coupon`, `/api/credits` (POST) | — |
| `coupon_usages` | `/api/credits/validate-coupon`, `/api/credits` (POST) | `/api/credits` (POST) |
| `notifications` | `/api/notifications` | `/api/notifications/*`, Triggers do banco |
| `notification_templates` | Triggers do banco | — |
| `push_tokens` | — | — (delivery não implementado) |
| `email_queue` | — | — (delivery não implementado) |
| `draw_configs` | `/api/groups/[id]/draw-config`, `/api/events/[id]/draw-config` | `/api/groups/[id]/draw-config` (PATCH), `/api/events/[id]/draw-config` (PATCH) |
| `group_event_settings` | `/api/groups/[id]/event-settings` | `/api/groups/[id]/event-settings` (PATCH) |
| `achievement_types` | — | — |
| `user_achievements` | — | Trigger `after_insert_event_action_check_achievements` |
| `badges` | — | — |
| `user_badges` | — | — |
| `milestones` | — | — |
| `challenges` | — | — |
| `challenge_participants` | — | — |
| `leaderboards` | `/api/groups/[id]/rankings` | Cron `calculate-metrics` (NOT FOUND) |

---

## Catálogo C: Por Biblioteca (lib → Tabelas)

| Biblioteca | Tabelas Acessadas |
|------------|-----------------|
| `src/lib/auth.ts` | `users` (authorize), `sessions` (adapter) |
| `src/lib/pix.ts` | Nenhuma (geração pura de payload, sem DB) |
| `src/lib/pix-helpers.ts` | `charges`, `receiver_profiles`, `pix_payments` |
| `src/lib/credits.ts` | `credit_transactions`, `groups` (balance), `credit_packages`, `promo_coupons`, `coupon_usages` |
| `src/lib/credits-middleware.ts` | `groups` (balance check via credits.ts) |
| `src/lib/permissions.ts` | `group_members`, `groups` |
| `src/lib/permissions-middleware.ts` | `group_members` (via permissions.ts) |
| `src/lib/auth-helpers.ts` | — (usa nextauth session, não acessa DB diretamente) |
| `src/db/client.ts` | Pool de conexão — não acessa tabelas diretamente |

---

## Observações Importantes

1. **Conexão com banco**: Todo acesso ao banco é via `postgres` package (SQL template literals). Não há ORM.
2. **RLS e segurança**: As queries são executadas com credenciais de superuser (`DATABASE_URL`), o que significa que as RLS policies do Supabase podem não estar efetivas. O filtro de segurança é feito via `WHERE group_id = currentGroupId AND user_id = currentUserId` no código das rotas.
3. **Triggers como escritas implícitas**: Algumas tabelas são escritas por triggers do banco, não diretamente por API routes:
   - `player_stats` → trigger após INSERT em `event_actions`
   - `notifications` → triggers após INSERT em `charges` e UPDATE de status de `charges`
   - `user_achievements` → trigger após INSERT em `event_actions`
4. **Tabelas de gamificação**: `achievement_types`, `badges`, `user_badges`, `milestones`, `challenges`, `challenge_participants` existem no banco mas não têm rotas de API associadas ainda.
5. **Email/Push delivery**: `email_queue` e `push_tokens` existem mas não há código que as leia para envio de mensagens.
