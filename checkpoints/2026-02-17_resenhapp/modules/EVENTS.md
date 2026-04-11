# Módulo: EVENTS

## Visão Geral

O módulo EVENTS é o núcleo operacional da plataforma ResenhApp. Gerencia o ciclo de vida completo de eventos esportivos: criação, confirmação de presença (RSVP), sorteio de times, pontuação ao vivo, votação de MVP e encerramento. Suporta eventos recorrentes, cobrança automática e três tipos de evento: treino, jogo oficial e amistoso.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/(dashboard)/eventos` | Lista de eventos do grupo ativo |
| `/(dashboard)/eventos/novo` | Formulário de criação de evento |
| `/(dashboard)/eventos/[eventId]` | Página principal do evento com abas |
| `/(dashboard)/eventos/[eventId]/editar` | Edição de evento existente |

---

## API Endpoints (20+ rotas)

### Eventos principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/events` | Lista eventos do grupo ativo |
| `POST` | `/api/events` | Cria um novo evento |
| `GET` | `/api/events/[eventId]` | Obtém detalhes de um evento |
| `PATCH` | `/api/events/[eventId]` | Atualiza um evento |
| `DELETE` | `/api/events/[eventId]` | Remove um evento (soft delete) |

### Presença (RSVP)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/events/[eventId]/attendance` | Lista presenças do evento |
| `POST` | `/api/events/[eventId]/attendance` | Registra RSVP do usuário |
| `PATCH` | `/api/events/[eventId]/attendance/[attendanceId]` | Atualiza status de presença |
| `DELETE` | `/api/events/[eventId]/attendance/[attendanceId]` | Cancela RSVP |

### Times e Sorteio

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/events/[eventId]/teams` | Lista os times sorteados |
| `POST` | `/api/events/[eventId]/teams/draw` | Executa o sorteio de times |
| `PATCH` | `/api/events/[eventId]/teams/[teamId]` | Atualiza nome/cor de um time |
| `POST` | `/api/events/[eventId]/teams/[teamId]/members` | Adiciona jogador ao time manualmente |
| `DELETE` | `/api/events/[eventId]/teams/[teamId]/members/[memberId]` | Remove jogador do time |

### Pontuação ao vivo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/events/[eventId]/actions` | Lista ações registradas no evento |
| `POST` | `/api/events/[eventId]/actions` | Registra uma nova ação (gol, assistência, etc.) |
| `DELETE` | `/api/events/[eventId]/actions/[actionId]` | Desfaz uma ação registrada |
| `POST` | `/api/events/[eventId]/score` | Atualiza o placar manualmente |

### Votação e MVP

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/events/[eventId]/votes` | Lista votos de MVP |
| `POST` | `/api/events/[eventId]/votes` | Registra voto de MVP |
| `GET` | `/api/events/[eventId]/mvp-tiebreakers` | Lista desempatadores de MVP |
| `POST` | `/api/events/[eventId]/mvp-tiebreakers` | Cria rodada de desempate |
| `POST` | `/api/events/[eventId]/mvp-tiebreakers/[id]/votes` | Vota no desempate |

### Ciclo de vida do evento

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/events/[eventId]/confirm` | Confirma o evento (scheduled → confirmed) |
| `POST` | `/api/events/[eventId]/start` | Inicia o evento (confirmed → in_progress) |
| `POST` | `/api/events/[eventId]/finish` | Encerra o evento (in_progress → completed) |
| `POST` | `/api/events/[eventId]/cancel` | Cancela o evento |

