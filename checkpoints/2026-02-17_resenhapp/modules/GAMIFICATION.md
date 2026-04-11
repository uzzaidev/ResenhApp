# Módulo: GAMIFICATION (Gamificação)

## Visão Geral

O módulo GAMIFICATION implementa o sistema de conquistas, badges, marcos e desafios da plataforma ResenhApp. A estrutura de banco de dados está completamente definida e os triggers de detecção de conquistas estão implementados, mas a integração com UI e APIs dedicadas está em desenvolvimento. Não existe página dedicada de gamificação no frontend atual.

**Status geral:** Estrutura de banco de dados completa. Integração UI/API em desenvolvimento.

---

## Página Dedicada

Nenhuma página dedicada de gamificação foi encontrada no codebase atual.

As conquistas e badges são referenciados pontualmente em outros módulos:
- Notificações: tipo `achievement_unlocked` (ver módulo NOTIFICATIONS)
- Rankings: `mvp_count` é um dos indicadores que pode desbloquear conquistas
- Dashboard: planejado para exibir badges do usuário (Sprint futuro)

---

## Tabelas do Banco de Dados

### `achievement_types`

Define os tipos de conquistas disponíveis na plataforma.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `name` | VARCHAR | Nome da conquista (ex: "Artilheiro") |
| `description` | TEXT | Descrição do critério de desbloqueio |
| `category` | VARCHAR | Categoria da conquista |
| `rarity` | VARCHAR | Raridade da conquista |
| `icon_url` | TEXT | URL do ícone da conquista |
| `criteria` | JSONB | Critérios de desbloqueio (ex: `{ "goals": 10 }`) |
| `points` | INTEGER | Pontos concedidos ao desbloquear |
| `is_active` | BOOLEAN | Se a conquista está ativa |
| `created_at` | TIMESTAMP | Data de criação |

### `user_achievements`

Registra as conquistas desbloqueadas por cada usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID FK | Usuário que desbloqueou |
| `achievement_type_id` | UUID FK | Tipo de conquista |
| `group_id` | UUID FK | Grupo onde foi desbloqueada |
| `unlocked_at` | TIMESTAMP | Data de desbloqueio |
| `event_id` | UUID FK | Evento que disparou o desbloqueio (nullable) |
| `data` | JSONB | Dados extras do desbloqueio |

**Constraint:**
```sql
UNIQUE(user_id, achievement_type_id, group_id)
```
Um usuário não pode desbloquear a mesma conquista duas vezes no mesmo grupo.

### `badges`

Define os badges visuais atribuíveis a usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `name` | VARCHAR | Nome do badge (ex: "Craque do Mês") |
| `description` | TEXT | Descrição do badge |
| `icon_url` | TEXT | URL do ícone |
| `rarity` | VARCHAR | Raridade do badge |
| `category` | VARCHAR | Categoria do badge |
| `is_active` | BOOLEAN | Se o badge está ativo |

### `user_badges`

Registra os badges obtidos por cada usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID FK | Proprietário do badge |
| `badge_id` | UUID FK | Badge obtido |
| `group_id` | UUID FK | Grupo onde foi obtido |
| `awarded_at` | TIMESTAMP | Data de atribuição |
| `awarded_by` | UUID FK | Admin que atribuiu (ou null para automático) |
| `expires_at` | TIMESTAMP | Data de expiração (nullable = permanente) |

### `milestones`

Marcos de progresso que os usuários alcançam gradualmente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `name` | VARCHAR | Nome do marco (ex: "10 Jogos Disputados") |
| `description` | TEXT | Descrição do marco |
| `category` | VARCHAR | Categoria |
| `target_value` | INTEGER | Valor alvo para atingir o marco |
| `metric` | VARCHAR | Métrica medida (ex: `games_played`, `goals`) |
| `reward_credits` | INTEGER | Créditos concedidos ao atingir |
| `reward_badge_id` | UUID FK | Badge concedido ao atingir (nullable) |
| `is_active` | BOOLEAN | Se o marco está ativo |

### `challenges`

Desafios temporais com metas específicas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `name` | VARCHAR | Nome do desafio |
| `description` | TEXT | Descrição e regras |
| `type` | VARCHAR | `individual`, `team`, `group` |
| `category` | VARCHAR | Categoria do desafio |
| `target_value` | INTEGER | Meta a atingir |
| `metric` | VARCHAR | Métrica medida |
| `reward_credits` | INTEGER | Créditos para o vencedor |
| `reward_badge_id` | UUID FK | Badge para o vencedor (nullable) |
| `starts_at` | TIMESTAMP | Início do desafio |
| `ends_at` | TIMESTAMP | Fim do desafio |
| `group_id` | UUID FK | Grupo ao qual o desafio pertence (nullable = global) |
| `is_active` | BOOLEAN | Se o desafio está ativo |

### `challenge_participants`

Registra a participação e progresso nos desafios.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `challenge_id` | UUID FK | Desafio |
| `user_id` | UUID FK | Participante |
| `current_value` | INTEGER | Progresso atual |
| `is_completed` | BOOLEAN | Se atingiu a meta |
| `completed_at` | TIMESTAMP | Quando completou (nullable) |
| `rank` | INTEGER | Posição no desafio (nullable) |
| `joined_at` | TIMESTAMP | Data de entrada no desafio |

### `leaderboards`

