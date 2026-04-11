# ResenhApp V2.0 — Gamificação
> FATO (do código) — supabase/migrations/20260225000001_gamification.sql

## Visão Geral
Sistema de gamificação com conquistas, badges, leaderboards e desafios. Estrutura de banco criada via migration. Integração no código ainda limitada (TODO).

## Componentes
1. **Achievements (Conquistas)**: Desbloqueadas automaticamente por critérios
2. **Badges (Medalhas)**: Ganhas por ações específicas
3. **Leaderboards**: Rankings calculados por período
4. **Challenges (Desafios)**: Metas com prazo e recompensas
5. **Milestones**: Marcos de progresso por usuário+grupo

## Tabelas
| Tabela | Propósito |
|--------|-----------|
| achievement_types | Definição das conquistas (código, critério, raridade, pontos) |
| user_achievements | Conquistas desbloqueadas por usuário |
| badges | Definição de badges |
| user_badges | Badges ganhos por usuário |
| milestones | Marcos atingidos (unique user+group+type) |
| challenges | Desafios com prazo e recompensa |
| challenge_participants | Participantes e progresso |
| leaderboards | Rankings calculados (UNIQUE group+category+period) |

## Categorias de Achievement
- goals: Gols marcados
- assists: Assistências
- participation: Presença/frequência
- streak: Sequências de jogos
- special: Conquistas especiais

## Raridades
common < uncommon < rare < epic < legendary

## Trigger de Achievements
- after_insert_event_action_check_achievements: Verifica conquistas após cada ação no jogo

## Cálculo de Leaderboards
- Period types: weekly, monthly, yearly, all_time
- Categories: goals, assists, attendance, mvp, streak, all_time
- Rankings armazenados como JSONB na tabela leaderboards
- Cron: /api/cron/calculate-metrics (daily 2h UTC) — ROTA NÃO ENCONTRADA

## Status de Implementação
INFERÊNCIA: A estrutura de banco está completa mas a integração no front-end/API parece estar em desenvolvimento. Não foram encontradas páginas dedicadas a achievements/badges no código de páginas analisado.
