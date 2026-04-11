# 📚 Guia de Nomenclatura - Referência Rápida
## ResenhApp - Padronização de Termos

> **Data:** 2026-02-23
> **Propósito:** Guia rápido para desenvolvedores manterem consistência entre código e UI

---

## 🎯 Regra de Ouro

**"Código em inglês, UI em português, conceito claro"**

```
Database (SQL) → TypeScript (código) → UI (usuário)
   groups      →     Group          →   Grupo
```

---

## 📊 Mapa Completo de Nomenclatura

### Entidades Principais

| 🗄️ Database | 💻 TypeScript | 🎨 UI (pt-BR) | 📝 Descrição |
|------------|--------------|--------------|-------------|
| `users` | `User` | **Usuário** | Conta de acesso |
| `profiles` | `Profile` | **Perfil** | Dados públicos do usuário |
| `groups` | `Group` | **Grupo** | Unidade de organização |
| `group_members` | `GroupMember` | **Membro** ou **Atleta** | Participante de grupo |
| `sport_modalities` | `SportModality` | **Modalidade** | Esporte praticado |
| `events` | `Event` | **Evento** | Ocorrência agendada |
| `event_attendance` | `EventAttendance` | **Confirmação** ou **RSVP** | Presença em evento |
| `teams` | `Team` | **Time** | Equipe sorteada |
| `team_members` | `TeamMember` | **Jogador do Time** | Membro alocado |
| `event_actions` | `EventAction` | **Ação** ou **Lance** | Gol, assistência, etc. |
| `votes` | `Vote` | **Voto** ou **Avaliação** | Votação de MVP |
| `charges` | `Charge` | **Cobrança** | Pagamento pendente |
| `wallets` | `Wallet` | **Carteira** | Saldo financeiro |
| `notifications` | `Notification` | **Notificação** | Alerta para usuário |
| `invites` | `Invite` | **Convite** | Link de entrada |
| `venues` | `Venue` | **Local** ou **Quadra** | Lugar de jogo |

---

## 🏗️ Hierarquia Organizacional

```
┌─────────────────────────────────────────────────────────────┐
│ PLATAFORMA: ResenhApp                                       │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌────────────────┐              ┌────────────────┐
│ ORGANIZAÇÃO    │              │ GRUPO          │
│ (Athletic)     │              │ INDEPENDENTE   │
│                │              │ (Pelada)       │
│ • Nome         │              │ • Nome         │
│ • Admins       │              │ • Admin        │
│ • Créditos     │              │ • Créditos     │
└────────────────┘              └────────────────┘
        │
        ├─ Grupo A (Futsal)
        ├─ Grupo B (Vôlei)
        └─ Grupo C (Basquete)
                │
                ├─ Evento 1 (Treino)
                ├─ Evento 2 (Jogo)
                └─ Evento 3 (Amistoso)
```

**Termos no código:**

```typescript
// Organização
groups.group_type = 'athletic'
groups.parent_group_id = NULL

// Grupo dentro de organização
groups.group_type = 'pelada'
groups.parent_group_id = athletic.id

// Grupo independente
groups.group_type = 'pelada'
groups.parent_group_id = NULL
```

**Termos na UI:**

- "Criar Organização" → cria grupo com `group_type = 'athletic'`
- "Criar Grupo" → cria grupo com `group_type = 'pelada'`
- "Atlética Paulistana" → grupo com `group_type = 'athletic'`
- "Pelada do João" → grupo com `group_type = 'pelada'` e `parent_group_id = NULL`

---

## ⚽ Tipos de Evento

### No Banco de Dados

```sql
events.event_type IN ('training', 'official_game', 'friendly')
```

### No TypeScript

```typescript
enum EventType {
  Training = 'training',
  OfficialGame = 'official_game',
  Friendly = 'friendly'
}
```

### Na UI (pt-BR)

| Código | UI | Ícone | Descrição |
|--------|-----|-------|-----------|
| `training` | **Treino** | 🏃 | Prática/treinamento |
| `official_game` | **Jogo Oficial** | 🏆 | Partida competitiva com placar oficial |
| `friendly` | **Amistoso** | 🤝 | Jogo casual / Pelada |

**"Pelada" não é tipo de evento, é sinônimo coloquial de "Amistoso" ou "Treino casual"**

---

## 👥 Papéis e Permissões

### No Grupo (group_members.role)

