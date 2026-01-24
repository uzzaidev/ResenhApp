# 🔗 Integração de Features com o Sistema Atual

> **Objetivo:** Documentar como as novas features se conectam ao sistema existente  
> **Data:** 2026-01-27  
> **Status:** 📋 Arquitetura de Integração

---

## 🎯 Visão Geral

Este documento mapeia como cada nova feature se integra com o sistema atual (V1.0) e como as migrations V2.0 expandem o schema sem quebrar funcionalidades existentes.

---

## 📊 Situação Atual vs. Futuro

### Sistema Atual (V1.0) - 17 Tabelas

**Core:**
- `users` - Usuários
- `groups` - Grupos
- `group_members` - Membros
- `events` - Eventos
- `event_attendance` - RSVP
- `teams` - Times
- `team_members` - Jogadores nos times
- `event_actions` - Ações (gols, assists)
- `player_ratings` - Avaliações
- `invites` - Convites
- `venues` - Locais

**Financeiro Básico:**
- `wallets` - Carteiras
- `charges` - Cobranças
- `transactions` - Transações

**Configuração:**
- `draw_configs` - Config de sorteio
- `event_settings` - Config de eventos
- `mv_event_scoreboard` - View materializada

### Sistema Futuro (V2.0) - 40+ Tabelas

**Adiciona:**
- Sistema de notificações (5 tabelas)
- Financeiro avançado (3 tabelas novas)
- Analytics (5 tabelas)
- Gamificação (7 tabelas)
- RLS (políticas de segurança)

---

## 🔄 Estratégia de Integração

### Princípio: Expansão Incremental

**✅ NÃO vamos:**
- Remover tabelas existentes
- Alterar estrutura de tabelas core (exceto adições opcionais)
- Quebrar funcionalidades existentes

**✅ VAMOS:**
- Adicionar novas tabelas
- Adicionar colunas opcionais (nullable)
- Criar relacionamentos com tabelas existentes
- Aplicar migrations incrementalmente por feature

---

## 📋 Mapeamento: Features → Migrations → Tabelas

### 1. Sistema de Notificações

#### Migration: `20260211000001_notifications.sql`

#### Tabelas Novas:
```sql
notifications              -- Notificações do usuário
notification_templates     -- Templates de notificação
push_tokens               -- Tokens para push notifications
email_queue               -- Fila de emails
notification_batches      -- Lotes de notificações
```

#### Conexões com Sistema Atual:

**1. `notifications` → `users`**
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```
- **Uso:** Cada notificação pertence a um usuário
- **Trigger:** Criar notificação quando:
  - Evento criado → notificar membros do grupo
  - RSVP confirmado → notificar admin
  - Pagamento devido → notificar usuário
  - Evento em 2 dias → lembrete automático

**2. `notifications` → `events` (via link)**
```sql
link VARCHAR(500) -- Ex: '/groups/[groupId]/events/[eventId]'
```
- **Uso:** Link para ação relacionada
- **Exemplo:** "Novo evento criado" → link para página do evento

**3. `notifications` → `groups` (via link)**
- **Uso:** Notificações de grupo (novo membro, convite aceito, etc.)

**4. `push_tokens` → `users`**
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```
- **Uso:** Armazenar tokens FCM/Web Push por usuário

#### Fluxo de Integração:

```
EVENTO CRIADO (sistema atual)
    ↓
Trigger/Função: create_event_notifications()
    ↓
INSERT em notifications (nova tabela)
    ↓
Enviar push/email (novo sistema)
    ↓
Usuário recebe notificação
```

#### Arquivos a Modificar:

**Backend:**
```typescript
// src/app/api/events/route.ts (modificar)
export async function POST(req: Request) {
  // ... criar evento (código atual)
  
  // NOVO: Criar notificações
  await createEventNotifications(event.id, groupId);
}

// src/lib/notifications/create.ts (NOVO)
export async function createEventNotifications(eventId: string, groupId: string) {
  // Buscar membros do grupo (tabela existente: group_members)
  const members = await sql`
    SELECT user_id FROM group_members WHERE group_id = ${groupId}
  `;
  
  // Criar notificações (nova tabela: notifications)
  for (const member of members) {
    await sql`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (${member.user_id}, 'event_created', ...)
    `;
  }
}
```

