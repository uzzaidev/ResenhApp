# Módulo: RANKINGS

## Visão Geral

O módulo RANKINGS exibe classificações e estatísticas individuais dos atletas dentro de um grupo. Calcula o desempenho baseado em ações de jogo (gols, assistências, vitórias, MVPs) e frequência de participação. Utiliza a tabela `leaderboards` para rankings pré-calculados e fornece endpoints dedicados para estatísticas do grupo e do usuário logado.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/(dashboard)/rankings` | Página de rankings do grupo ativo com tabela classificatória e meu desempenho |

---

## API Endpoints

### Rankings e Estatísticas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/rankings` | Obtém a classificação geral dos atletas do grupo |
| `GET` | `/api/groups/[groupId]/my-stats` | Obtém as estatísticas individuais do usuário autenticado |
| `GET` | `/api/groups/[groupId]/stats` | Obtém as estatísticas agregadas do grupo (inclui `playerFrequency`) |

**Query parameters do GET /api/groups/[groupId]/rankings:**

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `period` | string | `all_time` | `weekly`, `monthly`, `yearly`, `all_time` |
| `limit` | number | 20 | Máximo de atletas na classificação |
| `offset` | number | 0 | Paginação |
| `modality` | string | null | Filtrar por modalidade específica |

**Exemplo de resposta do GET /api/groups/[groupId]/rankings:**
```json
{
  "rankings": [
    {
      "rank": 1,
      "userId": "uuid",
      "name": "João Silva",
      "avatarUrl": "...",
      "performanceScore": 145,
      "gamesPlayed": 12,
      "goals": 18,
      "assists": 9,
      "wins": 8,
      "mvpCount": 3,
      "medal": "gold"
    }
  ],
  "total": 24,
  "period": "all_time"
}
```

**Exemplo de resposta do GET /api/groups/[groupId]/my-stats:**
```json
{
  "gamesPlayed": 10,
  "goals": 7,
  "assists": 4,
  "saves": 12,
  "yellowCards": 1,
  "redCards": 0,
  "wins": 6,
  "losses": 3,
  "draws": 0,
  "mvpCount": 2,
  "performanceScore": 89,
  "rank": 5
}
```

> **TODO:** `draws` ainda não é calculado (identificado em comentário no código). Sempre retorna `0`.

---

## Componentes

### `rankings-card`

**Tipo:** Client Component

**Descrição:** Card ou tabela de classificação do grupo com pódio visual para os 3 primeiros e tabela para os demais.

**Props principais:**
- `rankings: RankingEntry[]`
- `period: RankingPeriod`
- `onPeriodChange: (period: RankingPeriod) => void`
- `currentUserId: string` — para destacar o usuário logado na tabela

**Seções:**
- Selector de período (Semana / Mês / Ano / Geral)
- Pódio visual (top 3 com medalhas gold/silver/bronze)
- Tabela com posição, avatar, nome, pontuação e stats resumidos
- Linha destacada do usuário logado

---

### `my-stats-card`

**Tipo:** Client Component

**Descrição:** Card individual com as estatísticas detalhadas do usuário autenticado no grupo.

**Props principais:**
- `stats: MyStats`
- `rank: number`
- `totalPlayers: number`

**Métricas exibidas:**
- Jogos disputados
- Gols / Assistências
- Defesas (saves)
- Cartões (amarelo / vermelho)
- Vitórias / Derrotas / Empates (TODO)
- Contagem de MVPs
- Pontuação de desempenho total
- Posição no ranking

---

## Tabelas do Banco de Dados

### `event_actions` (fonte principal dos dados)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento onde ocorreu a ação |
| `user_id` | UUID FK | Atleta que realizou a ação |
| `team_id` | UUID FK | Time do atleta |
| `action_type` | VARCHAR | `goal`, `assist`, `save`, `yellow_card`, `red_card`, `own_goal` |
| `minute` | INTEGER | Minuto da ação |
| `registered_at` | TIMESTAMP | Timestamp do registro |

### `event_attendance` (frequência e vitórias/derrotas)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento |
| `user_id` | UUID FK | Atleta |
| `status` | VARCHAR | `confirmed`, `present`, `absent`, `waitlist`, `cancelled` |
| `team_id` | UUID FK | Time ao qual o atleta pertenceu no evento |

### `player_stats` (estatísticas pré-calculadas por evento)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID FK | Atleta |
| `group_id` | UUID FK | Grupo |
| `event_id` | UUID FK | Evento |
| `goals` | INTEGER | Gols no evento |
| `assists` | INTEGER | Assistências no evento |
| `saves` | INTEGER | Defesas no evento |
| `yellow_cards` | INTEGER | Cartões amarelos |
| `red_cards` | INTEGER | Cartões vermelhos |
| `own_goals` | INTEGER | Gols contra |
| `result` | VARCHAR | `win`, `loss`, `draw` |
| `is_mvp` | BOOLEAN | Se foi eleito MVP do evento |