### Configuração de sorteio

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/events/[eventId]/draw-config` | Obtém config de sorteio do evento |
| `PATCH` | `/api/events/[eventId]/draw-config` | Atualiza config de sorteio |

---

## Componentes

### `event-form`

**Tipo:** Client Component

**Descrição:** Formulário unificado de criação e edição de evento.

**Props principais:**
- `mode: 'create' | 'edit'`
- `groupId: string`
- `eventId?: string` (obrigatório no modo `edit`)
- `defaultValues?: Partial<EventFormData>`

**Campos:**
- Título, tipo, data/hora, local (venue)
- Limite de participantes
- Descrição
- Cobrança automática (toggle + valor)
- Evento recorrente (toggle + padrão de recorrência)

---

### `event-tabs`

**Tipo:** Client Component

**Descrição:** Container de abas da página de evento. Renderiza as abas com base no status do evento.

**Abas disponíveis por status:**

| Aba | Disponível em |
|-----|---------------|
| Confirmação | Todos os status |
| Times | `confirmed`, `in_progress`, `completed` |
| Ao Vivo | `in_progress` |
| Avaliações/MVP | `completed` |
| Estatísticas | `completed` |

---

### `confirmation-tab`

**Tipo:** Client Component

**Descrição:** Exibe a lista de participantes confirmados, lista de espera e permite RSVP.

**Funcionalidades:**
- Botão de confirmar/cancelar presença
- Lista de confirmados com avatares
- Lista de espera com posição na fila
- Contador de vagas disponíveis
- Indicador de promoção da waitlist

---

### `live-match-tab`

**Tipo:** Client Component

**Descrição:** Painel de controle ao vivo do evento em andamento.

**Sub-componentes:**
- `match-scoreboard` — placar dos times em tempo real
- `match-controls` — botões de início/fim de partida
- `match-timeline` — linha do tempo de ações registradas
- Botões de registro de ação (gol, assistência, defesa, cartão amarelo, cartão vermelho, gol contra)

---

### `teams-tab`

**Tipo:** Client Component

**Descrição:** Exibe os times sorteados e permite reorganização manual.

**Sub-componentes:**
- `team-draw-button` — executa o sorteio via API
- `draw-config-modal` — configura parâmetros do sorteio
- `manual-team-manager` — drag-and-drop para mover jogadores entre times
- `admin-player-manager` — adiciona/remove jogadores dos times

---

### `ratings-tab`

**Tipo:** Client Component

**Descrição:** Interface de votação de MVP pós-evento.

**Sub-componentes:**
- `mvp-tiebreaker-card` — exibe rodada de desempate com votação entre candidatos empatados

**Fluxo:**
1. Cada membro vota em um jogador
2. Sistema contabiliza os votos
3. Se houver empate, cria uma rodada de desempate (`mvp_tiebreakers`)
4. Desempate é resolvido por nova votação

---

### `stats-tab`

**Tipo:** Client Component

**Descrição:** Estatísticas individuais do evento (gols, assistências, defesas, cartões por jogador).

---

### `draw-config-modal`

**Tipo:** Client Component

**Descrição:** Modal para configurar o algoritmo de sorteio de times antes de executar o draw.

**Opções configuráveis:**
- Número de times
- Considerar posições na distribuição
- Considerar ratings na distribuição
- Método de sorteio (balanceado, aleatório)

---

### `team-draw-button`

**Tipo:** Client Component

**Descrição:** Botão que dispara o sorteio de times via `POST /api/events/[eventId]/teams/draw`. Exibe loading durante o processamento.

---

### `admin-player-manager`

**Tipo:** Client Component

**Descrição:** Permite ao admin adicionar jogadores avulsos nos times (jogadores não-RSVPados ou convidados).

---

### `manual-team-manager`

**Tipo:** Client Component

**Descrição:** Interface de reorganização manual dos times após o sorteio automático. Suporta arraste de jogadores entre times.

---

### `match-scoreboard`

**Tipo:** Client Component

**Descrição:** Placar visual dos times com nome, cor e pontuação atual.

---

### `match-controls`

**Tipo:** Client Component

**Descrição:** Botões de controle da partida: iniciar, pausar, encerrar, registrar ação.

---

### `match-timeline`

**Tipo:** Client Component

**Descrição:** Linha do tempo cronológica de todas as ações registradas durante a partida.

---

### `mvp-tiebreaker-card`

**Tipo:** Client Component

**Descrição:** Card de votação de desempate exibido quando dois ou mais jogadores empatam na votação de MVP. Exibe os candidatos empatados e permite nova votação.

---

## Tabelas do Banco de Dados

### `events`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo organizador |
| `title` | VARCHAR | Título do evento |
| `event_type` | VARCHAR | `training`, `official_game`, `friendly` |
| `status` | VARCHAR | `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled` |
| `scheduled_at` | TIMESTAMP | Data e hora do evento |
| `venue_id` | UUID FK | Local do evento |
| `max_participants` | INTEGER | Limite de participantes |
| `description` | TEXT | Descrição opcional |
| `auto_charge` | BOOLEAN | Cobrar automaticamente no RSVP |
| `auto_charge_amount` | DECIMAL | Valor da cobrança automática |
| `is_recurring` | BOOLEAN | Se é um evento recorrente |
| `recurrence_pattern` | JSONB | Padrão de recorrência (daily/weekly/monthly) |
| `parent_event_id` | UUID FK | Evento pai (para eventos gerados por recorrência) |
| `created_by` | UUID FK | Admin que criou o evento |
| `created_at` | TIMESTAMP | Data de criação |

### `event_attendance`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Referência ao evento |
| `user_id` | UUID FK | Referência ao usuário |
| `status` | VARCHAR | `confirmed`, `waitlist`, `cancelled`, `present`, `absent` |
| `position` | INTEGER | Posição na lista de espera (nullable) |
| `auto_charge_applied` | BOOLEAN | Se a cobrança automática foi gerada |
| `rsvp_at` | TIMESTAMP | Data/hora do RSVP |

### `teams`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento ao qual pertence |
| `name` | VARCHAR | Nome do time |
| `color` | VARCHAR | Cor do time (hex) |
| `score` | INTEGER | Placar atual |

### `team_members`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `team_id` | UUID FK | Time ao qual pertence |
| `user_id` | UUID FK | Jogador |
| `position` | VARCHAR | Posição jogada |

### `event_actions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento |
| `team_id` | UUID FK | Time que realizou a ação |
| `user_id` | UUID FK | Jogador que realizou a ação |
| `action_type` | VARCHAR | `goal`, `assist`, `save`, `yellow_card`, `red_card`, `own_goal` |
| `minute` | INTEGER | Minuto da ação |
| `registered_at` | TIMESTAMP | Timestamp do registro |

