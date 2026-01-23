# 📊 Database Schema - ResenhApp

> **Documentação completa de todas as tabelas, colunas e constraints**

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Tabelas Core](#tabelas-core)
- [Tabelas de Relacionamento](#tabelas-de-relacionamento)
- [Tabelas de Ações e Stats](#tabelas-de-ações-e-stats)
- [Tabelas Financeiras](#tabelas-financeiras)
- [Tabelas de Configuração](#tabelas-de-configuração)
- [Views Materializadas](#views-materializadas)

---

## Visão Geral

### Estatísticas do Schema

| Métrica | Valor |
|---------|-------|
| **Total de Tabelas** | 17 (16 app + 1 sistema) |
| **Total de Colunas** | 126 |
| **Total de FK** | 27 relacionamentos |
| **Total de Índices** | 55 |
| **Tipo de PKs** | UUID (todas) |

### Convenções

- **Primary Keys:** Todas as tabelas usam `id UUID` como PK
- **Timestamps:** `created_at` e `updated_at` em TIMESTAMP
- **Soft Delete:** Algumas tabelas têm `deleted_at` (opcional)
- **Foreign Keys:** Sempre com `ON DELETE CASCADE` ou `SET NULL`
- **Naming:** snake_case para tabelas e colunas

---

## Tabelas Core

### 1. `users`

**Descrição:** Usuários do sistema com autenticação por email/senha.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `name` | VARCHAR(255) | ✗ | - | Nome completo do usuário |
| `email` | VARCHAR(255) | ✗ | - | Email (único) |
| `email_verified` | TIMESTAMP | ✓ | NULL | Data de verificação do email |
| `password_hash` | TEXT | ✓ | NULL | Hash bcrypt da senha |
| `image` | TEXT | ✓ | NULL | URL da foto de perfil |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `UNIQUE(email)` - Email único

**Índices:**
- PK: `users_pkey` (id)
- Unique: `users_email_key` (email)

**Relacionamentos:**
- **1:N** → groups (via created_by)
- **1:N** → group_members
- **1:N** → events (via created_by)
- **1:N** → event_attendance
- **1:N** → wallets (owner_type='user')

---

### 2. `groups`

**Descrição:** Grupos de peladas/esportes organizados por usuários.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `name` | VARCHAR(255) | ✗ | - | Nome do grupo |
| `description` | TEXT | ✓ | NULL | Descrição do grupo |
| `privacy` | VARCHAR(20) | ✓ | 'private' | 'private' ou 'public' |
| `photo_url` | TEXT | ✓ | NULL | URL da foto do grupo |
| `created_by` | UUID | ✓ | NULL | Criador do grupo (FK → users) |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `CHECK(privacy IN ('private', 'public'))`
- `FK(created_by) → users(id) ON DELETE SET NULL`

**Índices:**
- PK: `groups_pkey` (id)

**Relacionamentos:**
- **N:1** → users (via created_by)
- **1:N** → group_members
- **1:N** → events
- **1:N** → venues
- **1:N** → invites
- **1:N** → charges
- **1:1** → draw_configs
- **1:1** → event_settings
- **1:1** → wallets (owner_type='group')

---

### 3. `group_members`

**Descrição:** Membros de grupos com roles (admin/member).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `user_id` | UUID | ✗ | - | Membro (FK → users) |
| `group_id` | UUID | ✗ | - | Grupo (FK → groups) |
| `role` | VARCHAR(20) | ✓ | 'member' | 'admin' ou 'member' |
| `is_goalkeeper` | BOOLEAN | ✓ | FALSE | Se é goleiro |
| `base_rating` | INTEGER | ✓ | 5 | Rating base (0-10) |
| `joined_at` | TIMESTAMP | ✓ | NOW() | Data de entrada |

**Constraints:**
- `UNIQUE(user_id, group_id)` - Um usuário por grupo
- `CHECK(role IN ('admin', 'member'))`
- `CHECK(base_rating >= 0 AND base_rating <= 10)`
- `FK(user_id) → users(id) ON DELETE CASCADE`
- `FK(group_id) → groups(id) ON DELETE CASCADE`

**Índices:**
- PK: `group_members_pkey` (id)
- `idx_group_members_user` (user_id)
- `idx_group_members_group` (group_id)

---

## Tabelas de Relacionamento

### 4. `events`

**Descrição:** Eventos/peladas agendados.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `group_id` | UUID | ✗ | - | Grupo do evento (FK → groups) |
| `starts_at` | TIMESTAMP | ✗ | - | Data/hora de início |
| `venue_id` | UUID | ✓ | NULL | Local (FK → venues) |
| `max_players` | INTEGER | ✓ | 10 | Máximo de jogadores |
| `max_goalkeepers` | INTEGER | ✓ | 2 | Máximo de goleiros |
| `status` | VARCHAR(20) | ✓ | 'scheduled' | Status do evento |
| `waitlist_enabled` | BOOLEAN | ✓ | TRUE | Lista de espera habilitada |
| `created_by` | UUID | ✓ | NULL | Criador (FK → users) |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `CHECK(status IN ('scheduled', 'live', 'finished', 'canceled'))`
- `FK(group_id) → groups(id) ON DELETE CASCADE`
- `FK(venue_id) → venues(id) ON DELETE SET NULL`
- `FK(created_by) → users(id) ON DELETE SET NULL`

**Índices:**
- PK: `events_pkey` (id)
- `idx_events_group` (group_id)
- `idx_events_status` (status)
- `idx_events_starts_at` (starts_at)

---

### 5. `event_attendance`

**Descrição:** RSVP e presença de jogadores em eventos.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `event_id` | UUID | ✗ | - | Evento (FK → events) |
| `user_id` | UUID | ✗ | - | Jogador (FK → users) |
| `role` | VARCHAR(20) | ✓ | 'line' | 'gk' ou 'line' |
| `status` | VARCHAR(20) | ✓ | 'no' | 'yes', 'no', 'waitlist', 'dm' |
| `preferred_position` | VARCHAR(20) | ✓ | NULL | Posição preferida |
| `secondary_position` | VARCHAR(20) | ✓ | NULL | Posição alternativa |
| `checked_in_at` | TIMESTAMP | ✓ | NULL | Timestamp do check-in |
| `order_of_arrival` | INTEGER | ✓ | NULL | Ordem de chegada |
| `removed_by_self_at` | TIMESTAMP | ✓ | NULL | Quando saiu após confirmar |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `UNIQUE(event_id, user_id)` - Um RSVP por evento
- `CHECK(role IN ('gk', 'line'))`
- `CHECK(status IN ('yes', 'no', 'waitlist', 'dm'))`
- `CHECK(preferred_position IN ('gk', 'defender', 'midfielder', 'forward'))`
- `CHECK(secondary_position IN ('gk', 'defender', 'midfielder', 'forward'))`
- `FK(event_id) → events(id) ON DELETE CASCADE`
- `FK(user_id) → users(id) ON DELETE CASCADE`

**Índices:**
- PK: `event_attendance_pkey` (id)
- `idx_event_attendance_event` (event_id)
- `idx_event_attendance_user` (user_id)
- `idx_event_attendance_removed_by_self` (removed_by_self_at WHERE NOT NULL)

---

### 6. `venues`

**Descrição:** Locais/quadras onde acontecem os eventos.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `group_id` | UUID | ✓ | NULL | Grupo dono (FK → groups) |
| `name` | VARCHAR(255) | ✗ | - | Nome do local |
| `address` | TEXT | ✓ | NULL | Endereço completo |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |

**Constraints:**
- `FK(group_id) → groups(id) ON DELETE CASCADE`

**Índices:**
- PK: `venues_pkey` (id)

---

### 7. `teams`

**Descrição:** Times sorteados para cada evento.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `event_id` | UUID | ✗ | - | Evento (FK → events) |
| `name` | VARCHAR(50) | ✗ | - | Nome do time (ex: "Time A") |
| `seed` | INTEGER | ✓ | 0 | Ordem do sorteio |
| `is_winner` | BOOLEAN | ✓ | NULL | Se venceu a partida |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |

**Constraints:**
- `FK(event_id) → events(id) ON DELETE CASCADE`

**Índices:**
- PK: `teams_pkey` (id)

---

### 8. `team_members`

**Descrição:** Jogadores em cada time sorteado.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `team_id` | UUID | ✗ | - | Time (FK → teams) |
| `user_id` | UUID | ✗ | - | Jogador (FK → users) |
| `position` | VARCHAR(20) | ✓ | 'line' | Posição no time |
| `starter` | BOOLEAN | ✓ | TRUE | Se é titular |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |

**Constraints:**
- `UNIQUE(team_id, user_id)` - Um jogador por time
- `CHECK(position IN ('gk', 'defender', 'midfielder', 'forward', 'line'))`
- `FK(team_id) → teams(id) ON DELETE CASCADE`
- `FK(user_id) → users(id) ON DELETE CASCADE`

**Índices:**
- PK: `team_members_pkey` (id)

---

## Tabelas de Ações e Stats

### 9. `event_actions`

**Descrição:** Ações durante o jogo (gols, assistências, cartões).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `event_id` | UUID | ✗ | - | Evento (FK → events) |
| `actor_user_id` | UUID | ✗ | - | Quem registrou (FK → users) |
| `action_type` | VARCHAR(30) | ✗ | - | Tipo da ação |
| `subject_user_id` | UUID | ✓ | NULL | Jogador da ação (FK → users) |
| `team_id` | UUID | ✓ | NULL | Time (FK → teams) |
| `minute` | INTEGER | ✓ | NULL | Minuto do jogo |
| `metadata` | JSONB | ✓ | NULL | Dados extras |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |

**Constraints:**
- `CHECK(action_type IN ('goal', 'assist', 'save', 'tackle', 'error', 'yellow_card', 'red_card', 'period_start', 'period_end'))`
- `FK(event_id) → events(id) ON DELETE CASCADE`
- `FK(actor_user_id) → users(id) ON DELETE CASCADE`
- `FK(subject_user_id) → users(id) ON DELETE SET NULL`
- `FK(team_id) → teams(id) ON DELETE SET NULL`

**Índices:**
- PK: `event_actions_pkey` (id)
- `idx_event_actions_event` (event_id)
- `idx_event_actions_type` (action_type)

---

### 10. `player_ratings`

**Descrição:** Avaliações de jogadores após partidas.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `event_id` | UUID | ✗ | - | Evento (FK → events) |
| `rater_user_id` | UUID | ✗ | - | Quem avaliou (FK → users) |
| `rated_user_id` | UUID | ✗ | - | Quem foi avaliado (FK → users) |
| `score` | INTEGER | ✓ | NULL | Nota (0-10) |
| `tags` | TEXT[] | ✓ | NULL | Tags (mvp, pereba, etc) |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |

**Constraints:**
- `UNIQUE(event_id, rater_user_id, rated_user_id)` - Uma avaliação por par
- `CHECK(score >= 0 AND score <= 10)`
- `FK(event_id) → events(id) ON DELETE CASCADE`
- `FK(rater_user_id) → users(id) ON DELETE CASCADE`
- `FK(rated_user_id) → users(id) ON DELETE CASCADE`

**Índices:**
- PK: `player_ratings_pkey` (id)
- `idx_player_ratings_event` (event_id)
- `idx_player_ratings_rated` (rated_user_id)

---

## Tabelas Financeiras

### 11. `wallets`

**Descrição:** Carteiras de grupos e usuários.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `owner_type` | VARCHAR(10) | ✓ | NULL | 'group' ou 'user' |
| `owner_id` | UUID | ✗ | - | ID do dono (group_id ou user_id) |
| `balance_cents` | INTEGER | ✓ | 0 | Saldo em centavos |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `CHECK(owner_type IN ('group', 'user'))`

**Índices:**
- PK: `wallets_pkey` (id)

**Nota:** owner_id não é FK direto pois aponta para tabelas diferentes.

---

### 12. `charges`

**Descrição:** Cobranças de usuários em grupos.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `group_id` | UUID | ✗ | - | Grupo (FK → groups) |
| `user_id` | UUID | ✗ | - | Usuário (FK → users) |
| `type` | VARCHAR(20) | ✓ | NULL | Tipo da cobrança |
| `amount_cents` | INTEGER | ✗ | - | Valor em centavos |
| `due_date` | DATE | ✓ | NULL | Data de vencimento |
| `status` | VARCHAR(20) | ✓ | 'pending' | Status |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `CHECK(type IN ('monthly', 'daily', 'fine', 'other'))`
- `CHECK(status IN ('pending', 'paid', 'canceled'))`
- `FK(group_id) → groups(id) ON DELETE CASCADE`
- `FK(user_id) → users(id) ON DELETE CASCADE`

**Índices:**
- PK: `charges_pkey` (id)
- `idx_charges_user_status` (user_id, status)
- `idx_charges_due_date` (due_date)

---

### 13. `invites`

**Descrição:** Códigos de convite para grupos.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `group_id` | UUID | ✗ | - | Grupo (FK → groups) |
| `code` | VARCHAR(20) | ✗ | - | Código único |
| `created_by` | UUID | ✓ | NULL | Criador (FK → users) |
| `expires_at` | TIMESTAMP | ✓ | NULL | Data de expiração |
| `max_uses` | INTEGER | ✓ | NULL | Máximo de usos |
| `used_count` | INTEGER | ✓ | 0 | Quantas vezes usado |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |

**Constraints:**
- `UNIQUE(code)` - Código único
- `FK(group_id) → groups(id) ON DELETE CASCADE`
- `FK(created_by) → users(id) ON DELETE SET NULL`

**Índices:**
- PK: `invites_pkey` (id)
- Unique: `invites_code_key` (code)

---

## Tabelas de Configuração

### 14. `draw_configs`

**Descrição:** Configurações de sorteio de times por grupo.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `group_id` | UUID | ✗ | - | Grupo (FK → groups) |
| `players_per_team` | INTEGER | ✓ | 7 | Jogadores por time |
| `reserves_per_team` | INTEGER | ✓ | 2 | Reservas por time |
| `gk_count` | INTEGER | ✓ | 1 | Goleiros necessários |
| `defender_count` | INTEGER | ✓ | 2 | Zagueiros necessários |
| `midfielder_count` | INTEGER | ✓ | 2 | Meio-campistas |
| `forward_count` | INTEGER | ✓ | 2 | Atacantes |
| `created_by` | UUID | ✓ | NULL | Criador (FK → users) |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `UNIQUE(group_id)` - Uma config por grupo
- `CHECK(players_per_team >= 1 AND players_per_team <= 22)`
- `CHECK(reserves_per_team >= 0 AND reserves_per_team <= 11)`
- `CHECK(gk_count >= 0 AND gk_count <= 5)`
- `CHECK(defender_count >= 0 AND defender_count <= 11)`
- `CHECK(midfielder_count >= 0 AND midfielder_count <= 11)`
- `CHECK(forward_count >= 0 AND forward_count <= 11)`
- `FK(group_id) → groups(id) ON DELETE CASCADE`
- `FK(created_by) → users(id) ON DELETE SET NULL`

**Índices:**
- PK: `draw_configs_pkey` (id)

---

### 15. `event_settings`

**Descrição:** Configurações padrão de eventos por grupo.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | ✗ | uuid_generate_v4() | Primary key |
| `group_id` | UUID | ✗ | - | Grupo (FK → groups) |
| `min_players` | INTEGER | ✓ | 4 | Mínimo de jogadores |
| `max_players` | INTEGER | ✓ | 22 | Máximo de jogadores |
| `max_waitlist` | INTEGER | ✓ | 10 | Máximo na lista de espera |
| `created_by` | UUID | ✓ | NULL | Criador (FK → users) |
| `created_at` | TIMESTAMP | ✓ | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | ✓ | NOW() | Data de atualização |

**Constraints:**
- `UNIQUE(group_id)` - Uma config por grupo
- `CHECK(min_players >= 1 AND min_players <= 22)`
- `CHECK(max_players >= 1 AND max_players <= 50)`
- `CHECK(max_waitlist >= 0 AND max_waitlist <= 50)`
- `FK(group_id) → groups(id) ON DELETE CASCADE`
- `FK(created_by) → users(id) ON DELETE SET NULL`

**Índices:**
- PK: `event_settings_pkey` (id)

---

## Views Materializadas

### `mv_event_scoreboard`

**Descrição:** Placar em tempo real de eventos.

**Estrutura:**
```sql
SELECT
  event_id,
  team_id,
  team_name,
  goals,
  assists
FROM event_actions
WHERE action_type IN ('goal', 'assist')
GROUP BY event_id, team_id, team_name
```

**Refresh:** Automático via trigger em `event_actions`

**Índice:**
- Unique: `idx_mv_scoreboard_event_team` (event_id, team_id)

---

## Tabelas do Sistema

### `spatial_ref_sys`

**Descrição:** Tabela padrão do PostGIS para sistemas de referência espacial.

**Status:** Não usada pela aplicação, mas necessária para extensão PostGIS.

**Registros:** ~8.500 (dados padrão)

---

## Resumo de Relacionamentos

```
users (1) ─┬─> (N) groups [created_by]
           ├─> (N) group_members
           ├─> (N) events [created_by]
           ├─> (N) event_attendance
           ├─> (N) team_members
           ├─> (N) event_actions
           ├─> (N) player_ratings
           ├─> (N) charges
           └─> (N) wallets [owner_type='user']

groups (1) ─┬─> (N) group_members
            ├─> (N) events
            ├─> (N) venues
            ├─> (N) invites
            ├─> (N) charges
            ├─> (1) draw_configs
            ├─> (1) event_settings
            └─> (1) wallets [owner_type='group']

events (1) ─┬─> (N) event_attendance
            ├─> (N) teams
            ├─> (N) event_actions
            └─> (N) player_ratings

teams (1) ──> (N) team_members
```

---

**Última atualização:** 23 de Janeiro de 2026
**Total de tabelas documentadas:** 17