### `leaderboards` (rankings pré-calculados)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo |
| `user_id` | UUID FK | Atleta |
| `period` | VARCHAR | `weekly`, `monthly`, `yearly`, `all_time` |
| `rank` | INTEGER | Posição no ranking |
| `performance_score` | INTEGER | Pontuação calculada |
| `games_played` | INTEGER | Jogos no período |
| `goals` | INTEGER | Gols no período |
| `assists` | INTEGER | Assistências no período |
| `wins` | INTEGER | Vitórias no período |
| `mvp_count` | INTEGER | MVPs no período |
| `calculated_at` | TIMESTAMP | Última vez que o ranking foi recalculado |

### `votes` (votos de MVP)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento |
| `voter_id` | UUID FK | Votante |
| `voted_for_id` | UUID FK | Atleta votado |
| `created_at` | TIMESTAMP | Data do voto |

---

## Fórmula de Pontuação de Desempenho

```
performance_score =
  (games_played × 1) +
  (goals        × 3) +
  (assists      × 2) +
  (wins         × 5) +
  (mvp_count    × 10)
```

**Exemplo de cálculo:**

| Métrica | Valor | Multiplicador | Subtotal |
|---------|-------|---------------|----------|
| Jogos disputados | 12 | × 1 | 12 |
| Gols | 8 | × 3 | 24 |
| Assistências | 5 | × 2 | 10 |
| Vitórias | 7 | × 5 | 35 |
| MVPs | 3 | × 10 | 30 |
| **Total** | | | **111** |

---

## Sistema de Medalhas (Top 3)

| Posição | Medalha | Cor |
|---------|---------|-----|
| 1º lugar | Gold | `#FFD700` |
| 2º lugar | Silver | `#C0C0C0` |
| 3º lugar | Bronze | `#CD7F32` |

As medalhas são calculadas dinamicamente no endpoint de rankings — não são armazenadas no banco.

---

## Ranking de Frequência

Além do ranking de desempenho, há um ranking de frequência baseado na taxa de presença nos últimos 10 eventos finalizados.

**Cálculo:**
```
attendance_rate = (presences / last_10_events_count) × 100
```

**Dados do campo `playerFrequency` em `/api/groups/[groupId]/stats`:**
```json
{
  "playerFrequency": [
    {
      "userId": "uuid",
      "name": "Maria Santos",
      "presences": 9,
      "absences": 1,
      "attendanceRate": 90,
      "last10Events": ["present", "present", "absent", ...]
    }
  ]
}
```

---

## Estatísticas Individuais (`my-stats`)

O endpoint `GET /api/groups/[groupId]/my-stats` retorna as estatísticas acumuladas do usuário autenticado no grupo:

| Campo | Fonte | Descrição |
|-------|-------|-----------|
| `gamesPlayed` | `event_attendance` (status=present) | Total de jogos disputados |
| `goals` | `event_actions` (action_type=goal) | Total de gols |
| `assists` | `event_actions` (action_type=assist) | Total de assistências |
| `saves` | `event_actions` (action_type=save) | Total de defesas |
| `yellowCards` | `event_actions` (action_type=yellow_card) | Total de cartões amarelos |
| `redCards` | `event_actions` (action_type=red_card) | Total de cartões vermelhos |
| `wins` | `player_stats` (result=win) | Total de vitórias |
| `losses` | `player_stats` (result=loss) | Total de derrotas |
| `draws` | `player_stats` (result=draw) | **TODO: não calculado ainda** |
| `mvpCount` | `votes` (contagem) ou `player_stats.is_mvp` | Total de vezes eleito MVP |
| `performanceScore` | Fórmula acima | Pontuação total |

---

## Tabela `leaderboards`: Rankings Pré-calculados

A tabela `leaderboards` armazena rankings pré-calculados por período para consultas rápidas, evitando recálculos pesados a cada requisição.

**Atualização:**
- Disparada pelo cron `/api/cron/calculate-metrics` (marcado como NOT FOUND — ver seção de status)
- Pode também ser recalculada ao encerrar um evento (`status = completed`)
- Usa `UPSERT` para atualizar registros existentes baseado em `(group_id, user_id, period)`

---

## Status de Implementação

| Funcionalidade | Status |
|----------------|--------|
| Rankings gerais (`all_time`) | Implementado |
| Rankings por período (weekly/monthly/yearly) | Implementado via `leaderboards` |
| Estatísticas individuais (`my-stats`) | Implementado |
| Frequência de presença | Implementado via `stats.playerFrequency` |
| Cálculo de empates (`draws`) | **TODO — não implementado** |
| Cron de recálculo de métricas | **NOT FOUND — endpoint não localizado** |
| Ranking por modalidade | Estruturado, integração parcial |

---

## Notas de Implementação

- Quando o cron de recálculo não está disponível, os rankings são calculados on-demand diretamente via query no endpoint de rankings
- A query on-demand agrega `event_actions` e `event_attendance` filtrando pelo `group_id` e período selecionado
- Para alta performance, os dados de `leaderboards` devem ser usados sempre que disponíveis; o cálculo on-demand é fallback
- O campo `draws` está comentado no código como pendente de implementação; o endpoint retorna `0` até a correção
- A tabela `player_stats` pode ser utilizada para otimizar futuras consultas sem depender do cron
