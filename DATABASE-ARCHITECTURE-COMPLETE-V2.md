# 🗄️ ARQUITETURA DE BANCO DE DADOS COMPLETA - PELADEIROS V2.0

**Documento de Especificação Técnica de Banco de Dados**
**Versão:** 2.0.0
**Data:** 2026-01-21
**Database:** PostgreSQL 15+ (Neon Serverless)
**Baseado em:** Arquitetura ERP-UzzAI + Boas Práticas Enterprise

---

## 📋 ÍNDICE

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Princípios de Design](#2-princípios-de-design)
3. [Schema Core (Grupos e Eventos)](#3-schema-core-grupos-e-eventos)
4. [Schema de Jogadores e Estatísticas](#4-schema-de-jogadores-e-estatísticas)
5. [Schema Financeiro e Pagamentos](#5-schema-financeiro-e-pagamentos)
6. [Schema de Notificações](#6-schema-de-notificações)
7. [Schema de Analytics e Métricas](#7-schema-de-analytics-e-métricas)
8. [Schema de Conquistas e Gamificação](#8-schema-de-conquistas-e-gamificação)
9. [Schema de Planilhas de Treino](#9-schema-de-planilhas-de-treino)
10. [Schema de Integrações](#10-schema-de-integrações)
11. [Schema de Auditoria e Compliance](#11-schema-de-auditoria-e-compliance)
12. [Schema de Multi-Modalidades (Futuro)](#12-schema-de-multi-modalidades-futuro)
13. [Índices e Performance](#13-índices-e-performance)
14. [Row Level Security (RLS)](#14-row-level-security-rls)
15. [Triggers e Funções](#15-triggers-e-funções)
16. [Views Materializadas](#16-views-materializadas)
17. [Migrations Strategy](#17-migrations-strategy)
18. [Diagrama ER Completo](#18-diagrama-er-completo)

---

## 1. VISÃO GERAL DA ARQUITETURA

### 1.1 Filosofia de Design

A arquitetura do banco de dados do ResenhApp V2.0 segue os princípios:

1. **Normalização até 3NF** - Evitar redundância, garantir integridade
2. **Códigos Únicos Estruturados** - Identificadores legíveis (G-001, E-2025-042)
3. **Auditoria Completa** - created_at, updated_at, created_by em todas as tabelas
4. **Soft Delete** - deleted_at para recuperação de dados
5. **JSONB para Flexibilidade** - Metadados e configs customizáveis
6. **Multi-Tenancy Ready** - Preparado para SaaS (tenant_id opcional)
7. **Performance First** - Índices estratégicos, views materializadas
8. **Type Safety** - CHECK constraints, ENUMs, foreign keys

### 1.2 Tecnologias

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| **Database** | PostgreSQL | 15+ |
| **Hosting** | Neon Serverless | Latest |
| **Client** | @neondatabase/serverless | Latest |
| **Migrations** | SQL Files (manual) | - |
| **Backup** | Neon Point-in-Time Recovery | - |

### 1.3 Estatísticas do Schema

```
Total de Tabelas: 50+
- Core: 15 tabelas
- Financeiro: 8 tabelas
- Analytics: 10 tabelas
- Gamificação: 6 tabelas
- Integrações: 5 tabelas
- Auditoria: 6 tabelas

Total de Índices: 100+
Views Materializadas: 8
Triggers: 15
Functions: 20
```

---

## 2. PRINCÍPIOS DE DESIGN

### 2.1 Convenções de Nomenclatura

#### Tabelas
- **Singular, snake_case**: `user`, `group`, `event`
- **Tabelas de relacionamento**: `group_member`, `event_attendance`
- **Tabelas de log**: prefixo `audit_` → `audit_user_actions`
- **Tabelas de métricas**: prefixo `metric_` → `metric_group_analytics`

#### Colunas
- **snake_case**: `created_at`, `user_id`, `is_active`
- **Booleanos**: prefixo `is_`, `has_`, `can_`
- **Datas**: sufixo `_at` para timestamps, `_date` para dates
- **Enums**: sem prefixo/sufixo → `status`, `role`, `type`

#### Códigos Únicos
- **Grupos**: `G-{number}` → `G-001`, `G-042`
- **Eventos**: `E-{year}-{number}` → `E-2025-001`
- **Usuários**: `P-{number}` → `P-00123` (Player)
- **Conquistas**: `ACH-{category}-{number}` → `ACH-GOAL-001`
- **Transações**: `TXN-{year}-{number}` → `TXN-2025-00042`

### 2.2 Tipos de Dados Padrão

```sql
-- IDs
id BIGSERIAL PRIMARY KEY

-- UUIDs (opcional, para multi-tenancy)
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
deleted_at TIMESTAMPTZ -- Soft delete

-- Monetário
amount DECIMAL(10,2) -- Até R$ 99.999.999,99

-- Percentuais
percentage DECIMAL(5,2) -- Até 999.99%

-- Enums (usar TEXT + CHECK constraint)
status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed'))

-- Metadados flexíveis
metadata JSONB

-- Arrays
tags TEXT[]
```

### 2.3 Constraints Obrigatórios

Toda tabela DEVE ter:

```sql
CREATE TABLE example (
  id BIGSERIAL PRIMARY KEY,

  -- Audit fields (OBRIGATÓRIO)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by BIGINT REFERENCES users(id),
  updated_by BIGINT REFERENCES users(id),

  -- Soft delete (OBRIGATÓRIO)
  deleted_at TIMESTAMPTZ,

  -- Outros campos...
);

-- Trigger de atualização automática
CREATE TRIGGER update_example_updated_at
BEFORE UPDATE ON example
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. SCHEMA CORE (GRUPOS E EVENTOS)

### 3.1 Tabela: `users`

Usuários do sistema (jogadores, organizadores).

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- P-00123

  -- Autenticação
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,

  -- Perfil
  name TEXT NOT NULL,
  nickname TEXT, -- Apelido do jogador
  avatar_url TEXT,
  phone TEXT,

  -- Endereço
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',

  -- Preferências
  preferred_position TEXT, -- goleiro, zagueiro, meia, atacante
  preferred_foot TEXT CHECK (preferred_foot IN ('right', 'left', 'both')),

  -- Configurações
  settings JSONB DEFAULT '{}', -- { theme: 'dark', language: 'pt-BR' }

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- Verificação de identidade

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL,
  INDEX idx_users_code ON users(code),
  INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL
);

-- Código sequencial automático
CREATE SEQUENCE user_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := 'P-' || LPAD(nextval('user_code_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_user_code_trigger
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION generate_user_code();
```

**Comentários:**
- `code`: Identificador legível humano (`P-00001`)
- `password_hash`: bcrypt com salt (10 rounds)
- `preferred_position`: Usado para sorteio inteligente
- `settings`: Configurações personalizadas do usuário

---

### 3.2 Tabela: `groups`

Grupos de pelada (ex: "Futebol de Quinta").

```sql
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- G-001

  -- Informações Básicas
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,

  -- Configurações
  is_private BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 100,

  -- Localização
  default_venue_id BIGINT REFERENCES venues(id),
  city TEXT,
  state TEXT,

  -- Configurações de Jogo
  default_max_players INTEGER DEFAULT 20,
  default_max_goalkeepers INTEGER DEFAULT 2,
  default_event_cost DECIMAL(10,2), -- Custo padrão por evento

  -- Configurações de Sorteio
  draw_strategy TEXT DEFAULT 'random' CHECK (
    draw_strategy IN ('random', 'balanced', 'skill_based', 'manual')
  ),
  draw_config JSONB DEFAULT '{}', -- Configurações customizadas

  -- Regras e Descrição
  rules TEXT, -- Regras do grupo (markdown)

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),

  -- Estatísticas (cache)
  total_members INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,

  -- Audit
  created_by BIGINT REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by BIGINT REFERENCES users(id),
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_groups_code ON groups(code),
  INDEX idx_groups_created_by ON groups(created_by),
  INDEX idx_groups_status ON groups(status) WHERE deleted_at IS NULL
);

-- Código sequencial automático
CREATE SEQUENCE group_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := 'G-' || LPAD(nextval('group_code_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_group_code_trigger
BEFORE INSERT ON groups
FOR EACH ROW EXECUTE FUNCTION generate_group_code();
```

**Comentários:**
- `draw_strategy`: Define algoritmo de sorteio (random, balanceado por skill, etc.)
- `draw_config`: JSONB com configurações específicas (ex: peso de posições)
- `total_*`: Campos denormalizados para performance (atualizados por triggers)

---

### 3.3 Tabela: `group_members`

Relacionamento entre usuários e grupos (com roles).

```sql
CREATE TABLE group_members (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Role no Grupo
  role TEXT NOT NULL DEFAULT 'member' CHECK (
    role IN ('admin', 'moderator', 'member')
  ),

  -- Informações do Jogador
  is_goalkeeper BOOLEAN DEFAULT FALSE,
  base_rating DECIMAL(3,2) DEFAULT 5.0 CHECK (base_rating >= 1.0 AND base_rating <= 10.0),
  -- Rating de 1.0 a 10.0 (usado para sorteio balanceado)

  custom_nickname TEXT, -- Apelido específico neste grupo
  jersey_number INTEGER, -- Número da camisa preferido

  -- Estatísticas do Jogador no Grupo (cache)
  total_events_participated INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_yellow_cards INTEGER DEFAULT 0,
  total_red_cards INTEGER DEFAULT 0,
  total_mvp_votes INTEGER DEFAULT 0,

  -- Frequência
  attendance_rate DECIMAL(5,2), -- Percentual de presença (calculado)
  last_participated_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  invited_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(group_id, user_id),

  -- Indexes
  INDEX idx_group_members_group ON group_members(group_id) WHERE deleted_at IS NULL,
  INDEX idx_group_members_user ON group_members(user_id) WHERE deleted_at IS NULL,
  INDEX idx_group_members_role ON group_members(group_id, role) WHERE deleted_at IS NULL
);
```

**Comentários:**
- `base_rating`: Skill do jogador (1-10), usado para sorteio balanceado
- `total_*`: Estatísticas denormalizadas (atualizadas por triggers)
- `attendance_rate`: Percentual de confirmações vs. total de eventos

---

### 3.4 Tabela: `venues`

Locais de jogo (campos, quadras).

```sql
CREATE TABLE venues (
  id BIGSERIAL PRIMARY KEY,

  -- Informações Básicas
  name TEXT NOT NULL,
  description TEXT,
  venue_type TEXT CHECK (venue_type IN ('field', 'indoor', 'beach', 'street')),

  -- Endereço Completo
  address TEXT NOT NULL,
  address_complement TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  country TEXT DEFAULT 'BR',

  -- Geolocalização
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Capacidade
  max_capacity INTEGER,
  has_changing_rooms BOOLEAN DEFAULT FALSE,
  has_shower BOOLEAN DEFAULT FALSE,
  has_lighting BOOLEAN DEFAULT FALSE, -- Iluminação para jogos noturnos
  has_parking BOOLEAN DEFAULT FALSE,

  -- Contato
  phone TEXT,
  whatsapp TEXT,
  website TEXT,

  -- Disponibilidade
  opening_hours JSONB, -- { "mon": "08:00-22:00", "tue": "08:00-22:00", ... }

  -- Fotos
  photos TEXT[], -- Array de URLs de fotos

  -- Rating
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,

  -- Audit
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_venues_city_state ON venues(city, state) WHERE deleted_at IS NULL,
  INDEX idx_venues_location ON venues USING GIST (
    point(longitude, latitude)
  ) WHERE deleted_at IS NULL,
  INDEX idx_venues_type ON venues(venue_type) WHERE deleted_at IS NULL
);
```

**Comentários:**
- `latitude/longitude`: Usado para busca por proximidade
- `opening_hours`: JSONB flexível para horários de funcionamento
- `average_rating`: Rating médio (calculado por trigger)

---

### 3.5 Tabela: `events`

Eventos/Partidas agendadas.

```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- E-2025-001

  -- Relacionamentos
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  venue_id BIGINT REFERENCES venues(id),

  -- Informações Básicas
  title TEXT NOT NULL,
  description TEXT,

  -- Agendamento
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60
  ) STORED,

  -- Limites
  max_players INTEGER NOT NULL DEFAULT 20,
  max_goalkeepers INTEGER DEFAULT 2,
  min_players INTEGER DEFAULT 10, -- Mínimo para confirmar o evento

  -- Confirmações
  total_confirmed INTEGER DEFAULT 0,
  total_waitlist INTEGER DEFAULT 0,
  total_declined INTEGER DEFAULT 0,

  -- Custo e Financeiro
  cost_per_player DECIMAL(10,2),
  cost_total DECIMAL(10,2), -- Custo total do evento (aluguel, etc.)

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',   -- Agendado
    'confirmed',   -- Confirmado (min_players atingido)
    'in_progress', -- Em andamento
    'completed',   -- Finalizado
    'cancelled'    -- Cancelado
  )),

  -- Resultado do Jogo
  match_played BOOLEAN DEFAULT FALSE,
  home_team_score INTEGER,
  away_team_score INTEGER,

  -- Configurações
  allow_waitlist BOOLEAN DEFAULT TRUE,
  auto_confirm_waitlist BOOLEAN DEFAULT TRUE, -- Move automaticamente da waitlist
  close_rsvp_hours_before INTEGER DEFAULT 2, -- Fechar RSVP X horas antes
  rsvp_closed BOOLEAN DEFAULT FALSE,
  rsvp_closed_at TIMESTAMPTZ,

  -- Notificações
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,

  -- Sorteio
  teams_drawn BOOLEAN DEFAULT FALSE,
  teams_drawn_at TIMESTAMPTZ,
  teams_drawn_by BIGINT REFERENCES users(id),

  -- Localização (override do venue)
  custom_location TEXT,
  custom_address TEXT,

  -- Metadados
  metadata JSONB DEFAULT '{}', -- Campos customizados

  -- Audit
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by BIGINT REFERENCES users(id),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CHECK (ends_at > starts_at),
  CHECK (max_players >= min_players),

  -- Indexes
  INDEX idx_events_code ON events(code),
  INDEX idx_events_group ON events(group_id) WHERE deleted_at IS NULL,
  INDEX idx_events_starts_at ON events(starts_at) WHERE deleted_at IS NULL,
  INDEX idx_events_status ON events(status) WHERE deleted_at IS NULL,
  INDEX idx_events_future ON events(starts_at) WHERE starts_at > NOW() AND deleted_at IS NULL
);

-- Código sequencial automático por ano
CREATE OR REPLACE FUNCTION generate_event_code()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'E-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM events
  WHERE code LIKE 'E-' || current_year || '-%';

  NEW.code := 'E-' || current_year || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_event_code_trigger
BEFORE INSERT ON events
FOR EACH ROW EXECUTE FUNCTION generate_event_code();
```

**Comentários:**
- `code`: Formato `E-2025-001` (ano + sequencial)
- `total_confirmed`: Atualizado por trigger quando `event_attendance` muda
- `auto_confirm_waitlist`: Move automaticamente jogadores da waitlist quando alguém cancela
- `close_rsvp_hours_before`: RSVP fecha automaticamente X horas antes do evento

---

### 3.6 Tabela: `event_attendance`

RSVP e presença nos eventos.

```sql
CREATE TABLE event_attendance (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_member_id BIGINT NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,

  -- Status de Confirmação
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',   -- Sem resposta
    'yes',       -- Confirmado
    'no',        -- Recusou
    'maybe',     -- Talvez
    'waitlist'   -- Lista de espera
  )),

  -- Check-in
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by BIGINT REFERENCES users(id), -- Admin que fez check-in

  -- Ordem de Chegada
  order_of_arrival INTEGER, -- 1º, 2º, 3º...

  -- Time Sorteado
  team_id BIGINT REFERENCES teams(id), -- NULL se ainda não sorteado

  -- Posição no Jogo
  played_as_goalkeeper BOOLEAN DEFAULT FALSE,

  -- Histórico de Mudanças
  status_history JSONB DEFAULT '[]', -- [{ status: 'yes', changed_at: '...' }]

  -- Notificações
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(event_id, user_id),

  -- Indexes
  INDEX idx_event_attendance_event ON event_attendance(event_id) WHERE deleted_at IS NULL,
  INDEX idx_event_attendance_user ON event_attendance(user_id) WHERE deleted_at IS NULL,
  INDEX idx_event_attendance_status ON event_attendance(event_id, status) WHERE deleted_at IS NULL,
  INDEX idx_event_attendance_checkin ON event_attendance(event_id, checked_in) WHERE deleted_at IS NULL
);

-- Trigger para atualizar contadores no evento
CREATE OR REPLACE FUNCTION update_event_attendance_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE events SET
      total_confirmed = (
        SELECT COUNT(*) FROM event_attendance
        WHERE event_id = NEW.event_id AND status = 'yes' AND deleted_at IS NULL
      ),
      total_waitlist = (
        SELECT COUNT(*) FROM event_attendance
        WHERE event_id = NEW.event_id AND status = 'waitlist' AND deleted_at IS NULL
      ),
      total_declined = (
        SELECT COUNT(*) FROM event_attendance
        WHERE event_id = NEW.event_id AND status = 'no' AND deleted_at IS NULL
      ),
      updated_at = NOW()
    WHERE id = NEW.event_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE events SET
      total_confirmed = (
        SELECT COUNT(*) FROM event_attendance
        WHERE event_id = OLD.event_id AND status = 'yes' AND deleted_at IS NULL
      ),
      total_waitlist = (
        SELECT COUNT(*) FROM event_attendance
        WHERE event_id = OLD.event_id AND status = 'waitlist' AND deleted_at IS NULL
      ),
      total_declined = (
        SELECT COUNT(*) FROM event_attendance
        WHERE event_id = OLD.event_id AND status = 'no' AND deleted_at IS NULL
      ),
      updated_at = NOW()
    WHERE id = OLD.event_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_attendance_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON event_attendance
FOR EACH ROW EXECUTE FUNCTION update_event_attendance_counts();
```

**Comentários:**
- `order_of_arrival`: Usado para priorizar jogadores em caso de empate
- `status_history`: JSONB com histórico completo de mudanças de status
- Trigger atualiza contadores no `events` automaticamente

---

### 3.7 Tabela: `teams`

Times sorteados para um evento.

```sql
CREATE TABLE teams (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Informações do Time
  team_number INTEGER NOT NULL CHECK (team_number IN (1, 2)), -- Time 1 ou 2
  name TEXT, -- Ex: "Time Azul", "Time Vermelho"
  color TEXT, -- Hex color: "#FF0000"

  -- Estatísticas do Time (cache)
  total_players INTEGER DEFAULT 0,
  total_goalkeepers INTEGER DEFAULT 0,
  average_skill_rating DECIMAL(3,2), -- Média do base_rating dos jogadores

  -- Resultado
  goals_scored INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(event_id, team_number),

  -- Indexes
  INDEX idx_teams_event ON teams(event_id) WHERE deleted_at IS NULL
);
```

---

### 3.8 Tabela: `team_members`

Jogadores alocados em cada time.

```sql
CREATE TABLE team_members (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  event_attendance_id BIGINT NOT NULL REFERENCES event_attendance(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Posição no Jogo
  is_goalkeeper BOOLEAN DEFAULT FALSE,
  position TEXT, -- goleiro, zagueiro, meia, atacante

  -- Estatísticas do Jogo (preenchidas durante/após)
  goals_scored INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,

  -- Avaliação
  performance_rating DECIMAL(3,2), -- 1.0 a 10.0

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(team_id, user_id),

  -- Indexes
  INDEX idx_team_members_team ON team_members(team_id) WHERE deleted_at IS NULL,
  INDEX idx_team_members_user ON team_members(user_id) WHERE deleted_at IS NULL
);
```

---

### 3.9 Tabela: `event_actions`

Ações durante o jogo (gols, assistências, cartões).

```sql
CREATE TABLE event_actions (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Tipo de Ação
  action_type TEXT NOT NULL CHECK (action_type IN (
    'goal',
    'assist',
    'own_goal',     -- Gol contra
    'yellow_card',
    'red_card',
    'penalty_goal',
    'penalty_miss'
  )),

  -- Contexto
  minute INTEGER, -- Minuto do jogo
  description TEXT,

  -- Assistência (para gols)
  assisted_by BIGINT REFERENCES users(id),

  -- Validação
  verified BOOLEAN DEFAULT FALSE,
  verified_by BIGINT REFERENCES users(id),
  verified_at TIMESTAMPTZ,

  -- Audit
  recorded_by BIGINT NOT NULL REFERENCES users(id), -- Quem registrou a ação
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_event_actions_event ON event_actions(event_id) WHERE deleted_at IS NULL,
  INDEX idx_event_actions_user ON event_actions(user_id) WHERE deleted_at IS NULL,
  INDEX idx_event_actions_type ON event_actions(event_id, action_type) WHERE deleted_at IS NULL
);

-- Trigger para atualizar estatísticas do jogador
CREATE OR REPLACE FUNCTION update_player_stats_from_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Atualizar team_members
    IF NEW.action_type = 'goal' THEN
      UPDATE team_members
      SET goals_scored = goals_scored + 1
      WHERE team_id = NEW.team_id AND user_id = NEW.user_id;

      -- Atualizar team
      UPDATE teams
      SET goals_scored = goals_scored + 1
      WHERE id = NEW.team_id;
    END IF;

    IF NEW.action_type = 'assist' THEN
      UPDATE team_members
      SET assists = assists + 1
      WHERE team_id = NEW.team_id AND user_id = NEW.user_id;
    END IF;

    IF NEW.action_type = 'yellow_card' THEN
      UPDATE team_members
      SET yellow_cards = yellow_cards + 1
      WHERE team_id = NEW.team_id AND user_id = NEW.user_id;
    END IF;

    IF NEW.action_type = 'red_card' THEN
      UPDATE team_members
      SET red_cards = red_cards + 1
      WHERE team_id = NEW.team_id AND user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_stats_from_action_trigger
AFTER INSERT ON event_actions
FOR EACH ROW EXECUTE FUNCTION update_player_stats_from_action();
```

---

### 3.10 Tabela: `votes`

Sistema de votação (Destaque da Partida, avaliações).

```sql
CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  voter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_for_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Tipo de Voto
  vote_type TEXT NOT NULL CHECK (vote_type IN (
    'mvp',           -- Destaque da Partida
    'best_goalkeeper',
    'best_defender',
    'best_midfielder',
    'best_striker',
    'fair_play'
  )),

  -- Comentário (opcional)
  comment TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(event_id, voter_id, vote_type), -- Um voto de cada tipo por pessoa
  CHECK (voter_id != voted_for_id), -- Não pode votar em si mesmo

  -- Indexes
  INDEX idx_votes_event ON votes(event_id) WHERE deleted_at IS NULL,
  INDEX idx_votes_voted_for ON votes(voted_for_id) WHERE deleted_at IS NULL,
  INDEX idx_votes_type ON votes(event_id, vote_type) WHERE deleted_at IS NULL
);
```

---

## 4. SCHEMA DE JOGADORES E ESTATÍSTICAS

### 4.1 Tabela: `player_statistics`

Estatísticas agregadas por jogador (por grupo).

```sql
CREATE TABLE player_statistics (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Período de Referência
  period_type TEXT NOT NULL CHECK (period_type IN ('all_time', 'season', 'month', 'week')),
  period_start DATE,
  period_end DATE,

  -- Estatísticas de Participação
  total_events_invited INTEGER DEFAULT 0,
  total_events_confirmed INTEGER DEFAULT 0,
  total_events_attended INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2), -- Percentual de presença

  -- Estatísticas de Jogo
  total_games_played INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),

  -- Estatísticas Técnicas
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_own_goals INTEGER DEFAULT 0,
  total_yellow_cards INTEGER DEFAULT 0,
  total_red_cards INTEGER DEFAULT 0,

  -- Médias
  avg_goals_per_game DECIMAL(4,2),
  avg_assists_per_game DECIMAL(4,2),

  -- Votações
  total_mvp_votes INTEGER DEFAULT 0,
  total_best_goalkeeper_votes INTEGER DEFAULT 0,
  total_best_defender_votes INTEGER DEFAULT 0,
  total_best_midfielder_votes INTEGER DEFAULT 0,
  total_best_striker_votes INTEGER DEFAULT 0,
  total_fair_play_votes INTEGER DEFAULT 0,

  -- Posições Jogadas
  times_played_as_goalkeeper INTEGER DEFAULT 0,
  times_played_as_defender INTEGER DEFAULT 0,
  times_played_as_midfielder INTEGER DEFAULT 0,
  times_played_as_striker INTEGER DEFAULT 0,

  -- Performance Rating
  overall_rating DECIMAL(3,2), -- Média ponderada de várias métricas
  skill_rating DECIMAL(3,2), -- Rating técnico (calculado)

  -- Audit
  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(user_id, group_id, period_type, period_start),

  -- Indexes
  INDEX idx_player_stats_user_group ON player_statistics(user_id, group_id),
  INDEX idx_player_stats_period ON player_statistics(group_id, period_type, period_start)
);
```

**Comentários:**
- Tabela **denormalizada** para performance (calculada periodicamente)
- `period_type`: 'all_time', 'season', 'month', 'week'
- Atualizada por job agendado (daily) ou on-demand

---

## 5. SCHEMA FINANCEIRO E PAGAMENTOS

### 5.1 Tabela: `wallets`

Carteiras (grupo e usuários).

```sql
CREATE TABLE wallets (
  id BIGSERIAL PRIMARY KEY,

  -- Owner (Grupo ou Usuário)
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,

  -- Tipo de Carteira
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('group', 'user')),

  -- Saldo
  balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CHECK (
    (wallet_type = 'group' AND group_id IS NOT NULL AND user_id IS NULL) OR
    (wallet_type = 'user' AND user_id IS NOT NULL AND group_id IS NULL)
  ),

  -- Indexes
  INDEX idx_wallets_group ON wallets(group_id) WHERE deleted_at IS NULL,
  INDEX idx_wallets_user ON wallets(user_id) WHERE deleted_at IS NULL
);
```

---

### 5.2 Tabela: `charges`

Cobranças por evento.

```sql
CREATE TABLE charges (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- CHG-2025-001

  -- Relacionamentos
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,

  -- Informações da Cobrança
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),

  -- Split entre jogadores
  split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'custom', 'per_player')),
  total_players INTEGER, -- Número de jogadores para split

  -- Datas
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),

  -- Audit
  created_by BIGINT NOT NULL REFERENCES users(id),
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_charges_group ON charges(group_id) WHERE deleted_at IS NULL,
  INDEX idx_charges_event ON charges(event_id) WHERE deleted_at IS NULL,
  INDEX idx_charges_status ON charges(status) WHERE deleted_at IS NULL
);

-- Código sequencial automático
CREATE SEQUENCE charge_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_charge_code()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'CHG-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM charges
  WHERE code LIKE 'CHG-' || current_year || '-%';

  NEW.code := 'CHG-' || current_year || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_charge_code_trigger
BEFORE INSERT ON charges
FOR EACH ROW EXECUTE FUNCTION generate_charge_code();
```

---

### 5.3 Tabela: `transactions`

Transações financeiras (pagamentos).

```sql
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- TXN-2025-00042

  -- Relacionamentos
  wallet_id BIGINT NOT NULL REFERENCES wallets(id),
  charge_id BIGINT REFERENCES charges(id) ON DELETE SET NULL,
  user_id BIGINT NOT NULL REFERENCES users(id),
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,

  -- Tipo de Transação
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'charge',      -- Cobrança
    'payment',     -- Pagamento
    'refund',      -- Estorno
    'adjustment'   -- Ajuste manual
  )),

  -- Valores
  amount DECIMAL(10,2) NOT NULL,

  -- Descrição
  description TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )),

  -- Método de Pagamento
  payment_method TEXT CHECK (payment_method IN (
    'pix',
    'cash',
    'credit_card',
    'debit_card',
    'bank_transfer'
  )),

  -- Comprovante
  receipt_url TEXT,

  -- Metadados
  metadata JSONB DEFAULT '{}', -- Dados adicionais (ex: ID transação Pix)

  -- Audit
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_transactions_wallet ON transactions(wallet_id) WHERE deleted_at IS NULL,
  INDEX idx_transactions_user ON transactions(user_id) WHERE deleted_at IS NULL,
  INDEX idx_transactions_charge ON transactions(charge_id) WHERE deleted_at IS NULL,
  INDEX idx_transactions_status ON transactions(status) WHERE deleted_at IS NULL,
  INDEX idx_transactions_code ON transactions(code)
);

-- Código sequencial automático
CREATE SEQUENCE transaction_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_transaction_code()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'TXN-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM transactions
  WHERE code LIKE 'TXN-' || current_year || '-%';

  NEW.code := 'TXN-' || current_year || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_transaction_code_trigger
BEFORE INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION generate_transaction_code();
```

---

### 5.4 Tabela: `group_pix_config`

Configuração de Pix do grupo (Split Pix).

```sql
CREATE TABLE group_pix_config (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  group_id BIGINT NOT NULL UNIQUE REFERENCES groups(id) ON DELETE CASCADE,

  -- Chave Pix
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),

  -- Dados do Recebedor
  merchant_name TEXT NOT NULL,
  merchant_city TEXT NOT NULL,

  -- Status
  enabled BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE, -- Chave Pix verificada

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_group_pix_config_group ON group_pix_config(group_id) WHERE deleted_at IS NULL
);
```

---

### 5.5 Tabela: `pix_qr_codes`

QR Codes Pix gerados para eventos.

```sql
CREATE TABLE pix_qr_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- PIX-2025-00123

  -- Relacionamentos
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charge_id BIGINT REFERENCES charges(id) ON DELETE SET NULL,

  -- Valor
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),

  -- QR Code
  qr_code_payload TEXT NOT NULL, -- EMV do Pix Copia e Cola
  qr_code_image_url TEXT, -- URL da imagem do QR Code

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'paid',
    'expired',
    'cancelled'
  )),

  -- Datas
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,

  -- Metadados
  metadata JSONB DEFAULT '{}', -- Dados adicionais da transação

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(event_id, user_id),

  -- Indexes
  INDEX idx_pix_qr_codes_event ON pix_qr_codes(event_id) WHERE deleted_at IS NULL,
  INDEX idx_pix_qr_codes_user ON pix_qr_codes(user_id) WHERE deleted_at IS NULL,
  INDEX idx_pix_qr_codes_status ON pix_qr_codes(event_id, status) WHERE deleted_at IS NULL,
  INDEX idx_pix_qr_codes_code ON pix_qr_codes(code)
);

-- Código sequencial automático
CREATE SEQUENCE pix_qr_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_pix_qr_code()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'PIX-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM pix_qr_codes
  WHERE code LIKE 'PIX-' || current_year || '-%';

  NEW.code := 'PIX-' || current_year || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_pix_qr_code_trigger
BEFORE INSERT ON pix_qr_codes
FOR EACH ROW EXECUTE FUNCTION generate_pix_qr_code();
```

---

## 6. SCHEMA DE NOTIFICAÇÕES

### 6.1 Tabela: `notifications`

Notificações para usuários.

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Tipo de Notificação
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'rsvp_reminder',        -- Lembrete de confirmação
    'event_update',         -- Evento atualizado
    'event_cancelled',      -- Evento cancelado
    'waitlist_moved',       -- Movido da waitlist
    'team_draw',            -- Times sorteados
    'payment_due',          -- Pagamento pendente
    'payment_received',     -- Pagamento recebido
    'new_member',           -- Novo membro no grupo
    'achievement_unlocked', -- Conquista desbloqueada
    'mention',              -- Mencionado em comentário
    'system'                -- Notificação do sistema
  )),

  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Link para ação

  -- Contexto
  entity_type TEXT, -- 'event', 'group', 'user', 'charge'
  entity_id BIGINT, -- ID da entidade relacionada

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Prioridade
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Metadados
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC) WHERE deleted_at IS NULL,
  INDEX idx_notifications_type ON notifications(notification_type) WHERE deleted_at IS NULL,
  INDEX idx_notifications_unread ON notifications(user_id) WHERE read = FALSE AND deleted_at IS NULL
);
```

---

### 6.2 Tabela: `notification_preferences`

Preferências de notificação por usuário.

```sql
CREATE TABLE notification_preferences (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Canais
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT FALSE,

  -- Tipos de Notificações
  rsvp_reminders BOOLEAN DEFAULT TRUE,
  event_updates BOOLEAN DEFAULT TRUE,
  payment_reminders BOOLEAN DEFAULT TRUE,
  team_draws BOOLEAN DEFAULT TRUE,
  achievements BOOLEAN DEFAULT TRUE,
  mentions BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE,

  -- Frequência
  digest_enabled BOOLEAN DEFAULT FALSE, -- Resumo diário
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly')),
  digest_time TIME DEFAULT '09:00:00', -- Horário do resumo

  -- Horário Silencioso (Do Not Disturb)
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_notification_prefs_user ON notification_preferences(user_id)
);
```

---

### 6.3 Tabela: `push_tokens`

Tokens de push notification (FCM).

```sql
CREATE TABLE push_tokens (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Token
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),

  -- Device Info
  device_name TEXT,
  device_os TEXT,
  browser TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(user_id, token),

  -- Indexes
  INDEX idx_push_tokens_user ON push_tokens(user_id) WHERE is_active = TRUE,
  INDEX idx_push_tokens_token ON push_tokens(token)
);
```

---

## 7. SCHEMA DE ANALYTICS E MÉTRICAS

### 7.1 Tabela: `group_metrics`

Métricas agregadas por grupo.

```sql
CREATE TABLE group_metrics (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Período de Referência
  metric_date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),

  -- Métricas de Eventos
  total_events INTEGER DEFAULT 0,
  total_events_completed INTEGER DEFAULT 0,
  total_events_cancelled INTEGER DEFAULT 0,
  avg_attendance_rate DECIMAL(5,2),

  -- Métricas de Jogadores
  total_active_players INTEGER DEFAULT 0,
  total_new_players INTEGER DEFAULT 0,
  total_inactive_players INTEGER DEFAULT 0,

  -- Métricas de Jogo
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  avg_goals_per_event DECIMAL(4,2),

  -- Métricas Financeiras
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_expenses DECIMAL(10,2) DEFAULT 0,
  net_balance DECIMAL(10,2) DEFAULT 0,

  -- Engagement
  avg_rsvp_response_time_hours DECIMAL(6,2),
  total_notifications_sent INTEGER DEFAULT 0,
  notification_open_rate DECIMAL(5,2),

  -- Audit
  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(group_id, metric_date, period_type),

  -- Indexes
  INDEX idx_group_metrics_group_date ON group_metrics(group_id, metric_date DESC),
  INDEX idx_group_metrics_period ON group_metrics(group_id, period_type, metric_date DESC)
);
```

---

### 7.2 Tabela: `metric_trends`

Tendências e comparações entre períodos.

```sql
CREATE TABLE metric_trends (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Métrica
  metric_type TEXT NOT NULL, -- 'attendance', 'revenue', 'goals', 'active_players'

  -- Valores
  current_value DECIMAL(10,2) NOT NULL,
  previous_value DECIMAL(10,2) NOT NULL,
  change_value DECIMAL(10,2) GENERATED ALWAYS AS (current_value - previous_value) STORED,
  change_percent DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN previous_value = 0 THEN 0
      ELSE ((current_value - previous_value) / previous_value) * 100
    END
  ) STORED,

  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  comparison_period_start DATE,
  comparison_period_end DATE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_metric_trends_group ON metric_trends(group_id, metric_type, created_at DESC)
);
```

---

### 7.3 Tabela: `event_metrics`

Métricas por evento individual.

```sql
CREATE TABLE event_metrics (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  event_id BIGINT NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,

  -- Métricas de Participação
  total_invited INTEGER DEFAULT 0,
  total_confirmed INTEGER DEFAULT 0,
  total_declined INTEGER DEFAULT 0,
  total_no_response INTEGER DEFAULT 0,
  total_attended INTEGER DEFAULT 0,

  -- Taxas
  confirmation_rate DECIMAL(5,2), -- % de confirmações
  attendance_rate DECIMAL(5,2), -- % de presença (vs confirmados)
  no_show_rate DECIMAL(5,2), -- % de faltosos (confirmou mas não foi)

  -- Tempo Médio
  avg_rsvp_response_time_hours DECIMAL(6,2),

  -- Métricas de Jogo
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_cards INTEGER DEFAULT 0,

  -- Votação
  total_votes_cast INTEGER DEFAULT 0,
  voting_participation_rate DECIMAL(5,2),

  -- Financeiro
  total_revenue DECIMAL(10,2) DEFAULT 0,
  collection_rate DECIMAL(5,2), -- % de pagamentos recebidos

  -- Audit
  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_event_metrics_event ON event_metrics(event_id)
);
```

---

### 7.4 Tabela: `user_activity_log`

Log de atividades do usuário (para analytics comportamental).

```sql
CREATE TABLE user_activity_log (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Atividade
  activity_type TEXT NOT NULL, -- 'page_view', 'rsvp', 'vote', 'payment', etc.
  activity_name TEXT NOT NULL,

  -- Contexto
  entity_type TEXT, -- 'event', 'group', 'user'
  entity_id BIGINT,

  -- Metadados
  metadata JSONB DEFAULT '{}', -- Dados adicionais (ex: página visitada, ação realizada)

  -- Device Info
  user_agent TEXT,
  ip_address INET,
  platform TEXT, -- 'web', 'mobile'

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_user_activity_user_time ON user_activity_log(user_id, created_at DESC),
  INDEX idx_user_activity_type ON user_activity_log(activity_type, created_at DESC),
  INDEX idx_user_activity_entity ON user_activity_log(entity_type, entity_id, created_at DESC)
);

-- Particionamento por mês (para performance)
-- CREATE TABLE user_activity_log_2025_01 PARTITION OF user_activity_log
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

## 8. SCHEMA DE CONQUISTAS E GAMIFICAÇÃO

### 8.1 Tabela: `achievement_types`

Tipos de conquistas disponíveis.

```sql
CREATE TABLE achievement_types (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- ACH-GOAL-001

  -- Informações
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Nome do ícone Lucide
  category TEXT NOT NULL CHECK (category IN (
    'goals',
    'assists',
    'attendance',
    'mvp',
    'streak',
    'milestones',
    'special'
  )),

  -- Raridade
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN (
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary'
  )),

  -- Critérios
  criteria_type TEXT NOT NULL, -- 'count', 'streak', 'percentage', 'special'
  criteria_value INTEGER, -- Valor necessário (ex: 10 gols)
  criteria_config JSONB, -- Configurações adicionais

  -- Pontos
  points INTEGER DEFAULT 0,

  -- Ordenação
  display_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE, -- Conquista secreta

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_achievement_types_category ON achievement_types(category) WHERE is_active = TRUE,
  INDEX idx_achievement_types_rarity ON achievement_types(rarity) WHERE is_active = TRUE
);
```

**Exemplos de Conquistas:**

```sql
-- Primeira pelada
INSERT INTO achievement_types (code, name, description, icon, category, rarity, criteria_type, criteria_value, points)
VALUES ('ACH-MILE-001', 'Estreante', 'Participou da primeira pelada', 'user-plus', 'milestones', 'common', 'count', 1, 10);

-- 10 gols
INSERT INTO achievement_types (code, name, description, icon, category, rarity, criteria_type, criteria_value, points)
VALUES ('ACH-GOAL-001', 'Artilheiro Iniciante', 'Marcou 10 gols', 'target', 'goals', 'uncommon', 'count', 10, 50);

-- Hat-trick
INSERT INTO achievement_types (code, name, description, icon, category, rarity, criteria_type, criteria_value, points)
VALUES ('ACH-GOAL-002', 'Hat-trick', 'Marcou 3 gols em uma única partida', 'zap', 'goals', 'rare', 'special', 3, 100);

-- Streak de 5 peladas
INSERT INTO achievement_types (code, name, description, icon, category, rarity, criteria_type, criteria_value, points)
VALUES ('ACH-STREAK-001', 'Frequentador', 'Participou de 5 peladas consecutivas', 'flame', 'streak', 'uncommon', 'streak', 5, 75);

-- 100% de presença no mês
INSERT INTO achievement_types (code, name, description, icon, category, rarity, criteria_type, criteria_value, points)
VALUES ('ACH-ATT-001', 'Presença Perfeita', '100% de presença no mês', 'check-circle', 'attendance', 'epic', 'percentage', 100, 150);

-- MVP 10 vezes
INSERT INTO achievement_types (code, name, description, icon, category, rarity, criteria_type, criteria_value, points)
VALUES ('ACH-MVP-001', 'Craque', 'Eleito MVP 10 vezes', 'award', 'mvp', 'epic', 'count', 10, 200);

-- Muralha (goleiro sem tomar gol)
INSERT INTO achievement_types (code, name, description, icon, category, rarity, criteria_type, criteria_value, points)
VALUES ('ACH-SPEC-001', 'Muralha', 'Não tomou nenhum gol como goleiro', 'shield', 'special', 'rare', 'special', 0, 100);
```

---

### 8.2 Tabela: `user_achievements`

Conquistas desbloqueadas por usuários.

```sql
CREATE TABLE user_achievements (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  achievement_type_id BIGINT NOT NULL REFERENCES achievement_types(id) ON DELETE CASCADE,

  -- Contexto do Desbloqueio
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL, -- Evento onde desbloqueou
  progress_value INTEGER, -- Valor atual quando desbloqueou (ex: 10 gols)

  -- Notificação
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,

  -- Audit
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(user_id, group_id, achievement_type_id),

  -- Indexes
  INDEX idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC),
  INDEX idx_user_achievements_group ON user_achievements(group_id, unlocked_at DESC),
  INDEX idx_user_achievements_type ON user_achievements(achievement_type_id)
);
```

---

### 8.3 Tabela: `leaderboards`

Rankings globais e por categoria.

```sql
CREATE TABLE leaderboards (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Categoria do Ranking
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN (
    'goals',
    'assists',
    'mvp',
    'attendance',
    'points', -- Pontos de conquistas
    'win_rate',
    'overall'
  )),

  -- Período
  period_type TEXT NOT NULL CHECK (period_type IN ('all_time', 'season', 'month', 'week')),
  period_start DATE,
  period_end DATE,

  -- Ranking
  rank INTEGER NOT NULL,
  score DECIMAL(10,2) NOT NULL,

  -- Metadados
  metadata JSONB DEFAULT '{}', -- Dados adicionais

  -- Audit
  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(group_id, user_id, leaderboard_type, period_type, period_start),

  -- Indexes
  INDEX idx_leaderboards_group_type ON leaderboards(group_id, leaderboard_type, rank),
  INDEX idx_leaderboards_period ON leaderboards(group_id, period_type, period_start)
);
```

---

## 9. SCHEMA DE PLANILHAS DE TREINO

### 9.1 Tabela: `training_plans`

Planilhas táticas (prancheta).

```sql
CREATE TABLE training_plans (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- TRN-2025-001

  -- Relacionamento
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by BIGINT NOT NULL REFERENCES users(id),

  -- Informações
  title TEXT NOT NULL,
  description TEXT,

  -- Dados da Jogada (JSON)
  drill_data JSONB NOT NULL, -- Posições, linhas, movimentos
  /*
  Exemplo de drill_data:
  {
    "field_type": "futsal",
    "players": [
      { "id": 1, "position": { "x": 50, "y": 50 }, "label": "GK", "color": "#FF0000" },
      { "id": 2, "position": { "x": 70, "y": 30 }, "label": "FW", "color": "#0000FF" }
    ],
    "ball": { "x": 60, "y": 60 },
    "lines": [
      { "from": { "x": 50, "y": 50 }, "to": { "x": 70, "y": 30 }, "type": "pass", "color": "#00FF00" }
    ],
    "annotations": [
      { "x": 80, "y": 20, "text": "Finalizar aqui", "color": "#FFFF00" }
    ]
  }
  */

  -- Categoria
  category TEXT CHECK (category IN (
    'set_piece',   -- Jogada ensaiada
    'tactical',    -- Tática
    'drill',       -- Treino
    'analysis'     -- Análise de jogo
  )),

  -- Template
  is_template BOOLEAN DEFAULT FALSE,
  template_name TEXT,

  -- Compartilhamento
  is_public BOOLEAN DEFAULT FALSE,

  -- Estatísticas
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_training_plans_group ON training_plans(group_id, created_at DESC) WHERE deleted_at IS NULL,
  INDEX idx_training_plans_created_by ON training_plans(created_by) WHERE deleted_at IS NULL,
  INDEX idx_training_plans_public ON training_plans(is_public) WHERE is_public = TRUE AND deleted_at IS NULL
);

-- Código sequencial automático
CREATE SEQUENCE training_plan_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_training_plan_code()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'TRN-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM training_plans
  WHERE code LIKE 'TRN-' || current_year || '-%';

  NEW.code := 'TRN-' || current_year || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_training_plan_code_trigger
BEFORE INSERT ON training_plans
FOR EACH ROW EXECUTE FUNCTION generate_training_plan_code();
```

---

## 10. SCHEMA DE INTEGRAÇÕES

### 10.1 Tabela: `invites`

Convites para entrar em grupos.

```sql
CREATE TABLE invites (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- INV-ABC123

  -- Relacionamento
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Gerado por
  created_by BIGINT NOT NULL REFERENCES users(id),

  -- Configurações
  max_uses INTEGER, -- NULL = ilimitado
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  revoked_by BIGINT REFERENCES users(id),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_invites_code ON invites(code) WHERE is_active = TRUE AND deleted_at IS NULL,
  INDEX idx_invites_group ON invites(group_id) WHERE deleted_at IS NULL
);

-- Gerar código único
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := 'INV-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invite_code_trigger
BEFORE INSERT ON invites
FOR EACH ROW EXECUTE FUNCTION generate_invite_code();
```

---

### 10.2 Tabela: `webhooks`

Webhooks para integrações externas (Zapier, IFTTT).

```sql
CREATE TABLE webhooks (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,

  -- Configuração
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['event.created', 'rsvp.updated', 'payment.received']

  -- Segurança
  secret TEXT, -- Secret para validação de assinatura

  -- Retries
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,

  -- Status
  is_enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  last_status TEXT, -- 'success', 'failed'
  last_error TEXT,

  -- Estatísticas
  total_triggered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_webhooks_group ON webhooks(group_id) WHERE is_enabled = TRUE AND deleted_at IS NULL,
  INDEX idx_webhooks_user ON webhooks(user_id) WHERE is_enabled = TRUE AND deleted_at IS NULL
);
```

---

### 10.3 Tabela: `webhook_logs`

Logs de execução de webhooks.

```sql
CREATE TABLE webhook_logs (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  webhook_id BIGINT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,

  -- Evento
  event_type TEXT NOT NULL,
  event_data JSONB,

  -- Request/Response
  request_url TEXT NOT NULL,
  request_method TEXT NOT NULL DEFAULT 'POST',
  request_headers JSONB,
  request_body JSONB,

  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'retrying')),
  error_message TEXT,

  -- Retry
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id, created_at DESC),
  INDEX idx_webhook_logs_status ON webhook_logs(status, next_retry_at)
);
```

---

## 11. SCHEMA DE AUDITORIA E COMPLIANCE

### 11.1 Tabela: `audit_logs`

Log de auditoria completo.

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

  -- Ação
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT NOT NULL, -- 'user', 'group', 'event', 'transaction'
  entity_id BIGINT,

  -- Dados Anteriores/Novos (para rollback)
  old_data JSONB,
  new_data JSONB,
  changes JSONB, -- Apenas os campos que mudaram

  -- Contexto
  ip_address INET,
  user_agent TEXT,
  request_id TEXT, -- ID da requisição (para rastreamento)

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC),
  INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC),
  INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC)
);

-- Particionamento por mês (para performance)
-- CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

### 11.2 Tabela: `sessions`

Sessões de usuários (para controle de acesso).

```sql
CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Token
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,

  -- Device Info
  device_name TEXT,
  device_os TEXT,
  browser TEXT,
  ip_address INET,

  -- Localização
  country TEXT,
  city TEXT,

  -- Timestamps
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  -- Indexes
  INDEX idx_sessions_user ON sessions(user_id) WHERE is_active = TRUE,
  INDEX idx_sessions_token ON sessions(token) WHERE is_active = TRUE,
  INDEX idx_sessions_expires ON sessions(expires_at) WHERE is_active = TRUE
);
```

---

## 12. SCHEMA DE MULTI-MODALIDADES (FUTURO)

### 12.1 Tabela: `sport_modalities`

Modalidades esportivas suportadas.

```sql
CREATE TABLE sport_modalities (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- 'football', 'volleyball', 'basketball'

  -- Informações
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- Nome do ícone Lucide

  -- Configurações Padrão
  default_players INTEGER NOT NULL, -- Ex: 20 para futebol
  default_goalkeepers INTEGER, -- NULL para esportes sem goleiro
  default_duration_minutes INTEGER DEFAULT 90,

  -- Regras Específicas
  rules_config JSONB, -- Configurações específicas da modalidade

  -- Status
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  INDEX idx_sport_modalities_code ON sport_modalities(code) WHERE is_enabled = TRUE
);

-- Dados iniciais
INSERT INTO sport_modalities (code, name, icon, default_players, default_goalkeepers, default_duration_minutes)
VALUES
  ('football', 'Futebol', 'circle-dot', 20, 2, 90),
  ('volleyball', 'Vôlei', 'waves', 12, 0, 60),
  ('basketball', 'Basquete', 'basketball', 10, 0, 40),
  ('futsal', 'Futsal', 'circle', 10, 2, 40);
```

---

### 12.2 Alteração: Adicionar modality_id em `groups`

```sql
-- Adicionar coluna de modalidade em groups
ALTER TABLE groups ADD COLUMN modality_id BIGINT REFERENCES sport_modalities(id);

-- Criar índice
CREATE INDEX idx_groups_modality ON groups(modality_id) WHERE deleted_at IS NULL;

-- Migração: Definir futebol como padrão para grupos existentes
UPDATE groups
SET modality_id = (SELECT id FROM sport_modalities WHERE code = 'football')
WHERE modality_id IS NULL;
```

---

## 13. ÍNDICES E PERFORMANCE

### 13.1 Índices Estratégicos Adicionais

```sql
-- Índices compostos para queries comuns
CREATE INDEX idx_event_attendance_event_status ON event_attendance(event_id, status, checked_in)
WHERE deleted_at IS NULL;

CREATE INDEX idx_group_members_group_active ON group_members(group_id, is_active)
WHERE deleted_at IS NULL;

CREATE INDEX idx_events_group_future ON events(group_id, starts_at)
WHERE starts_at > NOW() AND deleted_at IS NULL;

CREATE INDEX idx_player_stats_group_period ON player_statistics(group_id, period_type, user_id);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC)
WHERE read = FALSE AND deleted_at IS NULL;

-- Índices parciais para soft delete
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_groups_active ON groups(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_active ON events(id) WHERE deleted_at IS NULL;

-- Índices para full-text search (futuro)
CREATE INDEX idx_groups_name_trgm ON groups USING GIN (name gin_trgm_ops);
CREATE INDEX idx_users_name_trgm ON users USING GIN (name gin_trgm_ops);
```

---

### 13.2 Vacuum e Maintenance

```sql
-- Configurar autovacuum agressivo em tabelas de alta rotatividade
ALTER TABLE user_activity_log SET (autovacuum_vacuum_scale_factor = 0.01);
ALTER TABLE audit_logs SET (autovacuum_vacuum_scale_factor = 0.01);
ALTER TABLE webhook_logs SET (autovacuum_vacuum_scale_factor = 0.01);

-- Análise de estatísticas
ANALYZE users;
ANALYZE groups;
ANALYZE events;
ANALYZE event_attendance;
```

---

## 14. ROW LEVEL SECURITY (RLS)

### 14.1 Habilitar RLS

```sql
-- Habilitar RLS em todas as tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

---

### 14.2 Políticas de Segurança

```sql
-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

-- Política: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid());

-- Política: Membros podem ver grupos aos quais pertencem
CREATE POLICY "Members can view their groups"
ON groups FOR SELECT
USING (
  id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
  OR is_private = FALSE
);

-- Política: Admins podem atualizar grupos
CREATE POLICY "Admins can update groups"
ON groups FOR UPDATE
USING (
  id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- Política: Membros podem ver eventos de seus grupos
CREATE POLICY "Members can view group events"
ON events FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
);

-- Política: Usuários podem ver apenas suas notificações
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Política: Usuários podem atualizar suas notificações (marcar como lida)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());
```

---

## 15. TRIGGERS E FUNÇÕES

### 15.1 Função: `update_updated_at_column()`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (aplicar em todas as outras tabelas)
```

---

### 15.2 Trigger: Atualizar Estatísticas do Grupo

```sql
CREATE OR REPLACE FUNCTION update_group_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'group_members' THEN
    UPDATE groups
    SET
      total_members = (
        SELECT COUNT(*) FROM group_members
        WHERE group_id = NEW.group_id AND deleted_at IS NULL
      ),
      updated_at = NOW()
    WHERE id = NEW.group_id;
  END IF;

  IF TG_TABLE_NAME = 'events' THEN
    UPDATE groups
    SET
      total_events = (
        SELECT COUNT(*) FROM events
        WHERE group_id = NEW.group_id AND deleted_at IS NULL
      ),
      total_games_played = (
        SELECT COUNT(*) FROM events
        WHERE group_id = NEW.group_id AND status = 'completed' AND deleted_at IS NULL
      ),
      updated_at = NOW()
    WHERE id = NEW.group_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_stats_from_members
AFTER INSERT OR UPDATE OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_stats();

CREATE TRIGGER update_group_stats_from_events
AFTER INSERT OR UPDATE OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION update_group_stats();
```

---

### 15.3 Trigger: Criar Carteira ao Criar Grupo

```sql
CREATE OR REPLACE FUNCTION create_group_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (group_id, wallet_type, balance)
  VALUES (NEW.id, 'group', 0.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_group_wallet_trigger
AFTER INSERT ON groups
FOR EACH ROW EXECUTE FUNCTION create_group_wallet();
```

---

### 15.4 Trigger: Criar Preferências de Notificação

```sql
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences_trigger
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_notification_preferences();
```

---

## 16. VIEWS MATERIALIZADAS

### 16.1 View: `mv_event_scoreboard`

Scoreboard em tempo real por evento.

```sql
CREATE MATERIALIZED VIEW mv_event_scoreboard AS
SELECT
  e.id AS event_id,
  e.code AS event_code,
  e.title AS event_title,
  t.id AS team_id,
  t.team_number,
  t.name AS team_name,
  t.color AS team_color,
  COUNT(DISTINCT tm.id) AS total_players,
  COALESCE(SUM(CASE WHEN ea.action_type = 'goal' THEN 1 ELSE 0 END), 0) AS goals,
  COALESCE(SUM(CASE WHEN ea.action_type = 'assist' THEN 1 ELSE 0 END), 0) AS assists,
  COALESCE(SUM(CASE WHEN ea.action_type = 'yellow_card' THEN 1 ELSE 0 END), 0) AS yellow_cards,
  COALESCE(SUM(CASE WHEN ea.action_type = 'red_card' THEN 1 ELSE 0 END), 0) AS red_cards
FROM events e
JOIN teams t ON e.id = t.event_id
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.deleted_at IS NULL
LEFT JOIN event_actions ea ON t.id = ea.team_id AND ea.deleted_at IS NULL
WHERE e.deleted_at IS NULL AND t.deleted_at IS NULL
GROUP BY e.id, e.code, e.title, t.id, t.team_number, t.name, t.color;

-- Índices para performance
CREATE UNIQUE INDEX idx_mv_scoreboard_event_team ON mv_event_scoreboard(event_id, team_id);
CREATE INDEX idx_mv_scoreboard_event ON mv_event_scoreboard(event_id);

-- Função para refresh automático
CREATE OR REPLACE FUNCTION refresh_event_scoreboard()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_event_scoreboard;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para refresh quando ações são registradas
CREATE TRIGGER refresh_scoreboard_on_action
AFTER INSERT OR UPDATE OR DELETE ON event_actions
FOR EACH STATEMENT EXECUTE FUNCTION refresh_event_scoreboard();
```

---

### 16.2 View: `mv_group_rankings`

Rankings por grupo (all-time).

```sql
CREATE MATERIALIZED VIEW mv_group_rankings AS
WITH player_stats AS (
  SELECT
    gm.group_id,
    gm.user_id,
    u.name AS player_name,
    u.avatar_url,
    gm.custom_nickname,
    gm.total_events_participated,
    gm.total_goals,
    gm.total_assists,
    gm.total_mvp_votes,
    gm.attendance_rate,
    COALESCE(gm.total_goals, 0) + (COALESCE(gm.total_assists, 0) * 0.5) + (COALESCE(gm.total_mvp_votes, 0) * 2) AS overall_score
  FROM group_members gm
  JOIN users u ON gm.user_id = u.id
  WHERE gm.deleted_at IS NULL AND u.deleted_at IS NULL
)
SELECT
  group_id,
  user_id,
  player_name,
  avatar_url,
  custom_nickname,
  total_events_participated,
  total_goals,
  total_assists,
  total_mvp_votes,
  attendance_rate,
  overall_score,
  ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY total_goals DESC) AS goals_rank,
  ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY total_assists DESC) AS assists_rank,
  ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY total_mvp_votes DESC) AS mvp_rank,
  ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY attendance_rate DESC NULLS LAST) AS attendance_rank,
  ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY overall_score DESC) AS overall_rank
FROM player_stats;

-- Índices
CREATE UNIQUE INDEX idx_mv_rankings_group_user ON mv_group_rankings(group_id, user_id);
CREATE INDEX idx_mv_rankings_group ON mv_group_rankings(group_id);
CREATE INDEX idx_mv_rankings_goals ON mv_group_rankings(group_id, goals_rank);
CREATE INDEX idx_mv_rankings_overall ON mv_group_rankings(group_id, overall_rank);

-- Refresh diário (via cron job)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_group_rankings;
```

---

## 17. MIGRATIONS STRATEGY

### 17.1 Estrutura de Migrations

```
src/db/migrations/
├── v1/                     # Migrations V1 (MVP atual)
│   └── 001_initial.sql
├── v2/                     # Migrations V2
│   ├── 001_notifications.sql
│   ├── 002_pix.sql
│   ├── 003_analytics.sql
│   ├── 004_training.sql
│   ├── 005_achievements.sql
│   ├── 006_integrations.sql
│   ├── 007_audit.sql
│   ├── 008_modalities.sql
│   └── 999_indexes_and_views.sql
└── README.md
```

---

### 17.2 Migration Template

```sql
-- Migration: 001_notifications.sql
-- Descrição: Sistema de notificações
-- Data: 2026-01-27
-- Autor: Tech Team

-- ============================================
-- UP MIGRATION
-- ============================================

BEGIN;

-- Criar tabelas
CREATE TABLE notifications (
  ...
);

CREATE TABLE notification_preferences (
  ...
);

-- Criar índices
CREATE INDEX idx_notifications_user ON notifications(...);

-- Criar triggers
CREATE TRIGGER ...;

-- Inserir dados iniciais
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- ============================================
-- DOWN MIGRATION (Rollback)
-- ============================================

-- DROP TABLE notifications CASCADE;
-- DROP TABLE notification_preferences CASCADE;
```

---

### 17.3 Ordem de Execução

**Fase 1: Tabelas Core (Sprint 1)**
1. `001_initial.sql` - Tabelas básicas (users, groups, events, etc.)

**Fase 2: Notificações (Sprint 2)**
2. `001_notifications.sql` - Sistema de notificações

**Fase 3: Financeiro (Sprint 3-4)**
3. `002_pix.sql` - Split Pix e pagamentos

**Fase 4: Analytics (Sprint 3)**
4. `003_analytics.sql` - Métricas e tendências

**Fase 5: Features Extras (Sprint 5-7)**
5. `004_training.sql` - Planilhas de treino
6. `005_achievements.sql` - Gamificação
7. `006_integrations.sql` - Webhooks e integrações
8. `007_audit.sql` - Auditoria e compliance

**Fase 6: Futuro (Q2 2026)**
9. `008_modalities.sql` - Multi-modalidades

**Fase 7: Otimização (Final)**
10. `999_indexes_and_views.sql` - Índices adicionais e views

---

## 18. DIAGRAMA ER COMPLETO

### 18.1 Diagrama Conceitual

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PELADEIROS V2.0 - DATABASE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      CORE ENTITIES                             │ │
│  │                                                                 │ │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │ │
│  │  │  users  │    │ groups  │    │ events  │    │ venues  │   │ │
│  │  └────┬────┘    └────┬────┘    └────┬────┘    └─────────┘   │ │
│  │       │              │              │                         │ │
│  │       │              │              │                         │ │
│  │       └──────────────┴──────────────┘                         │ │
│  │                      │                                         │ │
│  │              ┌───────┴────────┐                               │ │
│  │              │                │                               │ │
│  │       ┌──────▼──────┐  ┌─────▼──────┐                        │ │
│  │       │group_members│  │event_attend│                        │ │
│  │       └─────────────┘  └────────────┘                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      GAMEPLAY ENTITIES                         │ │
│  │                                                                 │ │
│  │  ┌─────────┐    ┌──────────────┐    ┌──────────────┐         │ │
│  │  │  teams  │────│ team_members │    │event_actions │         │ │
│  │  └─────────┘    └──────────────┘    └──────────────┘         │ │
│  │                                                                 │ │
│  │  ┌─────────┐    ┌──────────────────┐                         │ │
│  │  │  votes  │    │player_statistics │                         │ │
│  │  └─────────┘    └──────────────────┘                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      FINANCIAL ENTITIES                        │ │
│  │                                                                 │ │
│  │  ┌─────────┐    ┌─────────┐    ┌──────────────┐              │ │
│  │  │ wallets │    │ charges │    │ transactions │              │ │
│  │  └─────────┘    └─────────┘    └──────────────┘              │ │
│  │                                                                 │ │
│  │  ┌─────────────────┐    ┌──────────────┐                     │ │
│  │  │group_pix_config │    │pix_qr_codes  │                     │ │
│  │  └─────────────────┘    └──────────────┘                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    NOTIFICATION ENTITIES                       │ │
│  │                                                                 │ │
│  │  ┌──────────────┐    ┌────────────────────────┐              │ │
│  │  │notifications │    │notification_preferences│              │ │
│  │  └──────────────┘    └────────────────────────┘              │ │
│  │                                                                 │ │
│  │  ┌──────────────┐                                             │ │
│  │  │ push_tokens  │                                             │ │
│  │  └──────────────┘                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     ANALYTICS ENTITIES                         │ │
│  │                                                                 │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │ │
│  │  │group_metrics │    │metric_trends │    │event_metrics │   │ │
│  │  └──────────────┘    └──────────────┘    └──────────────┘   │ │
│  │                                                                 │ │
│  │  ┌──────────────────┐                                         │ │
│  │  │user_activity_log │                                         │ │
│  │  └──────────────────┘                                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   GAMIFICATION ENTITIES                        │ │
│  │                                                                 │ │
│  │  ┌──────────────────┐    ┌──────────────────┐                │ │
│  │  │achievement_types │    │user_achievements │                │ │
│  │  └──────────────────┘    └──────────────────┘                │ │
│  │                                                                 │ │
│  │  ┌──────────────┐                                             │ │
│  │  │ leaderboards │                                             │ │
│  │  └──────────────┘                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      OTHER ENTITIES                            │ │
│  │                                                                 │ │
│  │  ┌──────────────┐    ┌─────────┐    ┌──────────────┐         │ │
│  │  │training_plans│    │ invites │    │   webhooks   │         │ │
│  │  └──────────────┘    └─────────┘    └──────────────┘         │ │
│  │                                                                 │ │
│  │  ┌──────────────┐    ┌─────────┐                             │ │
│  │  │ audit_logs   │    │ sessions│                             │ │
│  │  └──────────────┘    └─────────┘                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 19. MÉTRICAS E ESTATÍSTICAS

### 19.1 Tamanho Estimado do Banco

**Projeções para 1 ano de uso:**

| Tabela | Linhas Estimadas | Tamanho Estimado |
|--------|------------------|------------------|
| users | 10,000 | ~5 MB |
| groups | 500 | ~1 MB |
| events | 5,000 | ~10 MB |
| event_attendance | 100,000 | ~50 MB |
| event_actions | 50,000 | ~20 MB |
| notifications | 500,000 | ~200 MB |
| user_activity_log | 5,000,000 | ~2 GB |
| audit_logs | 1,000,000 | ~500 MB |
| **TOTAL** | | **~3 GB** |

**Com Neon Serverless:** ~$20-30/mês (plano Pro)

---

## 20. CONCLUSÃO

Esta arquitetura de banco de dados foi projetada para ser:

✅ **Escalável** - Suporta crescimento de 10 a 100.000+ usuários
✅ **Performática** - Índices estratégicos e views materializadas
✅ **Segura** - RLS, auditoria completa, soft delete
✅ **Flexível** - JSONB para customizações, preparado para multi-modalidades
✅ **Confiável** - Constraints, triggers, validações
✅ **Rastreável** - Códigos únicos, audit logs, activity tracking

**Próximos Passos:**
1. Implementar migrations em ordem (Sprint 1-8)
2. Criar testes de carga e stress
3. Monitorar performance com explain analyze
4. Configurar backups automatizados
5. Implementar disaster recovery plan

---

**Criado por:** Claude Code + Tech Team
**Data:** 2026-01-21
**Versão:** 2.0.0
**Status:** ✅ Aprovado para Implementação