Rankings pré-calculados com suporte a diferentes períodos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo |
| `user_id` | UUID FK | Atleta |
| `period` | VARCHAR | `weekly`, `monthly`, `yearly`, `all_time` |
| `rank` | INTEGER | Posição no ranking |
| `performance_score` | INTEGER | Pontuação do período |
| `games_played` | INTEGER | Jogos no período |
| `goals` | INTEGER | Gols no período |
| `assists` | INTEGER | Assistências no período |
| `wins` | INTEGER | Vitórias no período |
| `mvp_count` | INTEGER | MVPs no período |
| `calculated_at` | TIMESTAMP | Última atualização |

---

## Categorias de Conquistas

| Categoria | Exemplos de conquistas |
|-----------|----------------------|
| `goals` | Artilheiro (10 gols), Goleador (50 gols), Bombardeiro (100 gols) |
| `assists` | Assistidor (10 assistências), Maestro (50 assistências) |
| `participation` | Participante Fiel (5 jogos), Veterano (20 jogos), Lenda (50 jogos) |
| `streak` | Em Chama (3 jogos consecutivos), Invicto (5 vitórias seguidas) |
| `special` | Primeiro Gol, MVP do Mês, Craque da Temporada |

---

## Raridades

| Raridade | Descrição | Frequência |
|----------|-----------|-----------|
| `common` | Conquistas básicas de participação | Alta — maioria dos jogadores |
| `uncommon` | Conquistas de desempenho moderado | Média — jogadores regulares |
| `rare` | Conquistas de alto desempenho | Baixa — jogadores dedicados |
| `epic` | Conquistas excepcionais | Muito baixa — top performers |
| `legendary` | Conquistas únicas ou recordes | Rarríssima — elite |

---

## Trigger: `after_insert_event_action_check_achievements`

**Tipo:** `AFTER INSERT ON event_actions`

**Descrição:** Trigger que verifica automaticamente se uma nova ação registrada no evento desbloqueia alguma conquista para o jogador.

**Lógica:**
1. Obtém o `user_id` da nova ação inserida
2. Consulta `achievement_types` cujo `criteria` corresponde ao `action_type`
3. Para cada achievement candidate:
   a. Conta o total histórico da métrica para o usuário no grupo
   b. Compara com o `criteria.threshold`
   c. Se atingiu e ainda não desbloqueou: INSERT em `user_achievements`
   d. Cria notificação do tipo `achievement_unlocked`

**Exemplo:**
```sql
-- Ao registrar o 10º gol de um usuário:
-- Trigger verifica achievement_types WHERE criteria @> '{"goals": 10}'
-- Se encontrar e usuário ainda não tiver: INSERT em user_achievements
-- E cria notificação achievement_unlocked
```

---

## Cron: `/api/cron/calculate-metrics`

**Status:** NOT FOUND — o endpoint não foi localizado no codebase atual.

**Função esperada:**
- Calcular e atualizar a tabela `leaderboards` para todos os períodos
- Verificar conclusão de desafios (`challenges`) expirados
- Atualizar `challenge_participants.rank` para desafios encerrados
- Conceder recompensas (créditos, badges) para vencedores de desafios

---

## Períodos do Leaderboard

| Período | Descrição |
|---------|-----------|
| `weekly` | Semana corrente (Seg-Dom) |
| `monthly` | Mês corrente |
| `yearly` | Ano corrente |
| `all_time` | Todo o histórico do grupo |

---

## Integração com Outros Módulos

| Módulo | Integração |
|--------|-----------|
| EVENTS | Trigger `after_insert_event_action_check_achievements` dispara em cada ação de jogo |
| NOTIFICATIONS | Conquistas criam notificação `achievement_unlocked` |
| RANKINGS | `leaderboards` é usada pelo módulo de rankings para exibição |
| CREDITS | Marcos e desafios podem conceder créditos (`milestone.reward_credits`, `challenge.reward_credits`) |

---

## Roadmap de Implementação

Com base na análise do codebase, o estado atual do módulo é:

| Componente | Status |
|------------|--------|
| Tabelas de banco de dados | Completo |
| Trigger `after_insert_event_action_check_achievements` | Implementado |
| Notificação de achievement unlocked | Implementado (trigger) |
| API endpoints de conquistas | Em desenvolvimento |
| Página de conquistas no frontend | Não iniciado |
| API endpoints de desafios | Não iniciado |
| Página de desafios | Não iniciado |
| Cron de cálculo de métricas | NOT FOUND |
| Sistema de badges manuais (admin) | Estrutura pronta |
| Integração de créditos como recompensa | Estrutura pronta |

---

## Notas de Implementação

- A tabela `leaderboards` é compartilhada com o módulo RANKINGS para evitar duplicação de dados
- O trigger de achievements opera de forma síncrona na mesma transaction do INSERT em `event_actions` — se o trigger falhar, o INSERT é revertido
- O campo `criteria` em `achievement_types` usa JSONB para flexibilidade; exemplos:
  - `{ "goals": 10 }` — atingir 10 gols total
  - `{ "consecutive_wins": 3 }` — 3 vitórias consecutivas
  - `{ "games_played": 50 }` — 50 jogos disputados
- Badges podem ser atribuídos manualmente por admins (campo `awarded_by`) ou automaticamente por triggers (campo `awarded_by = null`)
- A raridade de conquistas e badges é descritiva e não afeta diretamente nenhum cálculo automático — é usada para estilização visual no frontend
