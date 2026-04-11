# 🗺️ Mapeamento Completo: Features → Migrations → Tabelas → Código

> **Objetivo:** Mapeamento visual de como cada feature se integra ao sistema  
> **Data:** 2026-01-27  
> **Status:** 📋 Mapeamento Completo

---

## 📊 Visão Geral do Mapeamento

```
FEATURE → MIGRATION → TABELAS → CÓDIGO → UI
```

---

## 1. 🔔 Sistema de Notificações

### Migration
- **Arquivo:** `20260211000001_notifications.sql`
- **Aplicar quando:** Sprint 2 (2-3 semanas)

### Tabelas Criadas
```
notifications              (5 colunas principais)
  ├── user_id → users.id
  ├── related_type (event, group, charge)
  └── related_id

notification_templates     (templates reutilizáveis)
push_tokens                (FCM/Web Push)
  └── user_id → users.id

email_queue                (fila de emails)
notification_batches        (lotes de envio)
```

### Conexões com Sistema Atual

| Tabela Existente | Nova Tabela | Tipo de Conexão | Uso |
|------------------|-------------|-----------------|-----|
| `users` | `notifications` | FK (user_id) | Notificações por usuário |
| `users` | `push_tokens` | FK (user_id) | Tokens de push |
| `events` | `notifications` | Via `related_id` | Notificações de eventos |
| `groups` | `notifications` | Via `related_id` | Notificações de grupos |
| `charges` | `notifications` | Via `related_id` | Notificações de pagamento |

### Código a Modificar/Criar

**Backend:**
```typescript
// MODIFICAR: src/app/api/events/route.ts
POST /api/events
  → Criar evento (código atual)
  → NOVO: createEventNotifications(eventId, groupId)

// MODIFICAR: src/app/api/events/[eventId]/rsvp/route.ts
POST /api/events/[eventId]/rsvp
  → Confirmar RSVP (código atual)
  → NOVO: createRSVPNotification(eventId, userId)

// NOVO: src/app/api/notifications/route.ts
GET /api/notifications
  → Listar notificações do usuário
  → Query: ?read=true|false&limit=20

POST /api/notifications
  → Marcar como lida
  → Body: { notificationIds: number[] }

// NOVO: src/app/api/notifications/unread-count/route.ts
GET /api/notifications/unread-count
  → Retornar contador de não lidas

// NOVO: src/lib/notifications/create.ts
createEventNotifications(eventId, groupId)
  → Buscar membros do grupo (group_members)
  → Criar notificações (notifications)
  → Enviar push/email
```

**Frontend:**
```typescript
// MODIFICAR: src/components/layout/topbar.tsx
  → Adicionar NotificationBell component

// NOVO: src/components/notifications/NotificationBell.tsx
  → Buscar unread-count
  → Exibir badge
  → Dropdown com notificações

// NOVO: src/components/notifications/NotificationList.tsx
  → Lista de notificações
  → Marcar como lida ao clicar

// NOVO: src/app/(dashboard)/notifications/page.tsx
  → Página completa de notificações
```

### Fluxo Completo

```
1. ADMIN CRIA EVENTO
   └── POST /api/events
       ├── INSERT events (tabela existente)
       └── createEventNotifications()
           ├── SELECT group_members WHERE group_id = ?
           ├── INSERT notifications (nova tabela) para cada membro
           ├── SELECT push_tokens WHERE user_id IN (...)
           └── Enviar push notifications

2. USUÁRIO ABRE APP
   └── GET /api/notifications/unread-count
       └── SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = false
       └── Exibir badge no topbar

3. USUÁRIO CLICA NO BELL
   └── GET /api/notifications?read=false&limit=20
       └── SELECT * FROM notifications WHERE user_id = ? AND is_read = false
       └── Exibir dropdown

4. USUÁRIO CLICA EM NOTIFICAÇÃO
   └── POST /api/notifications { notificationIds: [123] }
       └── UPDATE notifications SET is_read = true WHERE id = 123
       └── Navegar para action_url
```