### `votes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento |
| `voter_id` | UUID FK | Usuário que votou |
| `voted_for_id` | UUID FK | Jogador que recebeu o voto |
| `created_at` | TIMESTAMP | Data do voto |

### `mvp_tiebreakers`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento |
| `round` | INTEGER | Número da rodada de desempate |
| `candidates` | JSONB | Array de user_ids dos candidatos |
| `status` | VARCHAR | `open`, `closed` |
| `created_at` | TIMESTAMP | Data de criação |

### `mvp_tiebreaker_votes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `tiebreaker_id` | UUID FK | Rodada de desempate |
| `voter_id` | UUID FK | Votante |
| `voted_for_id` | UUID FK | Candidato escolhido |
| `created_at` | TIMESTAMP | Data do voto |

---

## Ciclo de Vida do Evento

```
              SCHEDULED
             (criado)
                 |
         [Admin confirma]
                 |
             CONFIRMED
         (vagas abertas, RSVP ativo)
                 |
          [Admin inicia]
                 |
            IN_PROGRESS
          (partida ao vivo)
                 |
        [Admin encerra]
               / \
          [OK]   [Cancelado]
            |         |
        COMPLETED  CANCELLED
    (votação MVP,  (evento
     estatísticas   abortado)
     disponíveis)
```

---

## Fluxo de RSVP com Waitlist

```
1. Usuário clica em "Confirmar Presença"
        |
2. POST /api/events/[eventId]/attendance
        |
3. Backend verifica vagas disponíveis:
   confirmed_count < max_participants?
        |
      [SIM]                    [NÃO]
        |                        |
4a. status = 'confirmed'   4b. status = 'waitlist'
    posição = null              posição = próxima
        |                        |
5. [auto_charge = true?]         |
        |                        |
   [SIM]                         |
        |                        |
6. Gera cobrança automática      |
   (INSERT em charges)           |
        |                        |
7. Notifica o usuário    7b. Notifica: "na fila"

Promoção da Waitlist:
- Quando um confirmado cancela (DELETE attendance)
- Backend busca o próximo da waitlist (menor posição)
- Atualiza status para 'confirmed'
- Notifica o usuário promovido
- Se auto_charge, gera cobrança para o promovido
```

---

## Algoritmo de Sorteio de Times

O endpoint `POST /api/events/[eventId]/teams/draw` executa o sorteio com base na configuração em `draw-config`.