**Frontend:**
```typescript
// src/components/layout/topbar.tsx (modificar)
// Adicionar NotificationBell component

// src/components/notifications/NotificationBell.tsx (NOVO)
// Buscar notificações não lidas da tabela notifications
```

---

### 2. Analytics Dashboard

#### Migration: `20260218000001_analytics.sql`

#### Tabelas Novas:
```sql
player_stats              -- Estatísticas agregadas por jogador
event_stats               -- Estatísticas por evento
group_stats               -- Estatísticas por grupo
leaderboards              -- Rankings calculados
activity_log              -- Log de atividades
```

#### Conexões com Sistema Atual:

**1. `player_stats` → `users` + `groups`**
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
```
- **Uso:** Estatísticas do jogador em um grupo específico
- **Fonte de Dados:** 
  - `event_attendance` (frequência)
  - `event_actions` (gols, assists)
  - `player_ratings` (média de avaliações)

**2. `event_stats` → `events`**
```sql
event_id UUID REFERENCES events(id) ON DELETE CASCADE
```
- **Uso:** Estatísticas agregadas do evento
- **Fonte de Dados:**
  - `event_attendance` (total confirmados)
  - `event_actions` (total gols, assists)
  - `teams` (times sorteados)

**3. `group_stats` → `groups`**
```sql
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
```
- **Uso:** Estatísticas agregadas do grupo
- **Fonte de Dados:**
  - `events` (total eventos)
  - `group_members` (total membros)
  - `event_attendance` (média de participação)

**4. `leaderboards` → `groups`**
```sql
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
```
- **Uso:** Rankings pré-calculados
- **Fonte de Dados:**
  - `player_stats` (agregação)
  - `event_actions` (gols, assists)

**5. `activity_log` → `users` + `groups` + `events`**
```sql
user_id UUID REFERENCES users(id) ON DELETE SET NULL
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
event_id UUID REFERENCES events(id) ON DELETE SET NULL
```
- **Uso:** Log de todas as ações do sistema
- **Fonte:** Triggers em tabelas existentes

#### Fluxo de Integração:

```
AÇÃO NO SISTEMA (ex: gol marcado)
    ↓
INSERT em event_actions (tabela existente)
    ↓
Trigger: update_player_stats()
    ↓
UPDATE player_stats (nova tabela)
    ↓
UPDATE group_stats (nova tabela)
    ↓
REFRESH leaderboards (nova tabela)
    ↓
Dashboard mostra estatísticas atualizadas
```

#### Arquivos a Modificar:

**Backend:**
```typescript
// src/app/api/events/[eventId]/actions/route.ts (modificar)
export async function POST(req: Request) {
  // ... criar ação (código atual)
  
  // NOVO: Atualizar stats
  await updatePlayerStats(eventId, userId, actionType);
  await updateEventStats(eventId);
  await updateGroupStats(groupId);
}

// src/lib/analytics/update-stats.ts (NOVO)
export async function updatePlayerStats(eventId: string, userId: string, actionType: string) {
  // Calcular stats baseado em event_actions (tabela existente)
  // UPDATE player_stats (nova tabela)
}
```

**Frontend:**
```typescript
// src/app/dashboard/analytics/page.tsx (NOVO)
// Buscar dados de group_stats, player_stats, leaderboards
// Exibir gráficos
```

---

### 3. Split Pix Automático

#### Migration: `20260204000001_financial_system.sql`

#### Tabelas Novas:
```sql
group_pix_config          -- Configuração Pix do grupo
pix_payments              -- Pagamentos Pix
charge_splits             -- Divisão de cobranças (pode já existir)
```

#### Conexões com Sistema Atual:

**1. `group_pix_config` → `groups`**
```sql
group_id UUID UNIQUE REFERENCES groups(id) ON DELETE CASCADE
```
- **Uso:** Configuração Pix por grupo
- **Relacionamento:** 1:1 (um grupo tem uma config Pix)

**2. `pix_payments` → `events` + `users`**
```sql
event_id UUID REFERENCES events(id) ON DELETE CASCADE
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```
- **Uso:** QR Code Pix gerado para usuário pagar evento
- **Relacionamento:** Um usuário pode ter um QR Code por evento

**3. `pix_payments` → `charges` (opcional)**
```sql
charge_id UUID REFERENCES charges(id) ON DELETE SET NULL
```
- **Uso:** Linkar pagamento Pix com cobrança existente
- **Relacionamento:** Opcional (pode criar charge ou não)

**4. `charge_splits` → `charges`**
```sql
charge_id UUID REFERENCES charges(id) ON DELETE CASCADE
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```
- **Uso:** Dividir cobrança entre usuários
- **Relacionamento:** Uma charge pode ter múltiplos splits

#### Fluxo de Integração:

```
USUÁRIO CONFIRMA RSVP (sistema atual)
    ↓