---

## 2. 📊 Analytics Dashboard

### Migration
- **Arquivo:** `20260218000001_analytics.sql`
- **Aplicar quando:** Sprint 3 (2-3 semanas)

### Tabelas Criadas
```
player_stats              (stats por jogador/grupo)
  ├── user_id → users.id
  └── group_id → groups.id

event_stats               (stats por evento)
  └── event_id → events.id

group_stats               (stats por grupo)
  └── group_id → groups.id

leaderboards              (rankings pré-calculados)
  └── group_id → groups.id

activity_log              (log de atividades)
  ├── user_id → users.id
  ├── group_id → groups.id
  └── event_id → events.id
```

### Conexões com Sistema Atual

| Tabela Existente | Nova Tabela | Tipo de Conexão | Fonte de Dados |
|------------------|-------------|-----------------|----------------|
| `users` + `groups` | `player_stats` | FK (user_id, group_id) | `event_attendance`, `event_actions`, `player_ratings` |
| `events` | `event_stats` | FK (event_id) | `event_attendance`, `event_actions`, `teams` |
| `groups` | `group_stats` | FK (group_id) | `events`, `group_members`, `event_attendance` |
| `groups` | `leaderboards` | FK (group_id) | `player_stats` (agregação) |
| `users`, `groups`, `events` | `activity_log` | FK (user_id, group_id, event_id) | Triggers em todas as tabelas |

### Código a Modificar/Criar

**Backend:**
```typescript
// MODIFICAR: src/app/api/events/[eventId]/actions/route.ts
POST /api/events/[eventId]/actions
  → Criar ação (código atual)
  → NOVO: updatePlayerStats(eventId, userId, actionType)
  → NOVO: updateEventStats(eventId)
  → NOVO: updateGroupStats(groupId)

// NOVO: src/app/api/groups/[groupId]/analytics/route.ts
GET /api/groups/[groupId]/analytics
  → SELECT * FROM group_stats WHERE group_id = ?
  → SELECT * FROM player_stats WHERE group_id = ?
  → SELECT * FROM leaderboards WHERE group_id = ?

// NOVO: src/app/api/groups/[groupId]/trends/route.ts
GET /api/groups/[groupId]/trends?metric=attendance&period=month
  → SELECT * FROM activity_log WHERE group_id = ? AND metric = ?
  → Agrupar por período
  → Retornar série temporal

// NOVO: src/lib/analytics/update-stats.ts
updatePlayerStats(eventId, userId, actionType)
  → Calcular stats baseado em event_actions (tabela existente)
  → INSERT ou UPDATE player_stats (nova tabela)

updateEventStats(eventId)
  → Agregar dados de event_attendance, event_actions (tabelas existentes)
  → INSERT ou UPDATE event_stats (nova tabela)

updateGroupStats(groupId)
  → Agregar dados de events, group_members, event_attendance (tabelas existentes)
  → INSERT ou UPDATE group_stats (nova tabela)
```

**Frontend:**
```typescript
// NOVO: src/app/(dashboard)/groups/[groupId]/analytics/page.tsx
  → GET /api/groups/[groupId]/analytics
  → Exibir dashboard completo

// NOVO: src/components/analytics/StatsCards.tsx
  → Cards com métricas principais
  → Trend indicators (↑↓)

// NOVO: src/components/analytics/ActivityChart.tsx
  → Gráfico de atividade semanal/mensal
  → Dados de activity_log

// NOVO: src/components/analytics/PlayerStats.tsx
  → Tabela de estatísticas de jogadores
  → Dados de player_stats
```

### Triggers SQL (Automáticos)

