# ResenhApp V2.0 — Sistema de Notificações
> FATO (do código) — src/app/api/notifications/, src/hooks/use-notifications.ts, supabase/migrations/20260211000001_notifications.sql

## Visão Geral
Sistema de notificações in-app com polling automático. Suporte estrutural para push, email e SMS (tabelas criadas, mas delivery ainda não implementado completamente).

## Tipos de Notificação
| Tipo | Descrição |
|------|-----------|
| event_created | Novo evento criado no grupo |
| event_updated | Evento foi editado |
| event_cancelled | Evento cancelado |
| event_reminder | Lembrete de evento próximo |
| rsvp_confirmed | Presença confirmada |
| waitlist_moved | Saiu da lista de espera |
| team_drawn | Times foram sorteados |
| payment_request | Nova cobrança |
| payment_received | Pagamento registrado |
| achievement_unlocked | Conquista desbloqueada |
| group_invite | Convite para grupo |

## Canais
- in_app: Implementado (polling via use-notifications.ts)
- push: Estrutura criada (push_tokens table), delivery não confirmado
- email: Estrutura criada (email_queue table), delivery não confirmado
- sms: Estrutura criada, delivery não confirmado

## Hook (src/hooks/use-notifications.ts)
```typescript
// Polling automático a cada 30 segundos
// Endpoints:
//   GET /api/notifications → {notifications, unreadCount}
//   PATCH /api/notifications/:id → mark as read
//   DELETE /api/notifications/:id → delete
//   POST /api/notifications?action=mark-all-read
```

## API Endpoints
| Método | Rota | Propósito |
|--------|------|-----------|
| GET | /api/notifications | Listar (unread first, por created_at DESC) |
| POST | /api/notifications?action=mark-all-read | Marcar todas como lidas |
| PATCH | /api/notifications/[id] | Marcar uma como lida |
| DELETE | /api/notifications/[id] | Soft delete (deleted_at) |

## Tabelas
- notifications: Principal, com soft delete (deleted_at)
- notification_templates: Templates reutilizáveis por key
- push_tokens: Tokens de dispositivos (web, ios, android)
- email_queue: Fila de emails com retry
- notification_batches: Envios em massa

## Triggers de Notificação (do banco)
- charge_created_notification: Dispara ao criar cobrança
- payment_received_notification: Dispara ao marcar como pago

## Cron Jobs (vercel.json)
- /api/cron/send-reminders (daily 10h UTC): ROTA NÃO ENCONTRADA no código
- /api/cron/cleanup-notifications (weekly): ROTA NÃO ENCONTRADA no código
