# ResenhApp V2.0 — Webhooks, Jobs e Integrações
> FATO (do código) — vercel.json, src/app/api/

## Cron Jobs (vercel.json)
| Path | Schedule | Descrição | Status |
|------|----------|-----------|--------|
| /api/cron/send-reminders | 0 10 * * * | Lembretes diários às 10h UTC | **ROTA NÃO ENCONTRADA** |
| /api/cron/calculate-metrics | 0 2 * * * | Métricas diárias às 2h UTC | **ROTA NÃO ENCONTRADA** |
| /api/cron/cleanup-notifications | 0 3 * * 0 | Limpeza semanal dom 3h UTC | **ROTA NÃO ENCONTRADA** |

RISCO CRÍTICO: Os 3 cron jobs estão definidos no vercel.json mas nenhum route.ts correspondente foi encontrado em src/app/api/cron/. Isso causará erros 404 a cada execução do cron.

## Webhooks
NÃO ENCONTRADO: Nenhum webhook handler encontrado em src/app/api/.
- Não há /api/webhooks/
- Não há handlers de pagamento externo

## Integrações
| Integração | Status | Detalhes |
|-----------|--------|---------|
| Sentry | Implementado | client + server + edge configs |
| PostHog Analytics | TODO | analytics.ts tem TODO comments |
| Pino Logger | Implementado | Pino + pino-pretty |
| PIX (Banco Central) | Implementado | BR Code EMV customizado |
| Supabase Storage | Configurado | 4 buckets |
| Supabase Realtime | Configurado | 6 tabelas |
| Email Provider | NÃO ENCONTRADO | email_queue table existe, sender não |
| Push Notifications | NÃO ENCONTRADO | push_tokens table existe, sender não |

## Triggers PostgreSQL como "Jobs"
- charge_created_notification: Cria notificação ao INSERT em charges
- payment_received_notification: Cria notificação ao UPDATE em charges (status=paid)
- after_insert_event_action_update_stats: Atualiza player_stats após ação
- after_update_attendance_stats: Atualiza stats após presença
- after_insert_event_action_check_achievements: Verifica conquistas