```sql
-- Trigger: Atualizar player_stats quando ação é criada
CREATE TRIGGER update_player_stats_on_action
AFTER INSERT ON event_actions
FOR EACH ROW
EXECUTE FUNCTION update_player_stats();

-- Trigger: Atualizar event_stats quando attendance muda
CREATE TRIGGER update_event_stats_on_attendance
AFTER INSERT OR UPDATE ON event_attendance
FOR EACH ROW
EXECUTE FUNCTION update_event_stats();

-- Trigger: Log de atividades
CREATE TRIGGER log_activity_on_event_action
AFTER INSERT ON event_actions
FOR EACH ROW
EXECUTE FUNCTION log_activity();
```

---

## 3. 💰 Split Pix Automático

### Migration
- **Arquivo:** `20260204000001_financial_system.sql`
- **Aplicar quando:** Sprint 4 (3-4 semanas)

### Tabelas Criadas
```
group_pix_config          (config Pix por grupo)
  └── group_id → groups.id (UNIQUE, 1:1)

pix_payments              (QR Codes gerados)
  ├── event_id → events.id
  └── user_id → users.id

charge_splits             (divisão de cobranças)
  ├── charge_id → charges.id
  └── user_id → users.id
```

### Conexões com Sistema Atual

| Tabela Existente | Nova Tabela | Tipo de Conexão | Uso |
|------------------|-------------|-----------------|-----|
| `groups` | `group_pix_config` | FK 1:1 (group_id UNIQUE) | Configuração Pix do grupo |
| `events` + `users` | `pix_payments` | FK (event_id, user_id) | QR Code por usuário/evento |
| `charges` | `charge_splits` | FK (charge_id) | Divisão de cobrança |
| `charges` | `pix_payments` | FK opcional (charge_id) | Linkar pagamento com cobrança |
| `events` | `charges` | FK (event_id) | Cobrança do evento (já existe) |

### Código a Modificar/Criar

**Backend:**
```typescript
// MODIFICAR: src/app/api/events/[eventId]/rsvp/route.ts
POST /api/events/[eventId]/rsvp
  → Confirmar RSVP (código atual)
  → NOVO: Verificar se grupo tem Pix configurado
  → NOVO: Se sim, gerar QR Code Pix
  → NOVO: Criar charge_split se necessário

// NOVO: src/app/api/groups/[groupId]/pix/config/route.ts
GET /api/groups/[groupId]/pix/config
  → SELECT * FROM group_pix_config WHERE group_id = ?

PATCH /api/groups/[groupId]/pix/config
  → INSERT ou UPDATE group_pix_config
  → Validar chave Pix

// NOVO: src/app/api/events/[eventId]/pix/generate/route.ts
POST /api/events/[eventId]/pix/generate
  → Body: { userId, amount }
  → Buscar config do grupo (group_pix_config)
  → Gerar payload EMV
  → INSERT pix_payments
  → Retornar QR Code

// NOVO: src/app/api/pix/webhook/route.ts
POST /api/pix/webhook
  → Receber confirmação de pagamento
  → UPDATE pix_payments SET status = 'paid'
  → UPDATE charges SET status = 'paid' (se linkado)
  → Criar notificação de pagamento confirmado

// NOVO: src/lib/pix/generate-qr.ts
generatePixQRCode(eventId, userId, amount)
  → Buscar group_pix_config
  → Gerar payload EMV (biblioteca externa)
  → INSERT pix_payments
  → Retornar QR Code image
```

**Frontend:**
```typescript
// MODIFICAR: src/components/events/rsvp-button.tsx
  → Após confirmar RSVP, verificar se tem Pix
  → Se sim, mostrar modal com QR Code

// NOVO: src/components/pix/pix-qr-code.tsx
  → Exibir QR Code
  → Status de pagamento
  → Botão "Copiar código Pix"

// NOVO: src/components/pix/pix-config-form.tsx
  → Formulário de configuração Pix
  → Validação de chave Pix
  → Salvar em group_pix_config

// NOVO: src/app/(dashboard)/groups/[groupId]/financial/pix/page.tsx
  → Página de configuração Pix
  → Lista de QR Codes gerados
  → Status de pagamentos
```