event_attendance.status = 'yes' (tabela existente)
    ↓
Verificar se grupo tem Pix configurado (nova tabela: group_pix_config)
    ↓
Calcular valor por jogador (charge.amount / total_players)
    ↓
Gerar QR Code Pix (nova tabela: pix_payments)
    ↓
Criar charge_split (nova tabela ou existente)
    ↓
Enviar notificação com QR Code (sistema de notificações)
    ↓
Usuário paga via Pix
    ↓
Webhook atualiza pix_payments.status = 'paid'
    ↓
Atualizar charge.status = 'paid' (tabela existente)
```

#### Arquivos a Modificar:

**Backend:**
```typescript
// src/app/api/events/[eventId]/rsvp/route.ts (modificar)
export async function POST(req: Request) {
  // ... confirmar RSVP (código atual)
  
  // NOVO: Gerar QR Code Pix se grupo tiver config
  const pixConfig = await getGroupPixConfig(groupId);
  if (pixConfig?.enabled) {
    await generatePixQRCode(eventId, userId, amount);
  }
}

// src/lib/pix/generate-qr.ts (NOVO)
export async function generatePixQRCode(eventId: string, userId: string, amount: number) {
  // Buscar config do grupo (nova tabela: group_pix_config)
  // Gerar payload EMV
  // INSERT em pix_payments (nova tabela)
  // Retornar QR Code
}
```

**Frontend:**
```typescript
// src/components/events/rsvp-button.tsx (modificar)
// Após confirmar RSVP, mostrar QR Code Pix se disponível

// src/components/pix/pix-qr-code.tsx (NOVO)
// Exibir QR Code e status de pagamento
```

---

### 4. Gamificação (Achievements & Badges)

#### Migration: `20260225000001_gamification.sql`

#### Tabelas Novas:
```sql
achievement_types         -- Tipos de conquistas
user_achievements         -- Conquistas desbloqueadas
badges                    -- Badges disponíveis
user_badges               -- Badges do usuário
milestones                -- Marcos alcançados
challenges                -- Desafios
challenge_participants    -- Participantes de desafios
```

#### Conexões com Sistema Atual:

**1. `user_achievements` → `users` + `groups` + `achievement_types`**
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
achievement_type_id BIGINT REFERENCES achievement_types(id)
```
- **Uso:** Conquistas desbloqueadas por usuário em um grupo
- **Fonte de Dados:**
  - `event_actions` (primeiro gol, hat-trick)
  - `event_attendance` (streak de presenças)
  - `player_ratings` (MVP do mês)

**2. `user_badges` → `users` + `badges`**
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
badge_id BIGINT REFERENCES badges(id)
```
- **Uso:** Badges do usuário (independente de grupo)

**3. `challenges` → `groups`**
```sql
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
```
- **Uso:** Desafios do grupo (ex: "Mais gols em janeiro")

**4. `challenge_participants` → `challenges` + `users`**
```sql
challenge_id BIGINT REFERENCES challenges(id) ON DELETE CASCADE
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```
- **Uso:** Participantes de desafios

#### Fluxo de Integração:

```
AÇÃO NO SISTEMA (ex: gol marcado)
    ↓
INSERT em event_actions (tabela existente)
    ↓
Trigger: check_achievements()
    ↓