| Database | TypeScript | UI | Permissões |
|----------|-----------|-----|-----------|
| `owner` | `GroupRole.Owner` | **Proprietário** | Tudo + deletar grupo |
| `admin` | `GroupRole.Admin` | **Administrador** | Gerenciar tudo exceto deletar |
| `moderator` | `GroupRole.Moderator` | **Moderador** | Gerenciar eventos e membros |
| `member` | `GroupRole.Member` | **Membro** | Participar de eventos |

### Na Plataforma (profiles.platform_role)

| Database | TypeScript | UI | Acesso |
|----------|-----------|-----|--------|
| `super_admin` | `PlatformRole.SuperAdmin` | **Super Admin** | Tudo na plataforma |
| `admin` | `PlatformRole.Admin` | **Admin** | Gerenciar usuários e grupos |
| `organizer` | `PlatformRole.Organizer` | **Organizador** | Criar grupos (200 créditos) |
| `player` | `PlatformRole.Player` | **Jogador** | Participar de grupos |

---

## 📅 Status de Evento

### Ciclo de Vida

```
scheduled → confirmed → in_progress → completed
    │            │            │
    │            │            └─── cancelled
    │            └───────── cancelled
    └───────────────────── cancelled
```

| Database | TypeScript | UI | Descrição |
|----------|-----------|-----|-----------|
| `scheduled` | `EventStatus.Scheduled` | **Agendado** | Evento criado, aguardando confirmações |
| `confirmed` | `EventStatus.Confirmed` | **Confirmado** | Vagas preenchidas, pronto para acontecer |
| `in_progress` | `EventStatus.InProgress` | **Em andamento** | Jogo acontecendo agora |
| `completed` | `EventStatus.Completed` | **Concluído** | Jogo finalizado |
| `cancelled` | `EventStatus.Cancelled` | **Cancelado** | Evento não aconteceu |

---

## ✅ Status de Confirmação (RSVP)

| Database | TypeScript | UI | Cor | Descrição |
|----------|-----------|-----|-----|-----------|
| `yes` | `RSVPStatus.Yes` | **Confirmado** | 🟢 Verde | Vaga garantida |
| `no` | `RSVPStatus.No` | **Não vai** | 🔴 Vermelho | Não participará |
| `maybe` | `RSVPStatus.Maybe` | **Talvez** | 🟡 Amarelo | Indeciso (não usa vaga) |
| `waitlist` | `RSVPStatus.Waitlist` | **Lista de Espera** | 🟠 Laranja | Aguardando vaga |

---

## 💰 Sistema Financeiro

### Tipos de Transação

| Database | TypeScript | UI | Descrição |
|----------|-----------|-----|-----------|
| `charge` | `TransactionType.Charge` | **Cobrança** | Débito pendente |
| `payment` | `TransactionType.Payment` | **Pagamento** | Crédito recebido |
| `refund` | `TransactionType.Refund` | **Estorno** | Devolução |
| `adjustment` | `TransactionType.Adjustment` | **Ajuste** | Correção manual |

### Status de Pagamento

| Database | TypeScript | UI | Cor |
|----------|-----------|-----|-----|
| `pending` | `PaymentStatus.Pending` | **Pendente** | 🟡 |
| `paid` | `PaymentStatus.Paid` | **Pago** | 🟢 |
| `cancelled` | `PaymentStatus.Cancelled` | **Cancelado** | 🔴 |
| `refunded` | `PaymentStatus.Refunded` | **Estornado** | 🔵 |

---

## 🎮 Ações de Jogo

| Database | TypeScript | UI | Ícone | Impacto |
|----------|-----------|-----|-------|---------|
| `goal` | `ActionType.Goal` | **Gol** | ⚽ | +1 placar |
| `assist` | `ActionType.Assist` | **Assistência** | 🅰️ | Estatística |
| `save` | `ActionType.Save` | **Defesa** | 🧤 | Estatística goleiro |
| `yellow_card` | `ActionType.YellowCard` | **Cartão Amarelo** | 🟨 | Advertência |
| `red_card` | `ActionType.RedCard` | **Cartão Vermelho** | 🟥 | Expulsão |
| `own_goal` | `ActionType.OwnGoal` | **Gol Contra** | 🔴 | +1 adversário |
| `penalty_scored` | `ActionType.PenaltyScored` | **Pênalti Convertido** | ⚽ | +1 placar |
| `penalty_missed` | `ActionType.PenaltyMissed` | **Pênalti Perdido** | ❌ | Sem pontos |

---

## 🚦 Notificações

### Tipos