### Fluxo Completo

```
1. ADMIN CONFIGURA PIX DO GRUPO
   └── PATCH /api/groups/[groupId]/pix/config
       └── INSERT ou UPDATE group_pix_config
           └── Validar chave Pix

2. USUÁRIO CONFIRMA RSVP
   └── POST /api/events/[eventId]/rsvp
       ├── UPDATE event_attendance.status = 'yes' (tabela existente)
       ├── SELECT group_pix_config WHERE group_id = ? (nova tabela)
       ├── Se enabled:
       │   ├── Calcular amount (charge.amount / total_players)
       │   ├── generatePixQRCode(eventId, userId, amount)
       │   │   └── INSERT pix_payments (nova tabela)
       │   ├── Criar charge_split se necessário (nova tabela)
       │   └── Criar notificação com QR Code (sistema de notificações)
       └── Retornar QR Code para exibir

3. USUÁRIO PAGA VIA PIX
   └── Webhook recebe confirmação
       └── POST /api/pix/webhook
           ├── UPDATE pix_payments SET status = 'paid' (nova tabela)
           ├── UPDATE charges SET status = 'paid' (tabela existente)
           ├── UPDATE wallets SET balance = balance + amount (tabela existente)
           └── Criar notificação de pagamento confirmado (sistema de notificações)
```

---

## 4. 🏆 Gamificação (Achievements & Badges)

### Migration
- **Arquivo:** `20260225000001_gamification.sql`
- **Aplicar quando:** Sprint 5 (2-3 semanas)

### Tabelas Criadas
```
achievement_types         (tipos de conquistas)
user_achievements         (conquistas desbloqueadas)
  ├── user_id → users.id
  ├── group_id → groups.id
  └── achievement_type_id → achievement_types.id

badges                    (badges disponíveis)
user_badges               (badges do usuário)
  ├── user_id → users.id
  └── badge_id → badges.id

milestones                (marcos alcançados)
challenges                (desafios)
  └── group_id → groups.id

challenge_participants    (participantes)
  ├── challenge_id → challenges.id
  └── user_id → users.id
```

### Conexões com Sistema Atual

| Tabela Existente | Nova Tabela | Tipo de Conexão | Fonte de Dados |
|------------------|-------------|-----------------|----------------|
| `users` + `groups` | `user_achievements` | FK (user_id, group_id) | `event_actions`, `event_attendance`, `player_ratings` |
| `users` | `user_badges` | FK (user_id) | Agregação de `user_achievements` |
| `groups` | `challenges` | FK (group_id) | Criados por admins |
| `users` + `challenges` | `challenge_participants` | FK (user_id, challenge_id) | Participação em desafios |
| `event_actions` | `user_achievements` | Via trigger | Verificar condições |

### Código a Modificar/Criar

**Backend:**
```typescript
// MODIFICAR: src/app/api/events/[eventId]/actions/route.ts
POST /api/events/[eventId]/actions
  → Criar ação (código atual)
  → NOVO: checkAchievements(userId, groupId, actionType)

// NOVO: src/app/api/achievements/[userId]/[groupId]/route.ts
GET /api/achievements/[userId]/[groupId]
  → SELECT * FROM user_achievements WHERE user_id = ? AND group_id = ?
  → JOIN achievement_types
  → Retornar conquistas do usuário no grupo

// NOVO: src/lib/gamification/check-achievements.ts
checkAchievements(userId, groupId, actionType)
  → Buscar stats do jogador (player_stats ou calcular)
  → SELECT * FROM achievement_types
  → Para cada achievement:
  │   ├── Verificar condições (ex: total_goals >= 10)
  │   ├── Se desbloqueou:
  │   │   ├── INSERT user_achievements (nova tabela)
  │   │   ├── Verificar se ganhou badge
  │   │   │   └── INSERT user_badges se necessário (nova tabela)
  │   │   └── Criar notificação de achievement (sistema de notificações)
  └── Retornar achievements desbloqueados
```