Verificar se desbloqueou conquista:
  - Primeiro gol? → user_achievements (nova tabela)
  - Hat-trick? → user_achievements (nova tabela)
  - 10 gols no grupo? → user_achievements (nova tabela)
    ↓
Se desbloqueou:
  - INSERT em user_achievements (nova tabela)
  - Criar notificação (sistema de notificações)
  - Atualizar badge se necessário (nova tabela: user_badges)
```

#### Arquivos a Modificar:

**Backend:**
```typescript
// src/app/api/events/[eventId]/actions/route.ts (modificar)
export async function POST(req: Request) {
  // ... criar ação (código atual)
  
  // NOVO: Verificar achievements
  await checkAchievements(userId, groupId, actionType);
}

// src/lib/gamification/check-achievements.ts (NOVO)
export async function checkAchievements(userId: string, groupId: string, actionType: string) {
  // Buscar stats do jogador (player_stats ou calcular)
  // Verificar condições de achievements (achievement_types)
  // Se desbloqueou, INSERT em user_achievements
  // Criar notificação
}
```

**Frontend:**
```typescript
// src/components/profile/user-achievements.tsx (NOVO)
// Buscar user_achievements do usuário
// Exibir badges e conquistas
```

---

### 5. Sistema de Créditos ✅ **IMPLEMENTADO**

#### Migration: `20260227000008_hierarchy_and_credits.sql`

#### Tabelas Novas:
```sql
credit_transactions    -- Histórico de transações (compra, consumo, reembolso)
credit_packages        -- Pacotes de créditos disponíveis
```

#### Colunas Adicionadas em `groups`:
```sql
credits_balance INTEGER DEFAULT 0        -- Saldo atual
credits_purchased INTEGER DEFAULT 0     -- Total comprado (lifetime)
credits_consumed INTEGER DEFAULT 0      -- Total consumido (lifetime)
pix_code TEXT                           -- Código Pix para pagamentos
```

#### Conexões com Sistema Atual:

**1. `credit_transactions` → `groups`**
```sql
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
```
- **Uso:** Cada transação pertence a um grupo
- **Tipos:** 'purchase', 'consumption', 'refund'

**2. `credit_transactions` → `events` (opcional)**
```sql
event_id UUID REFERENCES events(id) ON DELETE SET NULL
```
- **Uso:** Associar consumo de créditos a um evento específico
- **Exemplo:** Consumir créditos ao criar treino recorrente

**3. `credit_transactions` → `profiles`**
```sql
created_by UUID REFERENCES profiles(id)
```
- **Uso:** Rastrear quem realizou a transação

#### Fluxo de Integração:

```
FEATURE PREMIUM USADA (ex: criar treino recorrente)
    ↓
Verificar créditos disponíveis (groups.credits_balance)
    ↓
Se suficiente:
  - consume_credits(group_id, 5, 'recurring_training', user_id, event_id)
  - UPDATE groups.credits_balance -= 5
  - INSERT credit_transactions (tipo: 'consumption')
  - Feature é ativada
Se insuficiente:
  - Retornar erro 402 (Payment Required)
  - Mostrar modal de compra de créditos
```

#### Integração Créditos → Features:

**Features Premium e seus custos:**
- Treino Recorrente: 5 créditos
- QR Code Check-in: 2 créditos
- Convocação: 3 créditos
- Analytics: 10 créditos/mês
- Split Pix: 15 créditos/evento
- Tabelinha Tática: 1 crédito/salvar

#### Arquivos a Modificar:

**Backend:**
```typescript
// src/lib/credits/check-and-consume.ts (NOVO)
export async function checkAndConsumeCredits(
  groupId: string, 
  amount: number, 
  feature: string,
  eventId?: string
) {
  // Verificar saldo
  const balance = await getGroupCredits(groupId);
  if (balance < amount) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  
  // Consumir via função SQL
  await sql`SELECT consume_credits(${groupId}, ${amount}, ${feature}, ${userId}, ${eventId})`;
}