| Database | TypeScript | UI | Prioridade |
|----------|-----------|-----|-----------|
| `event_created` | `NotificationType.EventCreated` | "Novo evento criado" | Normal |
| `event_updated` | `NotificationType.EventUpdated` | "Evento atualizado" | Normal |
| `event_cancelled` | `NotificationType.EventCancelled` | "Evento cancelado" | Alta |
| `event_reminder` | `NotificationType.EventReminder` | "Lembrete: evento amanhã" | Alta |
| `rsvp_confirmed` | `NotificationType.RSVPConfirmed` | "Presença confirmada" | Normal |
| `waitlist_moved` | `NotificationType.WaitlistMoved` | "Você saiu da lista de espera!" | Alta |
| `team_drawn` | `NotificationType.TeamDrawn` | "Times sorteados" | Normal |
| `payment_request` | `NotificationType.PaymentRequest` | "Nova cobrança" | Alta |
| `payment_received` | `NotificationType.PaymentReceived` | "Pagamento confirmado" | Normal |
| `achievement_unlocked` | `NotificationType.AchievementUnlocked` | "Conquista desbloqueada!" | Normal |
| `group_invite` | `NotificationType.GroupInvite` | "Convite para grupo" | Alta |

### Canais

| Database | TypeScript | UI |
|----------|-----------|-----|
| `in_app` | `NotificationChannel.InApp` | Dentro do app |
| `push` | `NotificationChannel.Push` | Push notification |
| `email` | `NotificationChannel.Email` | Email |
| `sms` | `NotificationChannel.SMS` | SMS |

---

## 📱 Navegação Consolidada

### Estrutura de Rotas

```
┌─────────────────────────────────────────────────────────────┐
│ ROTAS PÚBLICAS                                              │
├─────────────────────────────────────────────────────────────┤
│ /                          → Landing page                   │
│ /auth/signin               → Login                          │
│ /auth/signup               → Cadastro                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ROTAS AUTENTICADAS (Dashboard Layout)                      │
├─────────────────────────────────────────────────────────────┤
│ /dashboard                 → Overview do grupo ativo        │
│ /eventos                   → Lista de eventos (todos tipos) │
│ /eventos/novo              → Criar evento                   │
│ /eventos/[id]              → Detalhes do evento             │
│ /membros                   → Membros do grupo ativo         │
│ /modalidades               → Configuração de esportes       │
│ /financeiro                → Cobranças e pagamentos         │
│ /estatisticas              → Analytics e gráficos           │
│ /rankings                  → Leaderboards                   │
│ /frequencia                → Histórico de presença          │
│ /configuracoes             → Configurações do grupo         │
│ /creditos                  → Gestão de créditos             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ROTAS GLOBAIS (fora de grupo)                              │
├─────────────────────────────────────────────────────────────┤
│ /perfil/[userId]           → Perfil público de usuário      │
│ /feed                      → Feed social                    │
│ /onboarding                → Wizard de boas-vindas          │
│ /criar-grupo               → Criar novo grupo               │
│ /entrar-grupo              → Entrar com código              │
└─────────────────────────────────────────────────────────────┘
```

### Rotas a Remover (Duplicadas)

❌ `/groups/[groupId]` → usar `/dashboard`
❌ `/groups/[groupId]/events` → usar `/eventos`
❌ `/groups/[groupId]/payments` → usar `/financeiro`
❌ `/groups/[groupId]/settings` → usar `/configuracoes`
❌ `/groups/[groupId]/credits` → usar `/creditos`
❌ `/treinos` → usar `/eventos?tipo=treino`
❌ `/jogos` → usar `/eventos?tipo=jogo`

---

## 🎨 Componentes UI

### Convenção de Nomenclatura

```typescript
// ✅ BOM: nome descritivo, em inglês, kebab-case no arquivo
src/components/events/event-card.tsx
  → export function EventCard()

// ✅ BOM: agrupado por domínio
src/components/payments/charge-list.tsx
src/components/payments/pix-qr-code.tsx

// ❌ EVITAR: nomes genéricos
src/components/card.tsx
src/components/list.tsx

// ❌ EVITAR: misturar português e inglês
src/components/evento-card.tsx
```

### Principais Componentes

