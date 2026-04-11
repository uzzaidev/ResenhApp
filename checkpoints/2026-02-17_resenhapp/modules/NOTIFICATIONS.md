# Módulo: NOTIFICATIONS

## Visão Geral

O módulo NOTIFICATIONS gerencia o sistema de notificações da plataforma ResenhApp. Implementa notificações in-app com polling de 30 segundos e estrutura de banco para suporte futuro a push, e-mail e SMS. Notificações são exibidas em um dropdown na topbar e suportam soft delete via `deleted_at`.

---

## API Endpoints

### Notificações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/notifications` | Lista as notificações do usuário autenticado |
| `PATCH` | `/api/notifications/[notificationId]` | Marca notificação como lida |
| `DELETE` | `/api/notifications/[notificationId]` | Soft delete de uma notificação |
| `POST` | `/api/notifications/mark-all-read` | Marca todas as notificações como lidas |
| `DELETE` | `/api/notifications/clear-all` | Soft delete de todas as notificações do usuário |

**Query parameters do GET /api/notifications:**

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `unread_only` | boolean | false | Retorna apenas não lidas |
| `limit` | number | 20 | Quantidade por página |
| `offset` | number | 0 | Paginação |

**Exemplo de resposta do GET /api/notifications:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "event_created",
      "title": "Novo evento criado",
      "body": "A pelada de terça foi criada para 18/02/2025",
      "isRead": false,
      "priority": 2,
      "data": { "eventId": "uuid", "groupId": "uuid" },
      "createdAt": "2025-02-17T10:00:00Z"
    }
  ],
  "unreadCount": 3,
  "total": 12
}
```

---

## Hook: `use-notifications.ts`

**Localização:** `src/hooks/use-notifications.ts`

**Tipo:** Custom React Hook (Client-side)

**Descrição:** Hook que gerencia o estado das notificações com polling automático a cada 30 segundos.

**Assinatura:**
```typescript
const useNotifications = () => {
  notifications: Notification[],
  unreadCount: number,
  isLoading: boolean,
  markAsRead: (notificationId: string) => Promise<void>,
  markAllAsRead: () => Promise<void>,
  deleteNotification: (notificationId: string) => Promise<void>,
  refetch: () => void,
}
```

**Comportamento do polling:**
- Faz fetch inicial ao montar o componente
- Configura `setInterval` de 30.000ms para re-fetch automático
- Cancela o interval ao desmontar (cleanup)
- Atualiza o `unreadCount` no badge da topbar em tempo real
- Pausa o polling quando a aba do navegador está em background (usando `document.visibilityState`)

---

## Componente: `notifications-dropdown.tsx`

**Localização:** `src/components/notifications/notifications-dropdown.tsx`

**Tipo:** Client Component

**Descrição:** Dropdown de notificações exibido na topbar. Usa o hook `use-notifications` para dados e polling.

**Props principais:**
- Nenhuma prop direta — consome o hook internamente

**Estrutura visual:**
- Botão de sino com badge vermelho mostrando `unreadCount`
- Dropdown com lista de notificações
- Cada item: ícone por tipo, título, corpo, tempo relativo ("5 min atrás"), indicador de não lida (ponto azul)
- Ação "Marcar todas como lidas"
- Ação "Limpar tudo"
- Link "Ver todas" (página de notificações completa, se existir)

---

## Tabelas do Banco de Dados

### `notifications`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID FK | Destinatário da notificação |
| `group_id` | UUID FK | Grupo relacionado (nullable) |
| `type` | VARCHAR | Tipo da notificação (ver tipos abaixo) |
| `title` | VARCHAR | Título da notificação |
| `body` | TEXT | Corpo/descrição da notificação |
| `data` | JSONB | Dados extras (ex: `{ eventId, chargeId }`) |
| `is_read` | BOOLEAN | Se foi lida (default: false) |
| `read_at` | TIMESTAMP | Quando foi lida |
| `priority` | INTEGER | Prioridade de 1 (baixa) a 5 (crítica) |
| `deleted_at` | TIMESTAMP | Soft delete (null = ativa) |
| `created_at` | TIMESTAMP | Data de criação |

### `notification_templates`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `type` | VARCHAR UNIQUE | Identificador do tipo |
| `title_template` | TEXT | Template do título com variáveis (ex: `{{eventTitle}} foi criado`) |
| `body_template` | TEXT | Template do corpo com variáveis |
| `default_priority` | INTEGER | Prioridade padrão para o tipo |
| `channels` | JSONB | Canais habilitados: `["in_app", "push", "email"]` |

### `push_tokens`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID FK | Proprietário do token |
| `token` | TEXT | Token de push (FCM, APNs) |
| `platform` | VARCHAR | `web`, `ios`, `android` |
| `is_active` | BOOLEAN | Se o token está ativo |
| `created_at` | TIMESTAMP | Data de registro |
| `updated_at` | TIMESTAMP | Última atualização |

### `email_queue`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID FK | Destinatário |
| `notification_id` | UUID FK | Notificação vinculada |
| `to_email` | VARCHAR | Endereço de destino |
| `subject` | VARCHAR | Assunto do e-mail |
| `html_body` | TEXT | Corpo HTML do e-mail |
| `status` | VARCHAR | `pending`, `sent`, `failed` |
| `attempts` | INTEGER | Número de tentativas de envio |
| `sent_at` | TIMESTAMP | Data de envio bem-sucedido |
| `created_at` | TIMESTAMP | Data de criação na fila |

### `notification_batches`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo destinatário |
| `type` | VARCHAR | Tipo da notificação em lote |
| `title` | VARCHAR | Título comum |
| `body` | TEXT | Corpo comum |
| `data` | JSONB | Dados extras |
| `recipient_count` | INTEGER | Número de destinatários |
| `sent_count` | INTEGER | Número de notificações criadas |
| `created_by` | UUID FK | Admin que disparou |
| `created_at` | TIMESTAMP | Data do disparo |

---

## Tipos de Notificação

| Tipo | Descrição | Prioridade |
|------|-----------|-----------|
| `event_created` | Novo evento criado no grupo | 2 |
| `event_updated` | Evento atualizado (horário, local) | 2 |
| `event_cancelled` | Evento cancelado | 4 |
| `event_reminder` | Lembrete de evento próximo | 3 |
| `rsvp_confirmed` | Presença confirmada com sucesso | 1 |
| `waitlist_moved` | Promovido da fila de espera | 3 |
| `team_drawn` | Times sorteados para o evento | 2 |
| `payment_request` | Cobrança pendente gerada | 3 |
| `payment_received` | Pagamento confirmado | 2 |
| `achievement_unlocked` | Nova conquista desbloqueada | 2 |
| `group_invite` | Convite para entrar em um grupo | 3 |

---

## Canais de Notificação

| Canal | Status | Descrição |
|-------|--------|-----------|
| `in_app` | Implementado | Notificações no dropdown da topbar com polling |
| `push` | Estrutura apenas | Tabela `push_tokens` criada; envio não implementado |
| `email` | Estrutura apenas | Tabela `email_queue` criada; envio não implementado |
| `sms` | Estrutura apenas | Previsto; nenhuma tabela ou lógica implementada |

---

## Soft Delete via `deleted_at`

As notificações usam soft delete para preservar histórico e sincronização entre dispositivos:

- `deleted_at = null` — notificação ativa e visível
- `deleted_at IS NOT NULL` — notificação deletada, ignorada nas queries de listagem

**Query padrão de listagem:**
```sql
SELECT * FROM notifications
WHERE user_id = :userId
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset
```

---

## Triggers de Banco de Dados

### `charge_created_notification`

**Trigger:** `AFTER INSERT ON charges`

**Comportamento:**
1. Ao inserir uma nova cobrança, dispara para o `user_id` da cobrança
2. Cria notificação do tipo `payment_request`
3. Preenche `title` e `body` baseado no template `payment_request`
4. Define `data = { chargeId, amount, dueDate, groupId }`

### `payment_received_notification`

**Trigger:** `AFTER UPDATE ON charges WHEN (NEW.status = 'paid' AND OLD.status = 'pending')`

**Comportamento:**
1. Ao marcar uma cobrança como paga, dispara para o admin do grupo
2. Cria notificação do tipo `payment_received`
3. Informa o nome do atleta que pagou e o valor

---

## Crons (Status)

| Cron | Endpoint | Status |
|------|----------|--------|
| Envio de lembretes de evento | `/api/cron/send-reminders` | NOT FOUND — não localizado no codebase |
| Limpeza de notificações antigas | `/api/cron/cleanup-notifications` | NOT FOUND — não localizado no codebase |

**Nota:** Os crons estão documentados na arquitetura mas os endpoints correspondentes não foram localizados na versão atual do codebase.

---

## Sistema de Prioridade

| Prioridade | Nível | Exemplos |
|-----------|-------|---------|
| 1 | Baixa | RSVP confirmado, achievement |
| 2 | Normal | Novo evento, times sorteados |
| 3 | Média | Lembrete, promoção da waitlist, cobrança |
| 4 | Alta | Evento cancelado |
| 5 | Crítica | (Reservado para uso futuro) |

Notificações com prioridade >= 4 podem no futuro disparar alertas sonoros ou visuais mais intensos.

---

## Notas de Implementação

- O polling de 30 segundos é realizado pelo hook `use-notifications` em qualquer página autenticada onde o componente `notifications-dropdown` esteja presente (topbar)
- O `unreadCount` é calculado em tempo real na query: `COUNT(*) WHERE is_read = false AND deleted_at IS NULL`
- O campo `data` (JSONB) nas notificações armazena IDs de entidades relacionadas (eventos, cobranças, grupos) para que o frontend possa construir links de ação
- Notificações em lote (`notification_batches`) são usadas para enviar a mesma notificação para todos os membros de um grupo (ex: novo evento criado)
- A coluna `priority` não altera o comportamento do polling; é usada apenas para ordenação e filtragem futura
- Os templates em `notification_templates` permitem personalização centralizada das mensagens sem alterar código; variáveis são substituídas via template string engine