// src/app/api/events/recurring/route.ts (modificar)
export async function POST(req: Request) {
  // Verificar créditos antes de criar
  await checkAndConsumeCredits(groupId, 5, 'recurring_training', eventId);
  
  // Criar treino recorrente
  // ...
}
```

**Frontend:**
```typescript
// src/components/credits/CreditsBalance.tsx (NOVO)
// Exibir saldo atual
// Botão para comprar mais

// src/components/credits/BuyCreditsModal.tsx (NOVO)
// Listar pacotes disponíveis
// Processo de compra
```

---

### 6. Hierarquia de Grupos ✅ **IMPLEMENTADO**

#### Migration: `20260227000008_hierarchy_and_credits.sql`

#### Colunas Adicionadas em `groups`:
```sql
parent_group_id UUID REFERENCES groups(id) ON DELETE CASCADE  -- Grupo pai (atlética)
group_type VARCHAR(20) DEFAULT 'pelada'                        -- 'athletic' ou 'pelada'
```

#### Estrutura Hierárquica:

```
Athletic (group_type = 'athletic', parent_group_id = NULL)
  ├── Pelada Futebol (group_type = 'pelada', parent_group_id = athletic.id)
  ├── Pelada Vôlei (group_type = 'pelada', parent_group_id = athletic.id)
  └── Pelada Basquete (group_type = 'pelada', parent_group_id = athletic.id)
```

#### Conexões com Sistema Atual:

**1. `groups.parent_group_id` → `groups.id` (self-reference)**
- **Uso:** Criar hierarquia de grupos
- **Validação:** Trigger previne referências circulares

**2. Herança de Configurações:**
- Pix Code: Grupos filhos herdam código Pix da atlética
- Créditos: Podem ser compartilhados ou separados
- Permissões: Admin de atlética gerencia grupos filhos

#### Fluxo de Integração:

```
CRIAR GRUPO FILHO
    ↓
Verificar se usuário é admin da atlética (can_manage_group)
    ↓
Criar grupo com parent_group_id = athletic.id
    ↓
Grupo filho herda:
  - Pix code da atlética (get_pix_code_for_group)
  - Configurações padrão
    ↓
Admin de atlética pode gerenciar grupo filho
```

#### Dois Nichos: Atléticas vs Peladas

**Atléticas (group_type = 'athletic'):**
- Múltiplas modalidades esportivas
- Múltiplos grupos filhos (peladas)
- Gestão centralizada
- Pix code compartilhado
- Créditos podem ser compartilhados

**Peladas (group_type = 'pelada'):**
- Uma modalidade (futebol)
- Grupo independente ou filho de atlética
- Gestão própria
- Pix code próprio ou herdado
- Créditos próprios

#### Arquivos a Modificar:

**Backend:**
```typescript
// src/lib/permissions.ts (NOVO)
export async function canManageGroup(userId: string, groupId: string) {
  // Verificar se é admin do grupo
  // OU se é admin da atlética pai
  return await sql`SELECT can_manage_group(${userId}, ${groupId})`;
}

// src/app/api/groups/route.ts (modificar)
export async function POST(req: Request) {
  // Verificar permissões hierárquicas
  if (parentGroupId) {
    await verifyCanManageGroup(userId, parentGroupId);
  }
  
  // Criar grupo
  // ...
}
```

**Frontend:**
```typescript
// src/app/(dashboard)/groups/new/page.tsx (modificar)
// Adicionar seletor de tipo (Atlética vs Pelada)
// Adicionar seletor de grupo pai (se criando filho)
```

---

### 7. Sistema de Modalidades ✅ **IMPLEMENTADO**

#### Migration: `20260227000001_sport_modalities.sql` + `20260227000002_athlete_modalities.sql`

#### Tabelas Novas:
```sql
sport_modalities       -- Modalidades esportivas (Futebol, Vôlei, Basquete, etc.)
athlete_modalities     -- Relacionamento Many-to-Many: Atletas ↔ Modalidades
```

#### Colunas Adicionadas:
```sql
events.modality_id UUID REFERENCES sport_modalities(id)  -- Modalidade do evento
```

#### Conexões com Sistema Atual:

**1. `sport_modalities` → `groups`**
```sql
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
```
- **Uso:** Grupos podem ter múltiplas modalidades
- **Exemplo:** Atlética tem Futebol, Vôlei, Basquete

**2. `athlete_modalities` → `profiles`**
```sql
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
```
- **Uso:** Atletas podem participar de múltiplas modalidades
- **Rating:** Cada atleta tem rating por modalidade (1-10)

**3. `events.modality_id` → `sport_modalities`**
```sql
modality_id UUID REFERENCES sport_modalities(id)
```
- **Uso:** Eventos podem ser de uma modalidade específica
- **Filtros:** Listar eventos por modalidade

#### Fluxo de Integração:

```
CRIAR MODALIDADE NO GRUPO
    ↓