**Parâmetros de entrada (DrawConfig):**
```typescript
{
  numberOfTeams: number,
  considerPositions: boolean,
  considerRatings: boolean,
  drawMethod: 'balanced' | 'random'
}
```

**Algoritmo balanceado (drawMethod = 'balanced'):**
1. Obtém todos os jogadores confirmados com ratings e posições
2. Ordena por rating decrescente
3. Distribui em snake-draft: jogador 1 → time 1, jogador 2 → time 2, ..., jogador N → time N, jogador N+1 → time N, ...
4. Se `considerPositions = true`: agrupa por posição antes de distribuir, garantindo que cada time tenha representantes de cada posição
5. Se `considerRatings = false`: embaralha aleatoriamente antes da distribuição
6. Insere o resultado em `teams` e `team_members`

---

## Ações ao Vivo

Tipos de ação disponíveis para registro durante partida em andamento:

| `action_type` | Descrição | Impacto no placar |
|---------------|-----------|------------------|
| `goal` | Gol marcado | +1 no time do jogador |
| `own_goal` | Gol contra | +1 no time adversário |
| `assist` | Assistência | Nenhum |
| `save` | Defesa (goleiro) | Nenhum |
| `yellow_card` | Cartão amarelo | Nenhum |
| `red_card` | Cartão vermelho | Nenhum |

---

## Fluxo de Votação MVP e Desempate

```
1. Evento encerra (status = completed)
        |
2. Votação abre automaticamente
   (período configurável, ex: 24h)
        |
3. Cada membro vota em 1 jogador
   POST /api/events/[eventId]/votes
        |
4. Após período de votação:
        |
5. Backend contabiliza votos
        |
   [Vencedor único?]        [Empate?]
        |                       |
6a. MVP definido           6b. Cria mvp_tiebreakers
    UPDATE event.mvp_id        com candidatos empatados
        |                       |
                           7. Nova rodada de votação
                              POST /api/events/[eventId]/
                                   mvp-tiebreakers/[id]/votes
                               |
                           8. Vencedor definido
```

---

## Cobrança Automática no RSVP

Quando o evento tem `auto_charge = true` e o usuário confirma presença:

1. O backend verifica `auto_charge_amount` do evento
2. Cria um registro em `charges` com:
   - `type: 'daily'`
   - `amount: auto_charge_amount`
   - `user_id: userId`
   - `group_id: groupId`
   - `event_id: eventId`
   - `status: 'pending'`
3. Marca `event_attendance.auto_charge_applied = true`
4. O jogador recebe notificação de cobrança pendente

---

## Eventos Recorrentes

**Campos relevantes em `events`:**
- `is_recurring: true`
- `event_type: 'training'`
- `recurrence_pattern: JSONB`

**Exemplo de `recurrence_pattern`:**
```json
{
  "frequency": "weekly",
  "interval": 1,
  "day_of_week": 3,
  "time": "20:00",
  "end_date": "2025-12-31",
  "max_occurrences": 52
}
```

**Padrões suportados:**

| Frequência | Campos obrigatórios |
|------------|---------------------|
| `daily` | `interval` |
| `weekly` | `interval`, `day_of_week` |
| `monthly` | `interval`, `day_of_month` |

**Geração de eventos:** A função SQL `generate_recurring_events()` processa os padrões e cria os eventos individuais com `parent_event_id` apontando para o evento-template.

---

## Tipos de Evento

| `event_type` | Descrição | Particularidades |
|--------------|-----------|-----------------|
| `training` | Treino | Suporta recorrência; associado ao módulo TRAININGS |
| `official_game` | Jogo oficial | Times obrigatórios; placar registrado no histórico |
| `friendly` | Amistoso | Times opcionais; cobrança automática opcional |

---

## Notas de Implementação

- Eventos com `status = 'in_progress'` têm dados de placar atualizados em tempo real via revalidação da página
- A deleção de um evento é soft delete: `is_active = false`; os dados de attendance, actions e votes são preservados
- O sorteio de times pode ser re-executado quantas vezes o admin quiser antes de iniciar o evento
- Times com placar são atualizados automaticamente ao registrar `goal` ou `own_goal` em `event_actions`
- A aba "Ao Vivo" só está disponível quando `status = 'in_progress'`
- Votação de MVP só abre quando `status = 'completed'`