| Arquivo | Componente | Descrição |
|---------|-----------|-----------|
| `event-card.tsx` | `EventCard` | Card de evento na lista |
| `event-form.tsx` | `EventForm` | Formulário de evento |
| `rsvp-button.tsx` | `RSVPButton` | Botão de confirmação |
| `team-card.tsx` | `TeamCard` | Card de time sorteado |
| `member-list.tsx` | `MemberList` | Lista de membros |
| `charge-table.tsx` | `ChargeTable` | Tabela de cobranças |
| `pix-payment-card.tsx` | `PixPaymentCard` | QR Code PIX |
| `group-switcher.tsx` | `GroupSwitcher` | Seletor de grupo |
| `notification-bell.tsx` | `NotificationBell` | Sino de notificações |

---

## 📝 Mensagens de UI (Exemplos)

### Eventos

```typescript
// ✅ BOM: claro e direto
"Evento criado com sucesso"
"Presença confirmada"
"Você entrou na lista de espera (posição #3)"

// ❌ EVITAR: técnico demais
"Event inserted into database"
"RSVP status updated to 'yes'"
```

### Erros

```typescript
// ✅ BOM: explicativo e acionável
"Não há vagas disponíveis. Você foi adicionado à lista de espera."
"Você precisa ter 200 créditos para criar um grupo."

// ❌ EVITAR: técnico ou vago
"Error 409: Conflict"
"Insufficient balance"
```

### Confirmações

```typescript
// ✅ BOM: pergunta clara com contexto
"Tem certeza que deseja cancelar este evento? 15 pessoas já confirmaram presença."

// ❌ EVITAR: genérico
"Você tem certeza?"
```

---

## 🧪 Exemplos de Código

### Backend (TypeScript)

```typescript
// ✅ BOM: tipos claros, nomes descritivos
interface CreateEventRequest {
  groupId: string;
  title: string;
  eventType: 'training' | 'official_game' | 'friendly';
  scheduledAt: Date;
  maxPlayers: number;
  price?: number;
}

async function createEvent(data: CreateEventRequest): Promise<Event> {
  // código
}
```

### Frontend (React)

```typescript
// ✅ BOM: props tipadas, nomes claros
interface EventCardProps {
  event: Event;
  onRSVP: (eventId: string, status: RSVPStatus) => void;
  isAdmin: boolean;
}

export function EventCard({ event, onRSVP, isAdmin }: EventCardProps) {
  return (
    <Card>
      <h3>{event.title}</h3>
      <Badge>{getEventTypeLabel(event.eventType)}</Badge>
      {/* ... */}
    </Card>
  );
}

// Helper para tradução
function getEventTypeLabel(type: EventType): string {
  const labels = {
    training: 'Treino',
    official_game: 'Jogo Oficial',
    friendly: 'Amistoso'
  };
  return labels[type];
}
```

### SQL (Queries)

```sql
-- ✅ BOM: comentário explicativo, snake_case
-- Busca eventos futuros do grupo com contagem de confirmados
SELECT
  e.id,
  e.title,
  e.event_type,
  e.scheduled_at,
  COUNT(ea.id) FILTER (WHERE ea.status = 'yes') as confirmed_count
FROM events e
LEFT JOIN event_attendance ea ON ea.event_id = e.id
WHERE e.group_id = $1
  AND e.date >= CURRENT_DATE
  AND e.is_active = true
GROUP BY e.id
ORDER BY e.scheduled_at ASC;
```

---

## ✅ Checklist de Consistência

Ao criar qualquer nova feature, verificar:

- [ ] Nome da tabela em `snake_case` (inglês)
- [ ] Nome do tipo TypeScript em `PascalCase` (inglês)
- [ ] Nome de variável em `camelCase` (inglês)
- [ ] Nome de arquivo em `kebab-case.tsx` (inglês)
- [ ] Textos da UI em português (Brasil)
- [ ] Enums com valores em inglês mas labels em português
- [ ] Rotas em português (`/eventos`, `/financeiro`)
- [ ] Documentação com mapeamento claro DB → Code → UI
- [ ] Mensagens de erro em português, claras e acionáveis
- [ ] Componentes agrupados por domínio (`/events/`, `/payments/`)

---

## 📖 Documentos Relacionados

- [Análise Completa de Jornada e Ambiguidades](ANALISE-JORNADA-USUARIO-AMBIGUIDADES.md)
- [Database Schema](../checkpoints/2026-02-17_resenhapp/08_DATABASE_SCHEMA_COMPLETE.md)
- [Módulos Documentados](../checkpoints/2026-02-17_resenhapp/modules/)
- [CLAUDE.md](00-project-overview/CLAUDE.md) - Convenções para IA

---

**Última atualização:** 2026-02-23
**Mantenedor:** Equipe ResenhApp
**Versão:** 1.0