INSERT em sport_modalities (group_id, name)
    ↓
Atletas podem se inscrever na modalidade
    ↓
INSERT em athlete_modalities (user_id, modality_id, rating)
    ↓
Eventos podem ser associados à modalidade
    ↓
events.modality_id = sport_modalities.id
```

#### Arquivos a Modificar:

**Backend:**
```typescript
// src/app/api/groups/[groupId]/modalities/route.ts (NOVO)
// CRUD de modalidades do grupo

// src/app/api/athletes/modalities/route.ts (NOVO)
// Gerenciar modalidades do atleta
```

**Frontend:**
```typescript
// src/components/modalities/ModalitySelector.tsx (NOVO)
// Seletor de modalidade ao criar evento
```

---

### 8. Row Level Security (RLS)

#### Migration: `20260127000004_rls_policies.sql`

#### Não cria tabelas novas, apenas políticas de segurança

#### Conexões com Sistema Atual:

**Protege todas as tabelas existentes:**
- `users` - Usuários só veem seus dados
- `groups` - Membros só veem grupos que participam
- `events` - Membros só veem eventos do grupo
- `event_attendance` - Usuários só veem seus RSVPs
- `wallets` - Usuários só veem suas carteiras
- `charges` - Usuários só veem suas cobranças

#### Fluxo de Integração:

```
QUERY NO SISTEMA (ex: buscar eventos)
    ↓
SELECT * FROM events WHERE group_id = ?
    ↓
RLS Policy aplicada automaticamente
    ↓
Filtra resultados baseado em:
  - auth.uid() (usuário logado)
  - group_members (se é membro do grupo)
  - role (se é admin)
    ↓
Retorna apenas dados permitidos
```

#### Arquivos a Modificar:

**Nenhum código precisa mudar!** RLS funciona automaticamente no Supabase.

**Apenas configurar:**
- Habilitar RLS nas tabelas
- Criar políticas de acesso
- Testar que queries funcionam corretamente

---

## 🔗 Diagrama de Relacionamentos

### Core System (V1.0) - Mantido

```
users
  ├──→ groups (created_by)
  ├──→ group_members
  ├──→ events (created_by)
  ├──→ event_attendance
  └──→ wallets (owner_type='user')

groups
  ├──→ group_members
  ├──→ events
  ├──→ venues
  ├──→ invites
  ├──→ charges
  └──→ wallets (owner_type='group')

events
  ├──→ event_attendance
  ├──→ teams
  └──→ event_actions
```

### Features V2.0 - Adicionadas

```
NOTIFICAÇÕES:
users → notifications
events → notifications (via link)
groups → notifications (via link)
users → push_tokens

ANALYTICS:
users + groups → player_stats
events → event_stats
groups → group_stats
groups → leaderboards
users + groups + events → activity_log

PIX:
groups → group_pix_config (1:1)
events + users → pix_payments
charges → charge_splits
charges → pix_payments (opcional)

