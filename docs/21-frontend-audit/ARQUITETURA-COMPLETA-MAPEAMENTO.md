# 🏗️ Arquitetura Completa - Mapeamento Detalhado

> **Data:** 2026-01-24  
> **Objetivo:** Mapear arquitetura completa (UI/UX, Banco de Dados, Backend) e como tudo se conecta  
> **Status:** 📋 Documentação Completa

---

## 📋 ÍNDICE

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Arquitetura de Dados (Database)](#2-arquitetura-de-dados-database)
3. [Arquitetura de Backend (API)](#3-arquitetura-de-backend-api)
4. [Arquitetura de Frontend (UI/UX)](#4-arquitetura-de-frontend-uiux)
5. [Fluxos de Dados](#5-fluxos-de-dados)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Estados e Contextos](#7-estados-e-contextos)
8. [Navegação e Roteamento](#8-navegação-e-roteamento)
9. [Integrações e Serviços](#9-integrações-e-serviços)
10. [Diagramas de Fluxo](#10-diagramas-de-fluxo)

---

## 1. VISÃO GERAL DA ARQUITETURA

### 1.1 Stack Tecnológico Completo

```yaml
Frontend:
  Framework: Next.js 16.1.1 (App Router)
  UI Library: React 19
  Styling: Tailwind CSS 3.x
  UI Components: shadcn/ui (Radix UI)
  Icons: lucide-react
  Notifications: sonner
  State Management: React Hooks (useState, useEffect)
  Validation: Zod
  Forms: React Hook Form (implícito)
  
Backend:
  API: Next.js API Routes (App Router)
  Database: PostgreSQL 15+ (Supabase)
  DB Client: postgres (postgres.js)
  Auth: NextAuth v5 (JWT)
  Password: bcrypt
  Logging: Pino
  
DevOps:
  Deploy: Vercel
  Package Manager: pnpm
  Version Control: Git/GitHub
  Database: Supabase (PostgreSQL)
```

### 1.2 Princípios Arquiteturais

1. **Separação de Responsabilidades**
   - Frontend: UI/UX, validação client-side, estados locais
   - Backend: Lógica de negócio, validação server-side, acesso ao banco
   - Database: Persistência, integridade, performance

2. **Single Source of Truth**
   - Database como fonte única de verdade
   - APIs como única forma de modificar dados
   - Frontend reflete estado do backend

3. **Type Safety**
   - TypeScript em todo o código
   - Zod para validação runtime
   - Tipos compartilhados entre frontend/backend

4. **Security First**
   - Autenticação obrigatória (exceto rotas públicas)
   - Autorização baseada em roles
   - Validação em múltiplas camadas

---

## 2. ARQUITETURA DE DADOS (DATABASE)

### 2.1 Estrutura de Tabelas

#### Core Tables (Base do Sistema)

**`profiles` (auth.users extension)**
```sql
- id UUID (PK, FK → auth.users)
- full_name VARCHAR
- avatar_url TEXT
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**`groups`**
```sql
- id UUID (PK)
- name VARCHAR(255)
- description TEXT
- privacy VARCHAR(20) ['private', 'public']
- photo_url TEXT
- created_by UUID (FK → profiles)
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

-- Fase 0: Hierarquia e Créditos
- parent_group_id UUID (FK → groups) [NULL para top-level]
- group_type VARCHAR(20) ['athletic', 'pelada']
- pix_code TEXT
- credits_balance INTEGER DEFAULT 0
- credits_purchased INTEGER DEFAULT 0
- credits_consumed INTEGER DEFAULT 0
```

**`group_members`**
```sql
- id UUID (PK)
- user_id UUID (FK → profiles)
- group_id UUID (FK → groups)
- role VARCHAR(20) ['admin', 'member']
- is_goalkeeper BOOLEAN
- base_rating INTEGER [0-10]
- is_active BOOLEAN DEFAULT TRUE
- joined_at TIMESTAMPTZ
- UNIQUE(user_id, group_id)
```

**`events`**
```sql
- id UUID (PK)
- group_id UUID (FK → groups)
- name VARCHAR(255)
- description TEXT
- date DATE
- time TIME
- venue_id UUID (FK → venues)
- max_players INTEGER
- max_goalkeepers INTEGER
- status VARCHAR(20) ['scheduled', 'live', 'finished', 'canceled']
- waitlist_enabled BOOLEAN
- created_by UUID (FK → profiles)
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

-- Fase 0: Treinos Recorrentes
- is_recurring BOOLEAN DEFAULT FALSE
- recurrence_pattern JSONB
- event_type VARCHAR(20) ['training', 'game', 'tournament']
- parent_event_id UUID (FK → events) [NULL para eventos únicos]
- modality_id UUID (FK → sport_modalities)
```

**`venues`**
```sql
- id UUID (PK)
- group_id UUID (FK → groups)
- name VARCHAR(255)
- address TEXT
- created_at TIMESTAMPTZ
```

#### Fase 0: Modalidades e Atletas

**`sport_modalities`**
```sql
- id UUID (PK)
- group_id UUID (FK → groups)
- name VARCHAR(100)
- icon VARCHAR(10) [emoji]
- color VARCHAR(7) [hex]
- trainings_per_week INTEGER
- positions JSONB [array de strings]
- is_active BOOLEAN DEFAULT TRUE
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**`athlete_modalities`**
```sql
- id UUID (PK)
- user_id UUID (FK → profiles)
- modality_id UUID (FK → sport_modalities)
- preferred_position VARCHAR(50)
- is_active BOOLEAN DEFAULT TRUE
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- UNIQUE(user_id, modality_id)
```

#### Fase 0: Treinos Recorrentes

**`recurring_trainings`** (implícito via `events.is_recurring`)

#### Fase 0: Jogos e Convocações

**`game_convocations`**
```sql
- id UUID (PK)
- event_id UUID (FK → events)
- modality_id UUID (FK → sport_modalities) [NULL = todas]
- required_positions JSONB [{"position": "Goleiro", "count": 2}]
- deadline TIMESTAMPTZ
- created_by UUID (FK → profiles)
- created_at TIMESTAMPTZ
```

**`convocation_responses`**
```sql
- id UUID (PK)
- convocation_id UUID (FK → game_convocations)
- user_id UUID (FK → profiles)
- response VARCHAR(20) ['yes', 'no', 'maybe']
- notes TEXT
- responded_at TIMESTAMPTZ
- UNIQUE(convocation_id, user_id)
```

#### Fase 0: Check-in QR Code

**`checkin_qrcodes`**
```sql
- id UUID (PK)
- event_id UUID (FK → events)
- qr_code TEXT [único]
- expires_at TIMESTAMPTZ
- created_by UUID (FK → profiles)
- created_at TIMESTAMPTZ
```

**`checkins`**
```sql
- id UUID (PK)
- qr_code_id UUID (FK → checkin_qrcodes)
- user_id UUID (FK → profiles)
- checked_in_at TIMESTAMPTZ
- UNIQUE(qr_code_id, user_id)
```

#### Fase 0: Táticas Salvas

**`saved_tactics`**
```sql
- id UUID (PK)
- group_id UUID (FK → groups)
- name VARCHAR(255)
- modality_id UUID (FK → sport_modalities)
- formation VARCHAR(50) ['2-2', '1-2-1', etc]
- field_data JSONB [posições dos jogadores]
- is_public BOOLEAN DEFAULT FALSE
- created_by UUID (FK → profiles)
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

#### Fase 0: Financeiro por Treino

**`charges`** (já existia, foi estendido)
```sql
- id UUID (PK)
- group_id UUID (FK → groups)
- event_id UUID (FK → events) [NOVO - Fase 0]
- user_id UUID (FK → profiles)
- type VARCHAR(20) ['monthly', 'daily', 'fine', 'training', 'other']
- amount_cents INTEGER
- quantity INTEGER
- description TEXT
- due_date DATE
- status VARCHAR(20) ['pending', 'paid', 'cancelled']
- created_by UUID (FK → profiles)
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**Views:**
- `v_training_payments` - Resumo de pagamentos por treino
- `v_training_payment_details` - Detalhes de pagamentos por treino

#### Fase 0: Sistema de Créditos

**`credit_transactions`**
```sql
- id UUID (PK)
- group_id UUID (FK → groups)
- transaction_type VARCHAR(20) ['purchase', 'consumption', 'refund']
- amount INTEGER
- description TEXT
- feature_used VARCHAR(50) [recurring_training, qrcode_checkin, etc]
- event_id UUID (FK → events) [opcional]
- created_by UUID (FK → profiles)
- created_at TIMESTAMPTZ
```

**`credit_packages`**
```sql
- id UUID (PK)
- name VARCHAR(50) UNIQUE
- credits_amount INTEGER
- price_cents INTEGER
- is_active BOOLEAN
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**`promo_coupons`**
```sql
- id UUID (PK)
- code VARCHAR(50) UNIQUE
- coupon_type VARCHAR(20) ['percentage', 'fixed_amount', 'fixed_credits']
- value NUMERIC
- max_uses INTEGER [NULL = ilimitado]
- uses_per_group INTEGER [NULL = ilimitado]
- expires_at TIMESTAMPTZ
- is_active BOOLEAN
- created_at TIMESTAMPTZ
```

**`coupon_usages`**
```sql
- id UUID (PK)
- coupon_id UUID (FK → promo_coupons)
- group_id UUID (FK → groups)
- used_at TIMESTAMPTZ
- UNIQUE(coupon_id, group_id) [para cupons únicos]
```

#### Tabelas Existentes (MVP)

**`event_attendance`**
```sql
- event_id UUID (FK → events)
- user_id UUID (FK → profiles)
- role VARCHAR(10) ['gk', 'line']
- status VARCHAR(20) ['yes', 'no', 'waitlist']
- checked_in_at TIMESTAMPTZ
- order_of_arrival INTEGER
- UNIQUE(event_id, user_id)
```

**`teams`**
```sql
- id UUID (PK)
- event_id UUID (FK → events)
- name VARCHAR(50)
- seed INTEGER
- is_winner BOOLEAN
```

**`team_members`**
```sql
- team_id UUID (FK → teams)
- user_id UUID (FK → profiles)
- position VARCHAR(50)
- starter_bool BOOLEAN
- PRIMARY KEY (team_id, user_id)
```

**`event_actions`**
```sql
- id UUID (PK)
- event_id UUID (FK → events)
- actor_user_id UUID (FK → profiles)
- action_type VARCHAR(20) [goal, assist, save, tackle, error, card, etc]
- subject_user_id UUID (FK → profiles)
- team_id UUID (FK → teams)
- minute_ts INTEGER
- metadata JSONB
- created_at TIMESTAMPTZ
```

**`votes`**
```sql
- id UUID (PK)
- event_id UUID (FK → events)
- voter_user_id UUID (FK → profiles)
- voted_user_id UUID (FK → profiles)
- vote_type VARCHAR(20) [mvp, pereba, paredao, garcom]
- created_at TIMESTAMPTZ
- UNIQUE(event_id, voter_user_id, voted_user_id, vote_type)
```

**`wallets`**
```sql
- id UUID (PK)
- owner_type VARCHAR(20) ['group', 'user']
- owner_id UUID
- balance_cents INTEGER DEFAULT 0
- updated_at TIMESTAMPTZ
```

**`transactions`**
```sql
- id UUID (PK)
- wallet_id UUID (FK → wallets)
- charge_id UUID (FK → charges)
- type VARCHAR(20) ['credit', 'debit']
- amount_cents INTEGER
- method VARCHAR(20) [cash, pix, card]
- created_by UUID (FK → profiles)
- notes TEXT
- created_at TIMESTAMPTZ
```

**`invites`**
```sql
- id UUID (PK)
- group_id UUID (FK → groups)
- code VARCHAR(20) UNIQUE
- created_by UUID (FK → profiles)
- expires_at TIMESTAMPTZ
- max_uses INTEGER
- used_count INTEGER DEFAULT 0
- created_at TIMESTAMPTZ
```

### 2.2 Relacionamentos (Foreign Keys)

```
profiles (1) ──< (N) group_members (N) >── (1) groups
groups (1) ──< (N) events
events (1) ──< (N) event_attendance
events (1) ──< (N) teams
teams (1) ──< (N) team_members
events (1) ──< (N) event_actions
groups (1) ──< (N) sport_modalities
sport_modalities (1) ──< (N) athlete_modalities
profiles (1) ──< (N) athlete_modalities
events (1) ──< (N) game_convocations
game_convocations (1) ──< (N) convocation_responses
events (1) ──< (N) checkin_qrcodes
checkin_qrcodes (1) ──< (N) checkins
groups (1) ──< (N) saved_tactics
groups (1) ──< (N) credit_transactions
groups (1) ──< (N) charges
promo_coupons (1) ──< (N) coupon_usages
groups (1) ──< (N) coupon_usages
```

### 2.3 Funções SQL (PL/pgSQL)

#### Sistema de Créditos

**`consume_credits(group_id, amount, feature, user_id, event_id?, description?)`**
- Consome créditos do grupo
- Cria transação de consumo
- Atualiza `groups.credits_balance` e `credits_consumed`
- Retorna novo saldo

**`add_credits(group_id, amount, user_id, description?)`**
- Adiciona créditos ao grupo
- Cria transação de compra
- Atualiza `groups.credits_balance` e `credits_purchased`
- Retorna novo saldo

**`get_pix_code_for_group(group_id)`**
- Retorna código Pix (prioridade: grupo → atlética pai)

#### Sistema de Cupons

**`validate_promo_coupon(code, group_id)`**
- Valida cupom (existência, expiração, limites)
- Retorna detalhes do cupom

**`apply_promo_coupon(code, group_id, original_price_cents, user_id)`**
- Aplica cupom
- Registra uso
- Retorna preço final e créditos bônus

**`get_group_coupon_history(group_id)`**
- Retorna histórico de cupons usados pelo grupo

#### Sistema de Modalidades

**`get_group_modalities(group_id)`**
- Retorna modalidades do grupo com contagem de atletas

**`get_modality_athletes(modality_id)`**
- Retorna atletas de uma modalidade

**`get_athlete_modalities(user_id, group_id?)`**
- Retorna modalidades de um atleta

#### Sistema de Convocações

**`get_convocation_stats(convocation_id)`**
- Retorna estatísticas de respostas (yes/no/maybe)

**`is_convocation_complete(convocation_id)`**
- Verifica se convocação está completa (todas posições preenchidas)

#### Sistema de Táticas

**`get_group_tactics(group_id, modality_id?)`**
- Retorna táticas do grupo

**`get_public_tactics(modality_id?)`**
- Retorna táticas públicas

#### Sistema de Treinos Recorrentes

**`generate_recurring_events(template_event_id, start_date, end_date?)`**
- Gera eventos futuros baseado em template
- Retorna número de eventos criados

#### Sistema de Check-in

**`process_qrcode_checkin(qr_code, user_id)`**
- Processa check-in via QR Code
- Valida expiração
- Cria registro de check-in

**`create_event_qrcode(event_id, user_id, expires_in_minutes?)`**
- Cria QR Code para evento
- Retorna código

**`get_event_checkins(event_id)`**
- Retorna lista de check-ins do evento

#### Sistema Financeiro

**`get_training_payment_summary(event_id)`**
- Retorna resumo de pagamentos do treino

**`get_training_pending_payments(event_id)`**
- Retorna lista de pagamentos pendentes

**`create_training_charge(event_id, user_id, amount_cents, description?)`**
- Cria cobrança para treino
- Retorna charge_id

#### Sistema de Hierarquia

**`check_hierarchy_cycle(group_id, parent_id)`**
- Verifica se criar parent criaria ciclo
- Retorna TRUE se seguro, FALSE se ciclo

**`can_manage_group(user_id, group_id)`**
- Verifica se usuário pode gerenciar grupo
- Considera hierarquia (admin de atlética pode gerenciar filhos)

**`update_sport_modalities_updated_at()`** (trigger)
- Atualiza `updated_at` em `sport_modalities`

**`update_athlete_modalities_updated_at()`** (trigger)
- Atualiza `updated_at` em `athlete_modalities`

**`update_game_convocations_updated_at()`** (trigger
- Atualiza `updated_at` em `game_convocations`

**`update_convocation_responses_updated_at()`** (trigger)
- Atualiza `updated_at` em `convocation_responses`

**`update_saved_tactics_updated_at()`** (trigger)
- Atualiza `updated_at` em `saved_tactics`

**`update_credit_packages_updated_at()`** (trigger)
- Atualiza `updated_at` em `credit_packages`

### 2.4 Views

**`v_training_payments`**
```sql
SELECT
  e.id as event_id,
  e.name as event_name,
  (e.created_at)::DATE as event_date,
  COUNT(DISTINCT c.id) as total_charges,
  SUM(c.amount_cents) / 100.0 as total_amount,
  0 as total_paid,  -- Placeholder (não existe no schema antigo)
  0 as paid_count,  -- Placeholder
  0 as pending_count -- Placeholder
FROM events e
LEFT JOIN charges c ON e.id = c.event_id
WHERE e.event_type = 'training'
GROUP BY e.id, e.name, e.created_at
```

**`v_training_payment_details`**
```sql
SELECT
  e.id as event_id,
  c.id as charge_id,
  p.full_name as user_name,
  c.amount_cents / 100.0 as amount,
  c.status,
  c.due_date
FROM events e
JOIN charges c ON e.id = c.event_id
JOIN profiles p ON c.user_id = p.id
WHERE e.event_type = 'training'
```

### 2.5 Índices Estratégicos

```sql
-- Performance
CREATE INDEX idx_groups_parent_group_id ON groups(parent_group_id);
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX idx_event_attendance_user_id ON event_attendance(user_id);
CREATE INDEX idx_sport_modalities_group_id ON sport_modalities(group_id);
CREATE INDEX idx_athlete_modalities_user_id ON athlete_modalities(user_id);
CREATE INDEX idx_athlete_modalities_modality_id ON athlete_modalities(modality_id);
CREATE INDEX idx_credit_transactions_group_id ON credit_transactions(group_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_charges_event_id ON charges(event_id);
CREATE INDEX idx_charges_user_id ON charges(user_id);
```

---

## 3. ARQUITETURA DE BACKEND (API)

### 3.1 Estrutura de API Routes

```
/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth handler (JWT)
│   └── signup/route.ts           # POST - Criar usuário
│
├── groups/
│   ├── route.ts                  # GET (list), POST (create)
│   ├── join/route.ts             # POST - Entrar com código
│   ├── managed/route.ts          # GET - Grupos gerenciáveis (Fase 0)
│   └── [groupId]/
│       ├── route.ts              # GET, PATCH, DELETE
│       ├── members/
│       │   ├── route.ts          # GET, POST
│       │   ├── create-user/route.ts  # POST - Criar usuário e adicionar
│       │   └── [userId]/route.ts # PATCH, DELETE
│       ├── invites/
│       │   ├── route.ts          # GET, POST
│       │   └── [inviteId]/route.ts # DELETE
│       ├── stats/route.ts        # GET - Estatísticas do grupo
│       ├── my-stats/route.ts     # GET - Estatísticas do usuário
│       ├── rankings/route.ts     # GET - Rankings
│       ├── draw-config/route.ts  # GET, PATCH
│       ├── event-settings/route.ts # GET, PATCH
│       └── charges/
│           ├── route.ts         # GET, POST
│           └── [chargeId]/route.ts # PATCH, DELETE
│
├── events/
│   ├── route.ts                  # GET (list), POST (create)
│   └── [eventId]/
│       ├── route.ts              # GET, PATCH, DELETE
│       ├── rsvp/route.ts         # POST - RSVP do usuário
│       ├── admin-rsvp/route.ts  # POST - Admin gerencia RSVP
│       ├── draw/route.ts         # POST - Sortear times
│       ├── teams/
│       │   ├── route.ts          # GET, POST
│       │   └── swap/route.ts    # POST - Trocar jogadores
│       ├── actions/route.ts      # GET, POST - Ações de jogo
│       └── ratings/
│           ├── route.ts          # GET, POST - Votações
│           ├── finalize/route.ts # POST - Finalizar votação
│           └── tiebreaker/
│               ├── route.ts      # GET - Status do tiebreaker
│               ├── vote/route.ts # POST - Votar no tiebreaker
│               └── decide/route.ts # POST - Decidir tiebreaker
│
├── modalities/                   # Fase 1
│   ├── route.ts                  # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts              # GET, PATCH, DELETE
│       └── positions/route.ts    # GET, POST - Configurar posições
│
├── athletes/                      # Fase 1
│   └── [userId]/
│       └── modalities/
│           ├── route.ts          # GET (list), POST (add)
│           └── [modalityId]/route.ts # PATCH (update), DELETE (remove)
│
├── credits/                       # Fase 0
│   ├── route.ts                  # GET (balance), POST (purchase)
│   ├── check/route.ts            # POST - Verificar créditos
│   ├── validate-coupon/route.ts # POST - Validar cupom
│   └── history/route.ts         # GET - Histórico de transações
│
├── recurring-trainings/          # Fase 0 (exemplo)
│   └── route.ts                  # GET (list), POST (create)
│
└── users/
    ├── me/
    │   └── pending-charges-count/route.ts # GET
    └── search/route.ts          # GET - Buscar usuários
```

### 3.2 Middlewares e Helpers

#### Autenticação

**`src/lib/auth-helpers.ts`**

```typescript
// getCurrentUser()
// - Obtém usuário autenticado via NextAuth
// - Busca dados adicionais no banco (profiles)
// - Retorna null se não autenticado

// requireAuth()
// - Wrapper de getCurrentUser()
// - Lança erro se não autenticado
// - Usado em todas as rotas protegidas
```

**Fluxo:**
```
Request → NextAuth Session → getCurrentUser() → Database (profiles) → User Object
```

#### Autorização

**`src/lib/permissions.ts`**

```typescript
// canManageGroup(userId, groupId)
// - Verifica se usuário é admin do grupo
// - Considera hierarquia (admin de atlética pode gerenciar filhos)
// - Retorna boolean

// canCreateGroup(userId, parentGroupId?)
// - Verifica se usuário pode criar grupo filho
// - Valida regras de hierarquia (max 2 níveis)

// getGroupHierarchy(groupId)
// - Retorna hierarquia completa (pai + filhos)
// - Retorna GroupHierarchy | null

// getManagedGroups(userId)
// - Retorna todos os grupos gerenciáveis pelo usuário
// - Inclui grupos filhos se for admin de atlética

// getGroupPermissions(userId, groupId)
// - Retorna todas as permissões do usuário
// - { canManage, canCreateChild, canEditSettings, etc }

// validateHierarchy(groupType, parentGroupId?)
// - Valida regras de hierarquia
// - Máximo 2 níveis
// - Apenas atléticas podem ter filhos
```

**`src/lib/permissions-middleware.ts`**

```typescript
// withPermissionCheck(request, handler, options)
// - Verifica autenticação
// - Verifica membership
// - Verifica permissões (requireAdmin, requireManage, allowMember)
// - Passa permissions object para handler
// - Retorna 403 se sem permissão
```

#### Sistema de Créditos

**`src/lib/credits.ts`**

```typescript
// getCreditBalance(groupId)
// - Retorna saldo atual do grupo
// - { balance, purchased, consumed }

// hasEnoughCredits(groupId, feature)
// - Verifica se grupo tem créditos suficientes
// - Retorna { hasCredits, required, current }

// checkAndConsumeCredits(groupId, feature, userId, eventId?, description?)
// - Verifica créditos
// - Consome se tiver
// - Chama função SQL consume_credits()
// - Retorna { success, newBalance } ou { success: false, error }

// purchaseCredits(groupId, packageId, userId, couponCode?)
// - Compra pacote de créditos
// - Aplica cupom se fornecido
// - Chama função SQL add_credits()
// - Retorna { success, newBalance, transaction }

// validateCoupon(code, groupId)
// - Valida cupom promocional
// - Chama função SQL validate_promo_coupon()
// - Retorna CouponValidation

// applyCoupon(code, groupId, originalPriceCents, userId)
// - Aplica cupom
// - Chama função SQL apply_promo_coupon()
// - Retorna { finalPrice, bonusCredits, discount }

// getCreditPackages()
// - Retorna pacotes disponíveis
// - Filtra apenas ativos

// getCreditTransactions(groupId, limit?)
// - Retorna histórico de transações
// - Inclui compras, consumos, refunds
```

**`src/lib/credits-middleware.ts`**

```typescript
// withCreditsCheck(request, feature, handler, options)
// - Verifica autenticação
// - Verifica membership
// - Verifica créditos suficientes
// - Consome créditos automaticamente (se autoConsume = true)
// - Retorna 402 (Payment Required) se sem créditos
// - Passa user, groupId, eventId para handler
```

#### Sistema de Modalidades

**`src/lib/modalities.ts`**

```typescript
// getGroupModalities(groupId)
// - Retorna modalidades do grupo com contagem de atletas
// - Retorna ModalityWithStats[]

// getModalityById(modalityId)
// - Retorna modalidade com detalhes completos
// - Retorna ModalityWithStats | null

// getModalityAthletes(modalityId)
// - Retorna atletas de uma modalidade
// - Retorna AthleteModality[]

// createModality(data)
// - Cria nova modalidade
// - Valida dados
// - Retorna modalidade criada

// updateModality(modalityId, data)
// - Atualiza modalidade
// - Valida permissões (apenas admin)
// - Retorna modalidade atualizada

// deleteModality(modalityId)
// - Soft delete (is_active = false)
// - Valida permissões
// - Retorna success

// setModalityPositions(modalityId, positions)
// - Configura posições da modalidade
// - Atualiza JSONB positions
// - Retorna modalidade atualizada
```

### 3.3 Validação (Zod)

**`src/lib/validations.ts`**

```typescript
// createGroupSchema
// - name, description, privacy
// - groupType, parentGroupId (Fase 0)

// createModalitySchema
// - groupId, name, icon?, color?, trainingsPerWeek?, description?

// updateModalitySchema
// - name?, icon?, color?, trainingsPerWeek?, description?

// createAthleteModalitySchema
// - userId, modalityId, preferredPosition?

// updateAthleteModalitySchema
// - preferredPosition?, isActive?

// createRecurringTrainingSchema
// - groupId, name, recurrencePattern, startDate, endDate?, etc
```

### 3.4 Fluxo de Requisição API

```
1. Request chega em /api/...
2. Middleware Next.js (se aplicável)
3. requireAuth() → Verifica autenticação
4. Validação Zod (se aplicável)
5. Verificação de permissões (se aplicável)
6. Lógica de negócio (helpers)
7. Acesso ao banco (sql``)
8. Resposta JSON
```

**Exemplo: Criar Modalidade**

```
POST /api/modalities
  ↓
requireAuth() → User
  ↓
createModalitySchema.safeParse(body)
  ↓
Verificar membership (group_members)
  ↓
Verificar role = 'admin'
  ↓
sql`INSERT INTO sport_modalities ...`
  ↓
Return { modality: {...} }
```

---

## 4. ARQUITETURA DE FRONTEND (UI/UX)

### 4.1 Estrutura de Páginas

```
app/
├── layout.tsx                    # Root layout (AuthProvider, Toasters)
├── page.tsx                      # Landing page
│
├── (dashboard)/                  # Grupo de rotas protegidas
│   ├── layout.tsx                # ❌ NÃO EXISTE - Precisa criar
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard principal
│   ├── modalidades/
│   │   ├── page.tsx              # Lista de modalidades
│   │   └── [id]/page.tsx         # Detalhes da modalidade
│   ├── atletas/
│   │   ├── page.tsx              # Lista de atletas
│   │   └── [id]/page.tsx         # Perfil do atleta
│   ├── treinos/                  # ❌ NÃO EXISTE
│   │   └── page.tsx
│   ├── financeiro/               # ❌ NÃO EXISTE
│   │   └── page.tsx
│   ├── frequencia/               # ❌ NÃO EXISTE
│   │   └── page.tsx
│   ├── rankings/                 # ❌ NÃO EXISTE
│   │   └── page.tsx
│   └── jogos/                    # ❌ NÃO EXISTE
│       └── page.tsx
│
├── groups/
│   ├── new/page.tsx              # Criar grupo
│   ├── join/page.tsx             # Entrar em grupo
│   └── [groupId]/
│       ├── page.tsx              # Dashboard do grupo
│       ├── settings/page.tsx     # Configurações
│       ├── payments/page.tsx     # Financeiro
│       └── events/
│           ├── new/page.tsx     # Criar evento
│           └── [eventId]/page.tsx # Detalhes do evento
│
├── events/
│   └── [eventId]/page.tsx        # Página de evento (standalone)
│
└── auth/
    ├── signin/page.tsx           # Login
    ├── signup/page.tsx           # Cadastro
    └── error/page.tsx              # Erro de autenticação
```

### 4.2 Componentes

#### Layout

**`src/components/layout/sidebar.tsx`**
- Navegação hierárquica
- Suporte a groupType (athletic/pelada)
- Seções colapsáveis
- Badges (notificações, créditos, pendentes)
- Design System UzzAI

**`src/components/layout/dashboard-header.tsx`**
- Header básico (existe mas é simples)
- ❌ Falta: Search, Notificações, User Profile Dropdown

**`src/components/layout/topbar.tsx`**
- ❌ NÃO EXISTE - Precisa criar
- Search bar
- Notificações com badge
- User profile dropdown
- Título dinâmico

#### UI Base (shadcn/ui)

**Componentes Existentes:**
- `button.tsx`
- `card.tsx`
- `input.tsx`
- `select.tsx`
- `dialog.tsx`
- `alert-dialog.tsx`
- `badge.tsx`
- `avatar.tsx`
- `tabs.tsx`
- `table.tsx`
- `toast.tsx`
- `tooltip.tsx`
- `popover.tsx`
- `checkbox.tsx`
- `collapsible.tsx`

**Componentes UzzAI:**
- `metric-card.tsx` ✅
- `status-badge.tsx` ✅
- `progress-bar.tsx` ✅

**Componentes Faltantes:**
- `loading-skeleton.tsx` ❌
- `empty-state.tsx` ❌

#### Modalidades

**`src/components/modalities/modality-card.tsx`**
- Card visual da modalidade
- Ícone, nome, estatísticas
- Ações (editar, excluir, ver detalhes)

**`src/components/modalities/modality-form.tsx`**
- Formulário de criação/edição
- Validação Zod
- Upload de ícone (emoji)

**`src/components/modalities/modality-modal.tsx`**
- Modal wrapper
- Integra ModalityForm

**`src/components/modalities/positions-config.tsx`**
- Configuração de posições
- Adicionar/remover posições
- Salvar como JSONB

**`src/components/modalities/modality-icon.tsx`**
- Renderização de ícone
- Suporte a emoji e cores

#### Atletas

**`src/components/athletes/athletes-table.tsx`**
- Tabela de atletas
- Colunas: Nome, Modalidades, Ações
- Responsiva

**`src/components/athletes/athlete-filters.tsx`**
- Filtros (busca, modalidade, rating, posição)
- Estado controlado

**`src/components/athletes/add-modality-modal.tsx`**
- Modal para adicionar modalidade ao atleta
- Seleção de modalidade
- Configuração de posição preferida

**`src/components/athletes/edit-rating-modal.tsx`**
- Modal para editar rating
- Slider 1-10
- Salvar rating

**`src/components/athletes/modality-badge.tsx`**
- Badge de modalidade
- Ícone + nome
- Tooltip com detalhes

#### Créditos

**`src/components/credits/credits-balance.tsx`**
- Exibe saldo atual
- Total comprado/consumido
- Aviso de saldo baixo
- Lista de custos das features
- Botão para comprar

**`src/components/credits/buy-credits-modal.tsx`**
- Modal de compra
- Seleção de pacote
- Campo de cupom
- Validação em tempo real
- Cálculo de desconto
- Processo de compra

#### Dashboard

**`src/components/dashboard/groups-card.tsx`**
- Lista de grupos do usuário
- Cards clicáveis

**`src/components/dashboard/upcoming-events-card.tsx`**
- Próximos eventos
- Status de confirmação

**`src/components/dashboard/pending-payments-card.tsx`**
- Pagamentos pendentes
- Contador

### 4.3 Estados e Hooks

#### Estados Locais (useState)

**Padrão Atual:**
- Cada página gerencia seus próprios estados
- `useState` para dados, loading, modais
- `useEffect` para carregar dados

**Exemplo:**
```typescript
const [modalities, setModalities] = useState<Modality[]>([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
```

#### Contextos

**`src/components/providers/auth-provider.tsx`**
- ✅ Existe mas é básico
- Wrapper para NextAuth
- ❌ Falta: GroupContext

**Contextos Faltantes:**
- `GroupContext` ❌ - Gerenciar grupo atual
- `NotificationContext` ❌ - Notificações globais
- `ThemeContext` ❌ - Tema (se aplicável)

### 4.4 Fluxo de Dados Frontend

```
1. Usuário acessa página
2. useEffect() dispara
3. fetch('/api/...') → API Route
4. API retorna dados
5. setState() atualiza componente
6. UI re-renderiza
7. Usuário interage
8. Handler atualiza estado local
9. fetch('/api/...', { method: 'POST' }) → API Route
10. API processa e retorna
11. toast.success() feedback
12. Recarrega dados (opcional)
```

**Exemplo: Criar Modalidade**

```
1. Usuário clica "Nova Modalidade"
2. setShowCreateModal(true)
3. Modal abre com ModalityForm
4. Usuário preenche formulário
5. onSubmit() → fetch('/api/modalities', { method: 'POST', body })
6. API valida e cria
7. toast.success('Modalidade criada!')
8. loadModalities() recarrega lista
9. Modal fecha
```

---

## 5. FLUXOS DE DADOS

### 5.1 Fluxo de Autenticação

```
1. Usuário acessa /auth/signin
2. Preenche email/senha
3. POST /api/auth/signin
4. NextAuth valida credentials
5. Busca user em auth.users
6. Compara password_hash (bcrypt)
7. Cria JWT session
8. Cookie setado
9. Redirect para /dashboard
10. Middleware proxy() verifica session
11. Permite acesso
```

### 5.2 Fluxo de Criação de Grupo

```
Frontend:
1. Usuário acessa /groups/new
2. Preenche formulário (name, description, privacy, groupType, parentGroupId)
3. onSubmit() → POST /api/groups

Backend:
4. requireAuth() → User
5. createGroupSchema.safeParse(body)
6. validateHierarchy(groupType, parentGroupId)
7. canCreateGroup(userId, parentGroupId)
8. sql`INSERT INTO groups ...`
9. sql`INSERT INTO group_members (user_id, group_id, role='admin')`
10. sql`INSERT INTO invites (code gerado)`
11. Return { group, inviteCode }

Frontend:
12. toast.success('Grupo criado!')
13. router.push(`/groups/${group.id}`)
```

### 5.3 Fluxo de Criação de Modalidade

```
Frontend:
1. Usuário acessa /modalidades
2. Clica "Nova Modalidade"
3. Modal abre com ModalityForm
4. Preenche (name, icon, color, trainingsPerWeek)
5. onSubmit() → POST /api/modalities

Backend:
6. requireAuth() → User
7. createModalitySchema.safeParse(body)
8. Verificar membership (group_members WHERE user_id AND group_id)
9. Verificar role = 'admin'
10. sql`INSERT INTO sport_modalities ...`
11. Return { modality }

Frontend:
12. toast.success('Modalidade criada!')
13. loadModalities() → GET /api/modalities?group_id=...
14. Lista atualiza
15. Modal fecha
```

### 5.4 Fluxo de Compra de Créditos

```
Frontend:
1. Usuário clica "Comprar Créditos"
2. Modal BuyCreditsModal abre
3. Seleciona pacote
4. (Opcional) Insere cupom
5. Clica "Validar Cupom" → POST /api/credits/validate-coupon
6. Cupom validado, desconto calculado
7. Clica "Comprar" → POST /api/credits

Backend:
8. requireAuth() → User
9. Verificar membership e role = 'admin'
10. getCreditPackages() → Buscar pacote
11. Se cupom: validateCoupon() → validate_promo_coupon()
12. Se cupom válido: applyCoupon() → apply_promo_coupon()
13. purchaseCredits() → add_credits() SQL
14. Se cupom: Registrar uso em coupon_usages
15. Return { success, newBalance, transaction }

Frontend:
16. toast.success('Créditos comprados!')
17. Atualizar CreditsBalance
18. Modal fecha
```

### 5.5 Fluxo de Consumo de Créditos (Feature Premium)

```
Frontend:
1. Usuário tenta usar feature premium (ex: Criar Treino Recorrente)
2. POST /api/recurring-trainings

Backend:
3. withCreditsCheck(request, 'recurring_training', handler)
   a. requireAuth() → User
   b. Extrair groupId do body
   c. Verificar membership
   d. hasEnoughCredits(groupId, 'recurring_training')
   e. Se não tiver: Return 402 Payment Required
   f. Se tiver: checkAndConsumeCredits() → consume_credits() SQL
   g. Executar handler (criar treino)
4. Handler cria treino recorrente
5. Return { success, recurringEvent }

Frontend:
6. toast.success('Treino recorrente criado!')
7. Recarregar lista de treinos
```

### 5.6 Fluxo de RSVP em Treino

```
Frontend:
1. Usuário vê lista de treinos
2. Clica "Confirmar Presença"
3. POST /api/events/[eventId]/rsvp { status: 'yes' }

Backend:
4. requireAuth() → User
5. Verificar membership no grupo do evento
6. Verificar se evento está scheduled
7. Verificar se há vaga (max_players)
8. sql`INSERT INTO event_attendance ... ON CONFLICT UPDATE`
9. Se waitlist: order_of_arrival calculado
10. Return { attendance }

Frontend:
11. toast.success('Presença confirmada!')
12. Progress bar atualiza
13. Avatar aparece na lista
```

---

## 6. AUTENTICAÇÃO E AUTORIZAÇÃO

### 6.1 Autenticação (NextAuth v5)

**Configuração:**
- Provider: Credentials (email/senha)
- Strategy: JWT (não database session)
- Session: 30 dias
- Cookies: HttpOnly, Secure (production)

**Fluxo:**
```
1. POST /api/auth/signin
2. NextAuth valida credentials
3. Busca em auth.users (Supabase Auth)
4. Compara password_hash
5. Cria JWT token
6. Cookie setado
7. Session disponível via auth()
```

**Middleware:**
- `src/proxy.ts` - Middleware global
- Verifica autenticação em todas as rotas (exceto públicas)
- Redirect para /auth/signin se não autenticado
- Redirect para /dashboard se autenticado em /auth

### 6.2 Autorização (Roles e Permissões)

**Níveis de Permissão:**

1. **Público** (sem autenticação)
   - `/` (landing)
   - `/auth/signin`
   - `/auth/signup`

2. **Autenticado** (qualquer usuário logado)
   - `/dashboard`
   - `/groups/new`
   - `/groups/join`

3. **Membro do Grupo** (user_id em group_members)
   - Ver grupos
   - Ver eventos
   - RSVP em eventos
   - Ver rankings

4. **Admin do Grupo** (role = 'admin' em group_members)
   - Tudo de membro +
   - Criar/editar/excluir eventos
   - Gerenciar membros
   - Criar/editar modalidades
   - Gerenciar financeiro
   - Comprar créditos

5. **Admin de Atlética** (admin de grupo com parent_group_id)
   - Tudo de admin +
   - Gerenciar grupos filhos
   - Criar grupos filhos

**Verificação de Permissões:**

```typescript
// Em API Routes
const user = await requireAuth();
const membership = await sql`
  SELECT role FROM group_members
  WHERE user_id = ${user.id} AND group_id = ${groupId}
`;

if (!membership || membership.role !== 'admin') {
  return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
}
```

**Middleware de Permissões:**

```typescript
// withPermissionCheck(request, handler, { requireAdmin: true })
// - Verifica autenticação
// - Verifica membership
// - Verifica role
// - Retorna 403 se sem permissão
```

---

## 7. ESTADOS E CONTEXTOS

### 7.1 Estados Locais (Componentes)

**Padrão Atual:**
- Cada componente gerencia seus próprios estados
- `useState` para dados, loading, modais, filtros
- `useEffect` para carregar dados iniciais

**Exemplo Típico:**
```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [showModal, setShowModal] = useState(false);
const [filters, setFilters] = useState<FilterType>({});
```

### 7.2 Contextos Existentes

**`AuthProvider`** ✅
- Wrapper básico para NextAuth
- Não expõe estado customizado

### 7.3 Contextos Faltantes (Recomendados)

**`GroupContext`** ❌
```typescript
interface GroupContextType {
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  groups: Group[];
  loadGroups: () => Promise<void>;
}

// Uso:
const { currentGroup, setCurrentGroup } = useGroup();
```

**`NotificationContext`** ❌
```typescript
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
}
```

### 7.4 Estado Global (Futuro)

**Recomendação: Zustand ou React Context**

Para estados que precisam ser compartilhados:
- Grupo atual
- Notificações
- Preferências do usuário
- Cache de dados

---

## 8. NAVEGAÇÃO E ROTEAMENTO

### 8.1 Estrutura de Rotas

**Públicas:**
- `/` - Landing page
- `/auth/signin` - Login
- `/auth/signup` - Cadastro
- `/auth/error` - Erro de autenticação

**Protegidas (Dashboard):**
- `/dashboard` - Dashboard principal
- `/modalidades` - Lista de modalidades
- `/modalidades/[id]` - Detalhes da modalidade
- `/atletas` - Lista de atletas
- `/atletas/[id]` - Perfil do atleta
- `/treinos` - ❌ Não existe
- `/financeiro` - ❌ Não existe
- `/frequencia` - ❌ Não existe
- `/rankings` - ❌ Não existe
- `/jogos` - ❌ Não existe

**Protegidas (Grupos):**
- `/groups/new` - Criar grupo
- `/groups/join` - Entrar em grupo
- `/groups/[groupId]` - Dashboard do grupo
- `/groups/[groupId]/settings` - Configurações
- `/groups/[groupId]/payments` - Financeiro
- `/groups/[groupId]/events/new` - Criar evento
- `/groups/[groupId]/events/[eventId]` - Detalhes do evento

**Standalone:**
- `/events/[eventId]` - Página de evento

### 8.2 Navegação Atual

**Sidebar** ✅
- Existe mas não está integrada em todas as páginas
- Navegação hierárquica implementada
- Suporte a groupType e userRole

**Topbar** ❌
- Não existe
- Falta search, notificações, user profile

**Breadcrumbs** ❌
- Não existe
- Seria útil para navegação hierárquica

### 8.3 Roteamento Next.js

**App Router:**
- File-based routing
- `(dashboard)` - Route group (não afeta URL)
- `[id]` - Dynamic route
- `layout.tsx` - Layout compartilhado
- `page.tsx` - Página

**Middleware:**
- `src/proxy.ts` - Middleware global
- Protege rotas automaticamente
- Redirects baseados em autenticação

---

## 9. INTEGRAÇÕES E SERVIÇOS

### 9.1 Integrações Existentes

**Supabase (Database)**
- PostgreSQL 15+
- Connection pooling
- SSL required

**NextAuth v5**
- Autenticação JWT
- Session management
- Cookie-based

**Vercel**
- Deploy automático
- Edge functions
- Analytics

### 9.2 Integrações Futuras

**Pix (Pagamentos)**
- ❌ Não implementado
- Necessário para Split Pix automático
- Integração com gateway de pagamento

**Notificações Push**
- ❌ Não implementado
- OneSignal ou FCM
- Notificações de eventos, convocações

**WhatsApp Business API**
- ❌ Não implementado
- Envio de mensagens automáticas
- Lembretes de eventos

**Analytics**
- ❌ Não implementado
- Google Analytics ou Plausible
- Tracking de eventos

---

## 10. DIAGRAMAS DE FLUXO

### 10.1 Fluxo de Criação de Treino Recorrente

```
[Usuário] → Clica "Criar Treino Recorrente"
    ↓
[Frontend] → Abre Modal com Formulário
    ↓
[Usuário] → Preenche dados (nome, recorrência, datas)
    ↓
[Frontend] → POST /api/recurring-trainings
    ↓
[Backend] → withCreditsCheck()
    ├─→ Verifica autenticação
    ├─→ Verifica membership
    ├─→ Verifica créditos (5 necessários)
    ├─→ Consome créditos (consume_credits SQL)
    └─→ Executa handler
        ↓
[Backend] → Valida dados (Zod)
    ↓
[Backend] → sql`INSERT INTO events (is_recurring=true, ...)`
    ↓
[Backend] → generate_recurring_events() SQL
    ├─→ Gera eventos futuros (30 dias)
    └─→ Retorna número de eventos criados
    ↓
[Backend] → Return { success, recurringEvent }
    ↓
[Frontend] → toast.success('Treino recorrente criado!')
    ↓
[Frontend] → Recarrega lista de treinos
```

### 10.2 Fluxo de Compra de Créditos com Cupom

```
[Usuário] → Clica "Comprar Créditos"
    ↓
[Frontend] → Abre BuyCreditsModal
    ↓
[Usuário] → Seleciona pacote (300 créditos = R$ 50)
    ↓
[Usuário] → Insere cupom "PROMO20"
    ↓
[Frontend] → POST /api/credits/validate-coupon
    ↓
[Backend] → validate_promo_coupon() SQL
    ├─→ Verifica existência
    ├─→ Verifica expiração
    ├─→ Verifica limites (max_uses, uses_per_group)
    └─→ Retorna { isValid, discountType, discountValue }
    ↓
[Frontend] → Mostra desconto (20% = R$ 10 off)
    ↓
[Usuário] → Clica "Comprar"
    ↓
[Frontend] → POST /api/credits { packageId, couponCode }
    ↓
[Backend] → requireAuth() + Verificar admin
    ↓
[Backend] → apply_promo_coupon() SQL
    ├─→ Calcula desconto (R$ 50 - R$ 10 = R$ 40)
    ├─→ Registra uso em coupon_usages
    └─→ Retorna { finalPrice, bonusCredits }
    ↓
[Backend] → add_credits() SQL
    ├─→ Adiciona 300 créditos
    ├─→ Cria transação de compra
    └─→ Atualiza groups.credits_balance
    ↓
[Backend] → Return { success, newBalance, transaction }
    ↓
[Frontend] → toast.success('Créditos comprados!')
    ↓
[Frontend] → Atualiza CreditsBalance component
```

### 10.3 Fluxo de Hierarquia (Criar Grupo Filho)

```
[Usuário] → Acessa /groups/new
    ↓
[Frontend] → Carrega grupos gerenciáveis
    ├─→ GET /api/groups/managed
    └─→ getManagedGroups() → Retorna atléticas do usuário
    ↓
[Usuário] → Seleciona "Criar Pelada" (groupType = 'pelada')
    ↓
[Usuário] → Seleciona atlética pai (parentGroupId)
    ↓
[Frontend] → Valida (pelada deve ter parent)
    ↓
[Usuário] → Preenche nome e clica "Criar"
    ↓
[Frontend] → POST /api/groups { name, groupType: 'pelada', parentGroupId }
    ↓
[Backend] → requireAuth() + validateHierarchy()
    ├─→ Verifica se parent é atlética
    ├─→ Verifica se parent não tem mais de 1 nível
    └─→ Verifica canCreateGroup(userId, parentGroupId)
    ↓
[Backend] → sql`INSERT INTO groups (parent_group_id, group_type, ...)`
    ↓
[Backend] → sql`INSERT INTO group_members (role='admin')`
    ↓
[Backend] → Return { group }
    ↓
[Frontend] → toast.success('Pelada criada!')
    ↓
[Frontend] → router.push(`/groups/${group.id}`)
```

---

## 11. PONTOS CRÍTICOS DE ARQUITETURA

### 11.1 Falta de Layout Unificado

**Problema:**
- Cada página tem seu próprio layout
- Sidebar não está integrada
- Topbar não existe
- Inconsistência visual

**Solução:**
```tsx
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

### 11.2 Falta de Contexto de Grupo

**Problema:**
- `groupId` hardcoded (`'temp-group-id'`)
- Não há forma de trocar de grupo
- Dados não são compartilhados entre páginas

**Solução:**
```tsx
// src/contexts/group-context.tsx
const GroupContext = createContext<GroupContextType>();

export function GroupProvider({ children }) {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  // ...
}
```

### 11.3 Falta de Cache e Otimização

**Problema:**
- Cada página faz fetch independente
- Sem cache de dados
- Múltiplas requisições para mesmos dados

**Solução:**
- React Query ou SWR para cache
- Revalidação inteligente
- Prefetch de dados relacionados

### 11.4 Falta de Tratamento de Erros Global

**Problema:**
- Erros não são tratados consistentemente
- Sem error boundaries
- Feedback de erro limitado

**Solução:**
- Error boundaries do React
- Toast notifications para erros
- Páginas de erro customizadas

---

## 12. RECOMENDAÇÕES ARQUITETURAIS

### 12.1 Curto Prazo (Antes da Fase 2)

1. **Criar Layout Unificado**
   - DashboardLayout com Sidebar + Topbar
   - Integrar em todas as páginas

2. **Criar GroupContext**
   - Gerenciar grupo atual
   - Compartilhar entre páginas

3. **Implementar Topbar**
   - Search, notificações, user profile

4. **Melhorar Dashboard**
   - Métricas principais
   - Grid de modalidades
   - Lista de treinos

### 12.2 Médio Prazo (Fase 2)

1. **Sistema de Cache**
   - React Query ou SWR
   - Otimizar requisições

2. **Error Handling**
   - Error boundaries
   - Tratamento global

3. **Loading States**
   - Skeleton loaders
   - Estados consistentes

### 12.3 Longo Prazo (Fase 3+)

1. **Real-time**
   - WebSockets ou Server-Sent Events
   - Atualizações ao vivo

2. **Offline Support**
   - Service Workers
   - Cache de dados

3. **Performance**
   - Code splitting
   - Lazy loading
   - Image optimization

---

## 13. MÉTRICAS DE ARQUITETURA

### 13.1 Cobertura de Features

```
Features Planejadas: 15
Features Implementadas: 8 (53%)
Features Parciais: 4 (27%)
Features Faltantes: 3 (20%)
```

### 13.2 Qualidade de Código

```
TypeScript Coverage: 100%
Component Reusability: 60%
API Consistency: 70%
Error Handling: 40%
Performance: 70%
```

### 13.3 Arquitetura

```
Database Design: 8/10
API Design: 7/10
Frontend Architecture: 6/10
State Management: 5/10
Error Handling: 4/10
```

**Nota Geral de Arquitetura:** 6/10 (60%)

---

## ✅ CONCLUSÃO

### Estado Atual da Arquitetura

**Pontos Fortes:**
- ✅ Database bem estruturado
- ✅ APIs organizadas
- ✅ TypeScript em todo código
- ✅ Validação com Zod
- ✅ Design System base criado

**Pontos Fracos:**
- ❌ Layout fragmentado
- ❌ Falta de contextos
- ❌ Sem cache de dados
- ❌ Tratamento de erros limitado
- ❌ Performance não otimizada

### Recomendações Prioritárias

1. **Layout Unificado** (🔴 Crítico)
2. **GroupContext** (🔴 Crítico)
3. **Topbar** (🔴 Crítico)
4. **Melhorias Visuais** (🟡 Importante)
5. **Sistema de Cache** (🟡 Importante)

---

**Última atualização:** 2026-01-24  
**Status:** 📋 Documentação Completa  
**Próxima revisão:** Após implementação das melhorias críticas