**Frontend:**
```typescript
// NOVO: src/components/gamification/achievement-badge.tsx
  → Badge visual de conquista
  → Tooltip com descrição

// NOVO: src/components/gamification/achievement-list.tsx
  → Lista de conquistas
  → Progresso de cada uma

// NOVO: src/app/(dashboard)/profile/achievements/page.tsx
  → Página de conquistas do usuário
  → Agrupadas por grupo
  → Badges visuais

// MODIFICAR: src/components/profile/user-profile.tsx
  → Adicionar seção de achievements
  → Exibir badges principais
```

### Triggers SQL (Automáticos)

```sql
-- Trigger: Verificar achievements quando ação é criada
CREATE TRIGGER check_achievements_on_action
AFTER INSERT ON event_actions
FOR EACH ROW
EXECUTE FUNCTION check_and_unlock_achievements();

-- Função: Verificar e desbloquear achievements
CREATE FUNCTION check_and_unlock_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar primeiro gol
  IF NEW.action_type = 'goal' THEN
    -- Verificar se é primeiro gol do usuário no grupo
    IF NOT EXISTS (
      SELECT 1 FROM event_actions 
      WHERE user_id = NEW.user_id 
      AND group_id = (SELECT group_id FROM events WHERE id = NEW.event_id)
      AND action_type = 'goal'
      AND id != NEW.id
    ) THEN
      -- Desbloquear achievement "first_goal"
      INSERT INTO user_achievements (user_id, group_id, achievement_type_id)
      SELECT NEW.user_id, 
             (SELECT group_id FROM events WHERE id = NEW.event_id),
             (SELECT id FROM achievement_types WHERE code = 'first_goal')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. 🔐 Row Level Security (RLS)

### Migration
- **Arquivo:** `20260127000004_rls_policies.sql`
- **Aplicar quando:** Quando necessário (pode ser a qualquer momento)

### Não cria tabelas novas, apenas políticas

### Políticas Criadas

```sql
-- Política: Usuários só veem seus dados
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Política: Membros só veem grupos que participam
CREATE POLICY "Members can view their groups"
ON groups FOR SELECT
USING (
  id IN (
    SELECT group_id FROM group_members 
    WHERE user_id = auth.uid()
  )
);

-- Política: Usuários só veem eventos de grupos que participam
CREATE POLICY "Users can view group events"
ON events FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM group_members 
    WHERE user_id = auth.uid()
  )
);

-- Política: Usuários só veem seus RSVPs
CREATE POLICY "Users can view own RSVPs"
ON event_attendance FOR SELECT
USING (user_id = auth.uid());

-- Política: Admins podem ver todos os RSVPs do grupo
CREATE POLICY "Admins can view group RSVPs"
ON event_attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = (SELECT group_id FROM events WHERE id = event_attendance.event_id)
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);
```

### Código a Modificar

**Nenhum!** RLS funciona automaticamente no Supabase.

**Apenas testar:**
- Queries continuam funcionando
- Usuários só veem seus dados
- Admins veem dados do grupo

---

## 📊 Diagrama de Dependências

```
┌─────────────────────────────────────────────────────────┐
│                    SISTEMA V1.0 (ATUAL)                 │
│  users, groups, events, event_attendance, etc.          │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Foreign Keys
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ NOTIFICAÇÕES │  │   ANALYTICS  │  │  SPLIT PIX   │
│              │  │              │  │              │
│ notifications│  │ player_stats  │  │group_pix_conf│
│ push_tokens  │  │ event_stats   │  │pix_payments  │
│ email_queue  │  │ group_stats   │  │charge_splits │
│              │  │ leaderboards  │  │              │
│              │  │ activity_log  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                 ┌──────────────┐
                 │ GAMIFICAÇÃO  │
                 │              │
                 │achievement_ty│
                 │user_achievem │
                 │badges        │
                 │challenges    │
                 └──────────────┘
                          │
                          ▼
                 ┌──────────────┐
                 │     RLS      │
                 │              │
                 │  Políticas   │
                 │  de Segurança│
                 └──────────────┘