GAMIFICAÇÃO:
users + groups → user_achievements
achievement_types → user_achievements
users → user_badges
badges → user_badges
groups → challenges
challenges + users → challenge_participants
```

---

## 📅 Estratégia de Implementação Incremental

### Fase 1: Notificações (Sprint 2)

**Migrations a Aplicar:**
1. `20260211000001_notifications.sql`

**Tabelas Afetadas:**
- ✅ Nenhuma tabela existente alterada
- ✅ Apenas novas tabelas criadas

**Integração:**
- Modificar: `POST /api/events` (criar notificação)
- Modificar: `POST /api/events/[eventId]/rsvp` (criar notificação)
- Novo: `GET /api/notifications`
- Novo: Componente `NotificationBell`

**Teste:**
- Criar evento → verificar notificação criada
- Confirmar RSVP → verificar notificação criada

---

### Fase 2: Analytics (Sprint 3)

**Migrations a Aplicar:**
1. `20260218000001_analytics.sql`

**Tabelas Afetadas:**
- ✅ Nenhuma tabela existente alterada
- ✅ Apenas novas tabelas criadas
- ✅ Triggers criados para atualizar stats automaticamente

**Integração:**
- Modificar: `POST /api/events/[eventId]/actions` (atualizar stats)
- Novo: `GET /api/groups/[groupId]/analytics`
- Novo: Página de analytics

**Teste:**
- Marcar gol → verificar `player_stats` atualizado
- Verificar dashboard de analytics

---

### Fase 3: Split Pix (Sprint 4)

**Migrations a Aplicar:**
1. `20260204000001_financial_system.sql`

**Tabelas Afetadas:**
- ✅ Nenhuma tabela existente alterada
- ✅ Novas tabelas: `group_pix_config`, `pix_payments`
- ⚠️ `charge_splits` pode já existir (verificar)

**Integração:**
- Modificar: `POST /api/events/[eventId]/rsvp` (gerar QR Code)
- Novo: `GET /api/groups/[groupId]/pix/config`
- Novo: `POST /api/events/[eventId]/pix/generate`
- Novo: Componente `PixQRCode`

**Teste:**
- Configurar Pix do grupo
- Confirmar RSVP → verificar QR Code gerado
- Testar webhook de pagamento

---

### Fase 4: Gamificação (Sprint 5)

**Migrations a Aplicar:**
1. `20260225000001_gamification.sql`

**Tabelas Afetadas:**
- ✅ Nenhuma tabela existente alterada
- ✅ Apenas novas tabelas criadas

**Integração:**
- Modificar: `POST /api/events/[eventId]/actions` (verificar achievements)
- Novo: `GET /api/achievements/[userId]/[groupId]`
- Novo: Página de achievements

**Teste:**
- Marcar primeiro gol → verificar achievement desbloqueado
- Verificar notificação de achievement

---

### Fase 5: RLS (Quando necessário)

**Migrations a Aplicar:**
1. `20260127000004_rls_policies.sql`

**Tabelas Afetadas:**
- ✅ Todas as tabelas (apenas políticas, sem alterar estrutura)

**Integração:**
- ⚠️ Nenhum código precisa mudar
- ⚠️ Apenas testar que queries funcionam

**Teste:**
- Testar acesso de usuários diferentes
- Verificar que usuários só veem seus dados

---

## ⚠️ Pontos de Atenção

### 1. Compatibilidade com Código Existente

**✅ Seguro:**
- Adicionar novas tabelas não quebra código existente
- Adicionar colunas nullable não quebra código existente
- Criar relacionamentos com tabelas existentes é seguro

**⚠️ Cuidado:**
- Modificar colunas existentes (fazer migration de alteração)
- Adicionar colunas NOT NULL (precisa default ou migration em 2 passos)
- Remover colunas (nunca fazer sem deprecar primeiro)

### 2. Dependências entre Features

**Ordem Recomendada:**
1. **Notificações primeiro** - Usado por outras features
2. **Analytics** - Independente
3. **Split Pix** - Independente
4. **Gamificação** - Usa notificações
5. **RLS** - Pode ser aplicado a qualquer momento

### 3. Performance

**Otimizações:**
- `player_stats`, `group_stats` são cache (atualizados por triggers)
- `leaderboards` é materialized view (refresh periódico)
- `activity_log` pode ser arquivado periodicamente

### 4. Migrations Incrementais

**Estratégia:**
- Aplicar uma migration por vez
- Testar após cada migration
- Fazer backup antes de aplicar
- Ter rollback plan

---

## 📋 Checklist de Integração por Feature

### Notificações
- [ ] Aplicar migration `20260211000001_notifications.sql`
- [ ] Criar função `create_event_notifications()`
- [ ] Modificar `POST /api/events` para criar notificações
- [ ] Modificar `POST /api/events/[eventId]/rsvp` para criar notificações
- [ ] Criar `GET /api/notifications`
- [ ] Criar componente `NotificationBell`
- [ ] Integrar no `Topbar`
- [ ] Testar fluxo completo

### Analytics
- [ ] Aplicar migration `20260218000001_analytics.sql`
- [ ] Criar triggers para atualizar stats
- [ ] Modificar `POST /api/events/[eventId]/actions` para atualizar stats
- [ ] Criar `GET /api/groups/[groupId]/analytics`
- [ ] Criar página de analytics
- [ ] Criar componentes de gráficos
- [ ] Testar cálculo de stats

### Split Pix
- [ ] Aplicar migration `20260204000001_financial_system.sql`
- [ ] Criar `GET /api/groups/[groupId]/pix/config`
- [ ] Criar `POST /api/groups/[groupId]/pix/config`
- [ ] Criar `POST /api/events/[eventId]/pix/generate`
- [ ] Modificar `POST /api/events/[eventId]/rsvp` para gerar QR Code
- [ ] Criar componente `PixQRCode`
- [ ] Criar webhook de pagamento
- [ ] Testar geração e pagamento

### Gamificação
- [ ] Aplicar migration `20260225000001_gamification.sql`
- [ ] Criar função `check_achievements()`
- [ ] Modificar `POST /api/events/[eventId]/actions` para verificar achievements
- [ ] Criar `GET /api/achievements/[userId]/[groupId]`
- [ ] Criar página de achievements
- [ ] Criar componente `AchievementBadge`
- [ ] Testar desbloqueio de achievements

---

## 🎯 Resumo: Tudo Conectado

### Fluxo Completo de Exemplo

```
1. ADMIN CRIA EVENTO
   ├── INSERT em events (tabela existente)
   ├── Trigger: create_event_notifications()
   │   └── INSERT em notifications (nova tabela)
   │   └── Enviar push/email (novo sistema)
   └── Usuários recebem notificação

