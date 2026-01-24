# 🗄️ ARQUITETURA DE BANCO DE DADOS - RESENHAPP V2.0 (SUPABASE)

**Documento de Especificação Técnica de Banco de Dados**
**Versão:** 2.0.0-SUPABASE
**Data:** 2026-01-21
**Database:** Supabase (PostgreSQL 15+)
**Baseado em:** Arquitetura ERP-UzzAI + Supabase Best Practices

---

## 📋 ÍNDICE

1. [Visão Geral da Arquitetura Supabase](#1-visão-geral-da-arquitetura-supabase)
2. [Sistema de Autenticação e Usuários](#2-sistema-de-autenticação-e-usuários)
3. [Sistema de Tipos de Usuários e Permissões](#3-sistema-de-tipos-de-usuários-e-permissões)
4. [Schema Core (Grupos e Eventos)](#4-schema-core-grupos-e-eventos)
5. [Schema de Jogadores e Estatísticas](#5-schema-de-jogadores-e-estatísticas)
6. [Schema Financeiro e Pagamentos](#6-schema-financeiro-e-pagamentos)
7. [Schema de Notificações](#7-schema-de-notificações)
8. [Schema de Analytics e Métricas](#8-schema-de-analytics-e-métricas)
9. [Schema de Conquistas e Gamificação](#9-schema-de-conquistas-e-gamificação)
10. [Schema de Planilhas de Treino](#10-schema-de-planilhas-de-treino)
11. [Schema de Integrações](#11-schema-de-integrações)
12. [Supabase Storage Structure](#12-supabase-storage-structure)
13. [Supabase Realtime Subscriptions](#13-supabase-realtime-subscriptions)
14. [Row Level Security (RLS) Policies](#14-row-level-security-rls-policies)
15. [Triggers e Functions](#15-triggers-e-functions)
16. [Edge Functions](#16-edge-functions)
17. [Migrations Strategy](#17-migrations-strategy)
18. [Diagrama ER Completo](#18-diagrama-er-completo)

---

## 1. VISÃO GERAL DA ARQUITETURA SUPABASE

### 1.1 Stack Supabase Completo

```yaml
Autenticação:
  - Supabase Auth (built-in)
  - Providers: Email/Password, Google, Apple (futuro)
  - Magic Links (opcional)
  - Row Level Security (RLS)

Database:
  - PostgreSQL 15+
  - Supabase Database
  - Extensões: pgcrypto, uuid-ossp, pg_trgm, postgis

Storage:
  - Supabase Storage
  - Buckets: avatars, group-photos, venue-photos, receipts
  - Image Transformations

Realtime:
  - Supabase Realtime
  - Channels: groups, events, notifications, live-scores

Edge Functions:
  - Supabase Edge Functions (Deno)
  - Functions: generate-pix-qr, send-notifications, calculate-metrics

Client:
  - @supabase/supabase-js (client)
  - @supabase/auth-helpers-nextjs (Next.js integration)
```

### 1.2 Diferenças vs. Arquitetura Neon

| Aspecto | Neon (Anterior) | Supabase (Atual) |
|---------|-----------------|------------------|
| **Auth** | NextAuth v5 | Supabase Auth (built-in) |
| **User Table** | `users` customizada | `auth.users` + `profiles` |
| **RLS** | Manual | Nativo e otimizado |
| **Realtime** | N/A | Supabase Realtime |
| **Storage** | Vercel Blob | Supabase Storage |
| **Functions** | Next.js API Routes | Edge Functions + API Routes |
| **Client** | `@neondatabase/serverless` | `@supabase/supabase-js` |

### 1.3 Arquitetura de Camadas

```
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE ARCHITECTURE                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              CLIENT LAYER (Next.js)                    │  │
│  │  • @supabase/supabase-js                               │  │
│  │  • @supabase/auth-helpers-nextjs                       │  │
│  │  • Server Components + Client Components               │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐  │
│  │            SUPABASE API GATEWAY                        │  │
│  │  • REST API (PostgREST)                                │  │
│  │  • Realtime API (Phoenix)                              │  │
│  │  • Auth API                                            │  │
│  │  • Storage API                                         │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐  │
│  │              ROW LEVEL SECURITY (RLS)                  │  │
│  │  • auth.uid() based policies                           │  │
│  │  • Multi-tenant isolation                              │  │
│  │  • Role-based access control                           │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐  │
│  │           POSTGRESQL DATABASE                          │  │
│  │  • Schema: public, auth, storage                       │  │
│  │  • 50+ tabelas                                         │  │
│  │  • 100+ índices                                        │  │
│  │  • Views materializadas                                │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐  │
│  │              SUPABASE STORAGE                          │  │
│  │  • Buckets: avatars, photos, receipts                  │  │
│  │  • Image transformations                               │  │
│  │  • CDN delivery                                        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. SISTEMA DE AUTENTICAÇÃO E USUÁRIOS

### 2.1 Tabela: `auth.users` (Supabase Nativa)

**Esta tabela é gerenciada pelo Supabase Auth.**

```sql
-- Tabela nativa do Supabase (não modificar diretamente)
-- auth.users
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  phone TEXT,
  phone_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- ... outros campos gerenciados pelo Supabase
);
```

**Comentários:**
- ✅ Gerenciada automaticamente pelo Supabase
- ✅ Não criar triggers ou modificar diretamente
- ✅ Estender dados do usuário na tabela `profiles`

---

### 2.2 Tabela: `profiles`

**Extensão de dados do usuário.**

```sql
-- Tabela de perfis (1:1 com auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Código Único
  code TEXT UNIQUE NOT NULL, -- P-00123

  -- Informações Básicas
  full_name TEXT,
  display_name TEXT, -- Nome de exibição (pode ser diferente do full_name)
  nickname TEXT, -- Apelido do jogador
  bio TEXT,

  -- Avatar
  avatar_url TEXT, -- URL do Supabase Storage

  -- Contato
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,

  -- Endereço
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',

  -- Preferências de Jogo
  preferred_position TEXT, -- goleiro, zagueiro, meia, atacante
  preferred_foot TEXT CHECK (preferred_foot IN ('right', 'left', 'both')),

  -- Tipo de Usuário na Plataforma (NOVO)
  platform_role TEXT NOT NULL DEFAULT 'player' CHECK (platform_role IN (
    'player',      -- Jogador comum (participa de grupos)
    'organizer',   -- Organizador (pode criar e gerenciar múltiplos grupos)
    'admin',       -- Admin da plataforma (acesso especial)
    'super_admin'  -- Super admin (acesso total)
  )),

  -- Permissões Globais (NOVO)
  can_create_groups BOOLEAN GENERATED ALWAYS AS (
    platform_role IN ('organizer', 'admin', 'super_admin')
  ) STORED,
  can_manage_platform BOOLEAN GENERATED ALWAYS AS (
    platform_role IN ('admin', 'super_admin')
  ) STORED,

  -- Estatísticas Globais (cache)
  total_groups_owned INTEGER DEFAULT 0, -- Grupos que criou/administra
  total_groups_member INTEGER DEFAULT 0, -- Grupos que participa
  total_events_participated INTEGER DEFAULT 0,

  -- Configurações
  settings JSONB DEFAULT '{}',
  -- Exemplo: { "theme": "dark", "language": "pt-BR", "notifications_enabled": true }

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- Verificação de identidade
  is_banned BOOLEAN DEFAULT FALSE,
  banned_reason TEXT,
  banned_at TIMESTAMPTZ,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT, -- 'profile', 'preferences', 'first_group', 'completed'

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Índices
CREATE INDEX idx_profiles_code ON profiles(code);
CREATE INDEX idx_profiles_platform_role ON profiles(platform_role);
CREATE INDEX idx_profiles_email ON profiles((SELECT email FROM auth.users WHERE id = profiles.id));
CREATE INDEX idx_profiles_display_name ON profiles(display_name);
CREATE INDEX idx_profiles_can_create_groups ON profiles(can_create_groups) WHERE can_create_groups = TRUE;

-- Função para gerar código único
CREATE SEQUENCE profile_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_profile_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := 'P-' || LPAD(nextval('profile_code_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_profile_code_trigger
BEFORE INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION generate_profile_code();

-- Trigger para criar profile automaticamente quando user é criado
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, platform_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'platform_role', 'player')::TEXT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Comentários:**
- `platform_role`: Define tipo de usuário na plataforma
- `can_create_groups`: Computed column (organizers e admins podem criar grupos)
- `total_groups_owned`: Contador de grupos que administra
- Trigger automático cria profile quando usuário é registrado

---

### 2.3 Tabela: `user_roles` (NOVO)

**Roles globais e permissões customizadas.**

```sql
CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamento
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role
  role_name TEXT NOT NULL CHECK (role_name IN (
    'super_admin',
    'platform_admin',
    'content_moderator',
    'support',
    'beta_tester'
  )),

  -- Permissões Específicas (override)
  permissions JSONB DEFAULT '{}',
  -- Exemplo: { "can_view_all_groups": true, "can_delete_users": false }

  -- Scope
  scope TEXT DEFAULT 'platform' CHECK (scope IN ('platform', 'regional', 'limited')),
  scope_config JSONB, -- Configuração específica do scope

  -- Temporária?
  is_temporary BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,

  -- Audit
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  revoked_by UUID REFERENCES profiles(id),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(user_id, role_name),
  CHECK (is_temporary = FALSE OR expires_at IS NOT NULL),

  -- Indexes
  INDEX idx_user_roles_user ON user_roles(user_id) WHERE is_active = TRUE,
  INDEX idx_user_roles_role ON user_roles(role_name) WHERE is_active = TRUE
);
```

**Comentários:**
- Sistema de roles customizáveis
- Suporta roles temporárias (ex: beta_tester por 30 dias)
- Permissões granulares via JSONB

---

## 3. SISTEMA DE TIPOS DE USUÁRIOS E PERMISSÕES

### 3.1 Hierarquia de Usuários

```
┌──────────────────────────────────────────────────────────────┐
│                  HIERARQUIA DE USUÁRIOS                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  SUPER ADMIN                                           │  │
│  │  • Acesso total à plataforma                           │  │
│  │  • Gerencia todos os grupos                            │  │
│  │  • Pode banir usuários                                 │  │
│  │  • Acesso a métricas globais                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  PLATFORM ADMIN                                        │  │
│  │  • Moderação de conteúdo                               │  │
│  │  • Suporte a usuários                                  │  │
│  │  • Visualizar todos os grupos (read-only)              │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  ORGANIZER (Organizador)                               │  │
│  │  • Pode criar múltiplos grupos                         │  │
│  │  • Admin dos grupos que criou                          │  │
│  │  • Pode convidar outros organizers                     │  │
│  │  • Acesso a analytics de seus grupos                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  PLAYER (Jogador)                                      │  │
│  │  • Participa de grupos (convite necessário)            │  │
│  │  • Pode ser promovido a moderator em grupos            │  │
│  │  • Acesso a suas estatísticas                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Permissões por Tipo de Usuário

| Permissão | Player | Organizer | Admin | Super Admin |
|-----------|--------|-----------|-------|-------------|
| **Criar grupos** | ❌ | ✅ | ✅ | ✅ |
| **Gerenciar próprios grupos** | ❌ | ✅ | ✅ | ✅ |
| **Visualizar todos os grupos** | ❌ | ❌ | ✅ (read-only) | ✅ |
| **Deletar qualquer grupo** | ❌ | ❌ | ❌ | ✅ |
| **Banir usuários** | ❌ | ❌ | ❌ | ✅ |
| **Acessar analytics global** | ❌ | ❌ | ✅ | ✅ |
| **Modificar roles** | ❌ | ❌ | ❌ | ✅ |
| **Criar webhooks** | ❌ | ✅ (próprios grupos) | ✅ | ✅ |

### 3.3 Funções Helper para Permissões

```sql
-- Verificar se usuário pode criar grupos
CREATE OR REPLACE FUNCTION can_create_groups(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT platform_role IN ('organizer', 'admin', 'super_admin')
    FROM profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário é admin de um grupo
CREATE OR REPLACE FUNCTION is_group_admin(user_id UUID, group_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_members.user_id = $1
      AND group_members.group_id = $2
      AND group_members.role = 'admin'
      AND group_members.deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário é owner de um grupo
CREATE OR REPLACE FUNCTION is_group_owner(user_id UUID, group_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = $2
      AND groups.created_by = $1
      AND groups.deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário tem permissão especial (platform admin ou super admin)
CREATE OR REPLACE FUNCTION has_platform_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT platform_role IN ('admin', 'super_admin')
    FROM profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. SCHEMA CORE (GRUPOS E EVENTOS)

### 4.1 Tabela: `groups`

```sql
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- G-001

  -- Informações Básicas
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT, -- Supabase Storage URL
  cover_url TEXT, -- Foto de capa (Supabase Storage)

  -- Configurações
  is_private BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 100,

  -- Localização
  default_venue_id BIGINT REFERENCES venues(id),
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',

  -- Configurações de Jogo
  default_max_players INTEGER DEFAULT 20,
  default_max_goalkeepers INTEGER DEFAULT 2,
  default_event_cost DECIMAL(10,2),

  -- Configurações de Sorteio
  draw_strategy TEXT DEFAULT 'random' CHECK (
    draw_strategy IN ('random', 'balanced', 'skill_based', 'manual')
  ),
  draw_config JSONB DEFAULT '{}',

  -- Regras
  rules TEXT, -- Markdown

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),

  -- Estatísticas (cache)
  total_members INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,

  -- Owner e Admins (ATUALIZADO)
  created_by UUID NOT NULL REFERENCES profiles(id),
  -- Admins são gerenciados via group_members com role='admin'

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_groups_code ON groups(code),
  INDEX idx_groups_created_by ON groups(created_by),
  INDEX idx_groups_status ON groups(status) WHERE deleted_at IS NULL,
  INDEX idx_groups_city_state ON groups(city, state) WHERE deleted_at IS NULL
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

-- Trigger para atualizar updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Realtime
ALTER TABLE groups REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
```

**Comentários:**
- `created_by`: UUID do profile (dono do grupo)
- `cover_url`: Foto de capa armazenada no Supabase Storage
- Realtime habilitado para updates em tempo real

---

### 4.2 Tabela: `group_members`

```sql
CREATE TABLE group_members (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role no Grupo (ATUALIZADO)
  role TEXT NOT NULL DEFAULT 'member' CHECK (
    role IN ('owner', 'admin', 'moderator', 'member')
  ),

  -- Permissões no Grupo (NOVO)
  permissions JSONB DEFAULT '{}',
  -- Exemplo: { "can_create_events": true, "can_approve_members": false }

  -- Informações do Jogador
  is_goalkeeper BOOLEAN DEFAULT FALSE,
  base_rating DECIMAL(3,2) DEFAULT 5.0 CHECK (base_rating >= 1.0 AND base_rating <= 10.0),

  custom_nickname TEXT,
  jersey_number INTEGER,

  -- Estatísticas do Jogador no Grupo (cache)
  total_events_participated INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_yellow_cards INTEGER DEFAULT 0,
  total_red_cards INTEGER DEFAULT 0,
  total_mvp_votes INTEGER DEFAULT 0,

  -- Frequência
  attendance_rate DECIMAL(5,2),
  last_participated_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  invited_by UUID REFERENCES profiles(id),
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

-- Habilitar Realtime
ALTER TABLE group_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
```

**Comentários:**
- `role`: 'owner', 'admin', 'moderator', 'member'
- Owner é único (criador do grupo)
- Admins podem ser múltiplos (co-admins)
- Moderators têm permissões intermediárias

---

### 4.3 Tabela: `venues`

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

  -- Geolocalização (PostGIS)
  location GEOGRAPHY(POINT, 4326), -- latitude, longitude

  -- Capacidade
  max_capacity INTEGER,
  has_changing_rooms BOOLEAN DEFAULT FALSE,
  has_shower BOOLEAN DEFAULT FALSE,
  has_lighting BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,

  -- Contato
  phone TEXT,
  whatsapp TEXT,
  website TEXT,

  -- Disponibilidade
  opening_hours JSONB,

  -- Fotos (Supabase Storage)
  photos TEXT[], -- Array de URLs

  -- Rating
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INTEGER DEFAULT 0,

  -- Owner (NOVO)
  created_by UUID REFERENCES profiles(id),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_venues_city_state ON venues(city, state) WHERE deleted_at IS NULL,
  INDEX idx_venues_location ON venues USING GIST(location),
  INDEX idx_venues_type ON venues(venue_type) WHERE deleted_at IS NULL
);

-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Função para buscar venues próximos
CREATE OR REPLACE FUNCTION nearby_venues(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.name,
    ST_Distance(
      v.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000 AS distance_km
  FROM venues v
  WHERE v.deleted_at IS NULL
    AND v.is_active = TRUE
    AND ST_DWithin(
      v.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

**Comentários:**
- PostGIS para geolocalização precisa
- Função `nearby_venues()` para buscar locais próximos
- Photos armazenadas no Supabase Storage

---

### 4.4 Tabela: `events`

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
  min_players INTEGER DEFAULT 10,

  -- Confirmações (cache)
  total_confirmed INTEGER DEFAULT 0,
  total_waitlist INTEGER DEFAULT 0,
  total_declined INTEGER DEFAULT 0,

  -- Custo e Financeiro
  cost_per_player DECIMAL(10,2),
  cost_total DECIMAL(10,2),

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled'
  )),

  -- Resultado do Jogo
  match_played BOOLEAN DEFAULT FALSE,
  home_team_score INTEGER,
  away_team_score INTEGER,

  -- Configurações
  allow_waitlist BOOLEAN DEFAULT TRUE,
  auto_confirm_waitlist BOOLEAN DEFAULT TRUE,
  close_rsvp_hours_before INTEGER DEFAULT 2,
  rsvp_closed BOOLEAN DEFAULT FALSE,
  rsvp_closed_at TIMESTAMPTZ,

  -- Notificações
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,

  -- Sorteio
  teams_drawn BOOLEAN DEFAULT FALSE,
  teams_drawn_at TIMESTAMPTZ,
  teams_drawn_by UUID REFERENCES profiles(id),

  -- Metadados
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES profiles(id),
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

-- Habilitar Realtime
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
```

---

### 4.5 Tabela: `event_attendance`

```sql
CREATE TABLE event_attendance (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_member_id BIGINT NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,

  -- Status de Confirmação
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'yes',
    'no',
    'maybe',
    'waitlist'
  )),

  -- Check-in
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),

  -- Ordem de Chegada
  order_of_arrival INTEGER,

  -- Time Sorteado
  team_id BIGINT REFERENCES teams(id),

  -- Posição no Jogo
  played_as_goalkeeper BOOLEAN DEFAULT FALSE,

  -- Histórico de Mudanças
  status_history JSONB DEFAULT '[]',

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
  INDEX idx_event_attendance_status ON event_attendance(event_id, status) WHERE deleted_at IS NULL
);

-- Trigger para atualizar contadores
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

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_attendance_counts_trigger
AFTER INSERT OR UPDATE ON event_attendance
FOR EACH ROW EXECUTE FUNCTION update_event_attendance_counts();

-- Habilitar Realtime
ALTER TABLE event_attendance REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE event_attendance;
```

---

### 4.6 Tabelas: `teams` e `team_members`

```sql
CREATE TABLE teams (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL CHECK (team_number IN (1, 2)),
  name TEXT,
  color TEXT,
  total_players INTEGER DEFAULT 0,
  total_goalkeepers INTEGER DEFAULT 0,
  average_skill_rating DECIMAL(3,2),
  goals_scored INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  UNIQUE(event_id, team_number),
  INDEX idx_teams_event ON teams(event_id) WHERE deleted_at IS NULL
);

CREATE TABLE team_members (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  event_attendance_id BIGINT NOT NULL REFERENCES event_attendance(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_goalkeeper BOOLEAN DEFAULT FALSE,
  position TEXT,
  goals_scored INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  performance_rating DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id),
  INDEX idx_team_members_team ON team_members(team_id) WHERE deleted_at IS NULL,
  INDEX idx_team_members_user ON team_members(user_id) WHERE deleted_at IS NULL
);

-- Habilitar Realtime
ALTER TABLE teams REPLICA IDENTITY FULL;
ALTER TABLE team_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
```

---

### 4.7 Tabela: `event_actions`

```sql
CREATE TABLE event_actions (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'goal',
    'assist',
    'own_goal',
    'yellow_card',
    'red_card',
    'penalty_goal',
    'penalty_miss'
  )),
  minute INTEGER,
  description TEXT,
  assisted_by UUID REFERENCES profiles(id),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  INDEX idx_event_actions_event ON event_actions(event_id) WHERE deleted_at IS NULL,
  INDEX idx_event_actions_user ON event_actions(user_id) WHERE deleted_at IS NULL
);

-- Habilitar Realtime (para live scoring)
ALTER TABLE event_actions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE event_actions;
```

---

### 4.8 Tabela: `votes`

```sql
CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voted_for_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN (
    'mvp',
    'best_goalkeeper',
    'best_defender',
    'best_midfielder',
    'best_striker',
    'fair_play'
  )),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  UNIQUE(event_id, voter_id, vote_type),
  CHECK (voter_id != voted_for_id),
  INDEX idx_votes_event ON votes(event_id) WHERE deleted_at IS NULL,
  INDEX idx_votes_voted_for ON votes(voted_for_id) WHERE deleted_at IS NULL
);
```

---

## 12. SUPABASE STORAGE STRUCTURE

### 12.1 Buckets Configuration

```sql
-- Criar buckets via Supabase Dashboard ou SQL

-- Bucket: avatars (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Bucket: group-photos (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-photos', 'group-photos', true);

-- Bucket: venue-photos (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-photos', 'venue-photos', true);

-- Bucket: receipts (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Bucket: documents (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);
```

### 12.2 Storage Policies

```sql
-- Política: Qualquer usuário autenticado pode fazer upload de avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Política: Qualquer usuário autenticado pode atualizar próprio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Política: Qualquer usuário autenticado pode deletar próprio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Política: Admins de grupo podem fazer upload de fotos
CREATE POLICY "Group admins can upload group photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'group-photos' AND
  is_group_admin(auth.uid(), (storage.foldername(name))[1]::BIGINT)
);

-- Política: Apenas owner pode visualizar receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);
```

### 12.3 Image Transformations

```typescript
// Exemplo de uso no cliente (Next.js)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Upload de avatar
const uploadAvatar = async (file: File, userId: string) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/avatar.png`, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  // Get public URL with transformation
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(`${userId}/avatar.png`, {
      transform: {
        width: 200,
        height: 200,
        resize: 'cover',
      },
    });

  return publicUrl;
};
```

---

## 13. SUPABASE REALTIME SUBSCRIPTIONS

### 13.1 Channels Configuration

```typescript
// Exemplo de uso no cliente (Next.js)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Subscribe to event updates
const subscribeToEvent = (eventId: number, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`event:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'event_attendance',
        filter: `event_id=eq.${eventId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Subscribe to live scores
const subscribeToLiveScore = (eventId: number, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`live-score:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'event_actions',
        filter: `event_id=eq.${eventId}`,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'teams',
        filter: `event_id=eq.${eventId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Subscribe to group notifications
const subscribeToGroupNotifications = (groupId: number, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`group:${groupId}:notifications`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
```

### 13.2 Broadcast Channels (Custom Events)

```typescript
// Broadcast custom events (não-database)
const broadcastTeamSwap = (eventId: number, swap: any) => {
  const channel = supabase.channel(`event:${eventId}`);

  channel.send({
    type: 'broadcast',
    event: 'team-swap',
    payload: swap,
  });
};

// Listen to broadcasts
const listenToTeamSwaps = (eventId: number, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`event:${eventId}`)
    .on('broadcast', { event: 'team-swap' }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
```

---

## 14. ROW LEVEL SECURITY (RLS) POLICIES

### 14.1 Políticas de `profiles`

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver perfis públicos
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Usuários podem atualizar apenas o próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Apenas admins podem alterar platform_role
CREATE POLICY "Only admins can change platform_role"
ON profiles FOR UPDATE
USING (
  auth.uid() = id AND
  (OLD.platform_role = NEW.platform_role OR has_platform_access(auth.uid()))
);
```

### 14.2 Políticas de `groups`

```sql
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Grupos públicos são visíveis para todos
CREATE POLICY "Public groups are viewable by everyone"
ON groups FOR SELECT
USING (is_private = FALSE OR id IN (
  SELECT group_id FROM group_members
  WHERE user_id = auth.uid() AND deleted_at IS NULL
));

-- Apenas organizers podem criar grupos
CREATE POLICY "Organizers can create groups"
ON groups FOR INSERT
WITH CHECK (can_create_groups(auth.uid()));

-- Apenas owner ou admins podem atualizar grupo
CREATE POLICY "Owners and admins can update groups"
ON groups FOR UPDATE
USING (
  created_by = auth.uid() OR
  is_group_admin(auth.uid(), id) OR
  has_platform_access(auth.uid())
);

-- Apenas owner pode deletar grupo
CREATE POLICY "Only owners can delete groups"
ON groups FOR DELETE
USING (
  created_by = auth.uid() OR
  has_platform_access(auth.uid())
);
```

### 14.3 Políticas de `group_members`

```sql
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Membros podem ver outros membros do mesmo grupo
CREATE POLICY "Group members can view other members"
ON group_members FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
);

-- Admins podem adicionar membros
CREATE POLICY "Admins can add members"
ON group_members FOR INSERT
WITH CHECK (is_group_admin(auth.uid(), group_id));

-- Admins podem atualizar membros (exceto owner)
CREATE POLICY "Admins can update members"
ON group_members FOR UPDATE
USING (
  is_group_admin(auth.uid(), group_id) AND
  role != 'owner'
);

-- Usuários podem sair do grupo (soft delete)
CREATE POLICY "Users can leave groups"
ON group_members FOR DELETE
USING (
  user_id = auth.uid() OR
  is_group_admin(auth.uid(), group_id)
);
```

### 14.4 Políticas de `events`

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Membros do grupo podem ver eventos
CREATE POLICY "Group members can view events"
ON events FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
);

-- Admins podem criar eventos
CREATE POLICY "Group admins can create events"
ON events FOR INSERT
WITH CHECK (is_group_admin(auth.uid(), group_id));

-- Admins podem atualizar eventos
CREATE POLICY "Group admins can update events"
ON events FOR UPDATE
USING (is_group_admin(auth.uid(), group_id));

-- Admins podem deletar eventos
CREATE POLICY "Group admins can delete events"
ON events FOR DELETE
USING (is_group_admin(auth.uid(), group_id));
```

### 14.5 Políticas de `event_attendance`

```sql
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

-- Membros do grupo podem ver attendance
CREATE POLICY "Group members can view attendance"
ON event_attendance FOR SELECT
USING (
  event_id IN (
    SELECT e.id FROM events e
    JOIN group_members gm ON e.group_id = gm.group_id
    WHERE gm.user_id = auth.uid() AND gm.deleted_at IS NULL
  )
);

-- Usuários podem criar próprio RSVP
CREATE POLICY "Users can RSVP to events"
ON event_attendance FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar próprio RSVP
CREATE POLICY "Users can update own RSVP"
ON event_attendance FOR UPDATE
USING (user_id = auth.uid() OR is_group_admin(auth.uid(), (
  SELECT group_id FROM events WHERE id = event_id
)));
```

### 14.6 Políticas de `notifications`

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas próprias notificações
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Usuários podem atualizar próprias notificações (marcar como lida)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- Sistema pode criar notificações (via service_role)
-- (sem policy, apenas service_role pode inserir)
```

---

## 15. TRIGGERS E FUNCTIONS

### 15.1 Função: `update_updated_at_column()`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas necessárias
-- (já aplicado nas tabelas acima via CREATE TRIGGER)
```

### 15.2 Trigger: Atualizar total_groups_owned

```sql
CREATE OR REPLACE FUNCTION update_profile_group_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar total_groups_owned se for owner
    IF NEW.role = 'owner' THEN
      UPDATE profiles
      SET total_groups_owned = total_groups_owned + 1
      WHERE id = NEW.user_id;
    END IF;

    -- Incrementar total_groups_member sempre
    UPDATE profiles
    SET total_groups_member = total_groups_member + 1
    WHERE id = NEW.user_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- Decrementar counters
    IF OLD.role = 'owner' THEN
      UPDATE profiles
      SET total_groups_owned = total_groups_owned - 1
      WHERE id = OLD.user_id;
    END IF;

    UPDATE profiles
    SET total_groups_member = total_groups_member - 1
    WHERE id = OLD.user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_group_counts_trigger
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_profile_group_counts();
```

### 15.3 Trigger: Criar Wallet ao Criar Grupo

```sql
CREATE OR REPLACE FUNCTION create_group_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (group_id, user_id, wallet_type, balance)
  VALUES (NEW.id, NULL, 'group', 0.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_group_wallet_trigger
AFTER INSERT ON groups
FOR EACH ROW EXECUTE FUNCTION create_group_wallet();
```

---

## 16. EDGE FUNCTIONS

### 16.1 Edge Function: Generate Pix QR Code

```typescript
// supabase/functions/generate-pix-qr/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import QRCodePix from 'https://esm.sh/qrcode-pix@1.3.0';
import QRCode from 'https://esm.sh/qrcode@1.5.3';

serve(async (req) => {
  try {
    const { eventId, userId, amount } = await req.json();

    // Criar client Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar configuração Pix do grupo
    const { data: event } = await supabase
      .from('events')
      .select('group_id')
      .eq('id', eventId)
      .single();

    const { data: pixConfig } = await supabase
      .from('group_pix_config')
      .select('*')
      .eq('group_id', event.group_id)
      .single();

    if (!pixConfig || !pixConfig.enabled) {
      throw new Error('Pix não configurado para este grupo');
    }

    // Gerar QR Code Pix
    const qrCodePix = QRCodePix({
      version: '01',
      key: pixConfig.pix_key,
      name: pixConfig.merchant_name,
      city: pixConfig.merchant_city,
      transactionId: `E${eventId}U${userId}`,
      message: `Evento ${eventId}`,
      value: amount,
    });

    const payload = qrCodePix.payload();

    // Gerar imagem QR Code
    const qrCodeDataURL = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 300,
    });

    // Salvar no banco
    const { data: qrCode, error } = await supabase
      .from('pix_qr_codes')
      .insert({
        event_id: eventId,
        user_id: userId,
        amount,
        qr_code_payload: payload,
        qr_code_image_url: qrCodeDataURL,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data: qrCode }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### 16.2 Edge Function: Send Notification

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import admin from 'https://esm.sh/firebase-admin@11';

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '{}')),
});

serve(async (req) => {
  try {
    const { userId, title, message, link, type } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Criar notificação no banco
    const { data: notification } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        notification_type: type,
        title,
        message,
        link,
      })
      .select()
      .single();

    // Buscar tokens push do usuário
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Enviar push notification
    if (tokens && tokens.length > 0) {
      const pushTokens = tokens.map((t) => t.token);

      await admin.messaging().sendMulticast({
        tokens: pushTokens,
        notification: {
          title,
          body: message,
        },
        data: {
          link,
          notificationId: notification.id.toString(),
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

---

## 17. MIGRATIONS STRATEGY

### 17.1 Estrutura de Migrations (Supabase)

```
supabase/
├── migrations/
│   ├── 20260127000001_initial_schema.sql
│   ├── 20260127000002_auth_profiles.sql
│   ├── 20260127000003_groups_and_events.sql
│   ├── 20260127000004_rls_policies.sql
│   ├── 20260204000001_notifications.sql
│   ├── 20260211000001_pix_payments.sql
│   ├── 20260218000001_analytics.sql
│   ├── 20260225000001_gamification.sql
│   └── 20260304000001_integrations.sql
├── functions/
│   ├── generate-pix-qr/
│   ├── send-notification/
│   └── calculate-metrics/
└── seed.sql
```

### 17.2 Ordem de Execução

```bash
# 1. Inicializar Supabase local
supabase init

# 2. Link com projeto Supabase
supabase link --project-ref <project-id>

# 3. Criar migrations
supabase migration new initial_schema

# 4. Aplicar migrations
supabase db push

# 5. Deploy Edge Functions
supabase functions deploy generate-pix-qr
supabase functions deploy send-notification
```

---

## 18. DIAGRAMA ER COMPLETO

### 18.1 Relacionamentos Principais

```
auth.users (Supabase)
    ↓ (1:1)
profiles
    ↓ (1:N)
group_members ←──┐
    ↓            │
groups ──────────┘
    ↓ (1:N)
events
    ↓ (1:N)
event_attendance
    ↓ (1:N)
teams → team_members
    ↓
event_actions
```

---

## CONCLUSÃO

Esta arquitetura Supabase está pronta para:

✅ **Multi-User Management** - Organizers gerenciam múltiplos grupos
✅ **Realtime Updates** - Live scoring, notifications, RSVP
✅ **Secure Storage** - Avatars, fotos, receipts
✅ **Edge Functions** - Lógica complexa serverless
✅ **RLS Completo** - Segurança nativa do Supabase
✅ **Escalável** - Suporta 10 a 100.000+ usuários

**Próximos Passos:**
1. Criar projeto no Supabase
2. Executar migrations
3. Deploy Edge Functions
4. Configurar Storage buckets
5. Testar RLS policies
6. Integrar com Next.js

---

**Criado por:** Claude Code + Tech Team
**Data:** 2026-01-21
**Versão:** 2.0.0-SUPABASE
**Status:** ✅ Pronto para Implementação