```

---

## 🎯 Estratégia de Implementação

### Ordem Recomendada

1. **Notificações** (Sprint 2)
   - ✅ Base para outras features
   - ✅ Usado por todas as outras

2. **Analytics** (Sprint 3)
   - ✅ Independente
   - ✅ Pode rodar em paralelo com Pix

3. **Split Pix** (Sprint 4)
   - ✅ Independente
   - ✅ Usa notificações (já implementado)

4. **Gamificação** (Sprint 5)
   - ✅ Usa notificações (já implementado)
   - ✅ Usa analytics (já implementado)

5. **RLS** (Quando necessário)
   - ✅ Pode ser aplicado a qualquer momento
   - ✅ Não quebra código existente

### Dependências

```
Notificações → Usado por: Pix, Gamificação
Analytics → Usado por: Gamificação (para verificar achievements)
Pix → Usa: Notificações
Gamificação → Usa: Notificações, Analytics
RLS → Independente (pode aplicar a qualquer momento)
```

---

## ✅ Checklist de Integração Completo

### Antes de Começar
- [ ] Backup do database
- [ ] Ambiente de desenvolvimento configurado
- [ ] Testes do sistema atual passando

### Para Cada Feature

#### Notificações
- [ ] Aplicar migration `20260211000001_notifications.sql`
- [ ] Criar funções de criação de notificações
- [ ] Modificar endpoints existentes
- [ ] Criar novos endpoints
- [ ] Criar componentes UI
- [ ] Testar fluxo completo

#### Analytics
- [ ] Aplicar migration `20260218000001_analytics.sql`
- [ ] Criar triggers de atualização
- [ ] Modificar endpoints de ações
- [ ] Criar endpoints de analytics
- [ ] Criar componentes de gráficos
- [ ] Testar cálculo de stats

#### Split Pix
- [ ] Aplicar migration `20260204000001_financial_system.sql`
- [ ] Configurar gateway Pix
- [ ] Criar endpoints de Pix
- [ ] Modificar endpoint de RSVP
- [ ] Criar componentes de Pix
- [ ] Configurar webhook
- [ ] Testar geração e pagamento

#### Gamificação
- [ ] Aplicar migration `20260225000001_gamification.sql`
- [ ] Criar triggers de achievements
- [ ] Modificar endpoints de ações
- [ ] Criar endpoints de achievements
- [ ] Criar componentes de gamificação
- [ ] Testar desbloqueio

#### RLS
- [ ] Aplicar migration `20260127000004_rls_policies.sql`
- [ ] Testar todas as queries
- [ ] Validar acesso de usuários
- [ ] Validar acesso de admins

---

## 🎯 Resumo Executivo

### ✅ Tabelas V1.0: Mantidas Intactas
- Nenhuma tabela será removida
- Nenhuma coluna obrigatória será alterada
- Funcionalidades existentes continuam funcionando

### ✅ Tabelas V2.0: Adicionadas Incrementalmente
- Novas tabelas se conectam via Foreign Keys
- Triggers atualizam stats automaticamente
- Features funcionam de forma integrada

### ✅ Integração: Incremental e Segura
- Uma feature por vez
- Testar após cada migration
- Rollback possível se necessário

### ✅ Arquitetura: Completa e Documentada
- Mapeamento claro de cada feature
- Dependências identificadas
- Fluxos documentados
- Código a modificar/criar especificado

---

**Última atualização:** 2026-01-27  
**Status:** ✅ Mapeamento Completo - Pronto para Implementação