2. USUÁRIO CONFIRMA RSVP
   ├── UPDATE event_attendance.status = 'yes' (tabela existente)
   ├── Verificar se grupo tem Pix configurado (nova tabela)
   ├── Se sim: Gerar QR Code Pix (nova tabela: pix_payments)
   ├── Criar notificação de confirmação (nova tabela)
   └── Atualizar stats de participação (nova tabela: player_stats)

3. DURANTE O JOGO - GOL MARCADO
   ├── INSERT em event_actions (tabela existente)
   ├── Trigger: update_player_stats()
   │   └── UPDATE player_stats (nova tabela)
   │   └── UPDATE group_stats (nova tabela)
   ├── Trigger: check_achievements()
   │   └── Verificar se desbloqueou conquista
   │   └── INSERT em user_achievements (nova tabela)
   │   └── Criar notificação de achievement (nova tabela)
   └── Dashboard atualiza em tempo real

4. APÓS O JOGO - PAGAMENTO
   ├── Usuário paga via Pix
   ├── Webhook atualiza pix_payments.status = 'paid' (nova tabela)
   ├── UPDATE charges.status = 'paid' (tabela existente)
   ├── Criar notificação de pagamento confirmado (nova tabela)
   └── Atualizar stats financeiros (nova tabela: group_stats)
```

---

## ✅ Conclusão

### Tabelas V1.0: Mantidas Intactas
- ✅ Nenhuma tabela será removida
- ✅ Nenhuma coluna obrigatória será alterada
- ✅ Funcionalidades existentes continuam funcionando

### Tabelas V2.0: Adicionadas Incrementalmente
- ✅ Novas tabelas se conectam via Foreign Keys
- ✅ Triggers atualizam stats automaticamente
- ✅ Features funcionam de forma integrada

### Integração: Incremental e Segura
- ✅ Uma feature por vez
- ✅ Testar após cada migration
- ✅ Rollback possível se necessário

---

**Última atualização:** 2026-01-27  
**Status:** ✅ Arquitetura de Integração Completa

