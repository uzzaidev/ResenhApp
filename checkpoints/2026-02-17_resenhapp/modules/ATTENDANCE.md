# Módulo: ATTENDANCE (Frequência)

## Visão Geral

O módulo ATTENDANCE (Frequência) fornece uma visão consolidada da presença dos atletas de um grupo nos eventos finalizados. Calcula taxas de frequência individuais com base nos últimos 10 eventos concluídos e classifica cada atleta com badges de desempenho. A página é alimentada pelo campo `playerFrequency` do endpoint de estatísticas do grupo.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/(dashboard)/frequencia` | Página de frequência do grupo ativo com ranking de presença por atleta |

---

## API Endpoints

### Frequência (via endpoint de stats do grupo)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/stats` | Retorna estatísticas do grupo, incluindo o campo `playerFrequency` |

O módulo ATTENDANCE não possui endpoints próprios — consome o campo `playerFrequency` do endpoint de stats compartilhado com o módulo RANKINGS.

**Exemplo de resposta do campo `playerFrequency`:**
```json
{
  "playerFrequency": [
    {
      "userId": "uuid",
      "name": "João Silva",
      "avatarUrl": "https://...",
      "presences": 9,
      "absences": 1,
      "attendanceRate": 90,
      "badge": "Excelente",
      "last10Events": [
        { "eventId": "uuid", "date": "2025-02-10", "status": "present" },
        { "eventId": "uuid", "date": "2025-02-03", "status": "present" },
        { "eventId": "uuid", "date": "2025-01-27", "status": "absent" }
      ]
    }
  ],
  "recentEvents": [
    {
      "eventId": "uuid",
      "title": "Pelada de Terça",
      "date": "2025-02-10",
      "totalPresent": 10,
      "totalMembers": 14,
      "eventAttendanceRate": 71
    }
  ]
}
```

---

## Tabelas do Banco de Dados

### `event_attendance`

Tabela principal que registra a presença de cada atleta em cada evento.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK | Evento |
| `user_id` | UUID FK | Atleta |
| `status` | VARCHAR | `confirmed`, `waitlist`, `cancelled`, `present`, `absent` |
| `position` | INTEGER | Posição na fila de espera (nullable) |
| `auto_charge_applied` | BOOLEAN | Se a cobrança automática foi gerada |
| `rsvp_at` | TIMESTAMP | Data/hora do RSVP |

**Status relevantes para frequência:**

| Status | Significado |
|--------|-------------|
| `present` | Atleta compareceu ao evento |
| `absent` | Atleta não compareceu (RSVP confirmado mas ausente) |
| `confirmed` | RSVP confirmado, evento ainda não realizado |
| `waitlist` | Na fila de espera |
| `cancelled` | Cancelou o RSVP |

### `events`

| Coluna | Relevância para ATTENDANCE |
|--------|---------------------------|
| `id` | Referência nos registros de attendance |
| `status` | Apenas eventos `completed` contam para frequência |
| `scheduled_at` | Data do evento (para os últimos 10) |
| `group_id` | Filtra eventos do grupo correto |

---

## Cálculo de Frequência

### Base de Cálculo

O cálculo usa os **últimos 10 eventos finalizados** (`status = 'completed'`) do grupo:

```sql
SELECT id, scheduled_at, title
FROM events
WHERE group_id = :groupId
  AND status = 'completed'
ORDER BY scheduled_at DESC
LIMIT 10
```

### Taxa de Presença Individual

Para cada atleta membro ativo do grupo:

```
attendance_rate = (presences / last_10_events_count) × 100

onde:
  presences = COUNT(event_attendance WHERE user_id = :userId AND status = 'present')
  last_10_events_count = MIN(10, total_completed_events)
```

**Exemplos:**

| Atleta | Presenças | Eventos | Taxa |
|--------|-----------|---------|------|
| João | 9 | 10 | 90% |
| Maria | 7 | 10 | 70% |
| Pedro | 5 | 8* | 62.5% |
| Ana | 10 | 10 | 100% |

*Pedro entrou no grupo recentemente — apenas 8 eventos disponíveis para ele.

### Cálculo por Evento

Para cada evento na lista:
```
event_attendance_rate = (present_count / member_count) × 100
```

---

## Sistema de Badges

Cada atleta recebe um badge baseado na sua taxa de frequência:

| Badge | Critério | Cor |
|-------|----------|-----|
| Excelente | `attendanceRate >= 90%` | Verde (`#00FF87` — UzzAI Mint) |
| Bom | `70% <= attendanceRate < 90%` | Amarelo/Laranja |
| Atenção | `attendanceRate < 70%` | Vermelho |

**Exemplo de exibição:**
```
[Avatar] João Silva          [Excelente] 90%
         ████████████░░  9/10 jogos
         [■][■][■][■][■][■][■][■][■][□]  ← últimos 10 eventos

[Avatar] Maria Santos        [Bom] 70%
         ████████░░░░░░  7/10 jogos

[Avatar] Pedro Costa         [Atenção] 50%
         ██████░░░░░░░░  5/10 jogos
```

---

## Componentes de UI

### Componente principal da página

**Tipo:** Client Component (ou Server Component com revalidação)

**Descrição:** A página de frequência é composta de duas seções principais:

**Seção 1: Ranking de Frequência dos Atletas**
- Tabela ou lista de atletas ordenada por `attendanceRate` (decrescente)
- Cada linha exibe:
  - Avatar e nome do atleta
  - Badge de frequência (Excelente / Bom / Atenção)
  - Barra de progresso proporcional à taxa
  - Texto "X de Y jogos"
  - Mini-calendário dos últimos 10 eventos (presença/ausência por ícone)

**Seção 2: Eventos Recentes**
- Lista dos últimos 10 eventos finalizados
- Para cada evento:
  - Título e data
  - Taxa de comparecimento do grupo naquele evento
  - Barra de progresso
  - "X de Y membros"

---

## Métricas Exibidas na Página

| Métrica | Descrição |
|---------|-----------|
| Atletas com 90%+ de frequência | Contagem de atletas com badge "Excelente" |
| Taxa média do grupo | Média de `attendanceRate` de todos os atletas |
| Evento com maior presença | Evento dos últimos 10 com maior `event_attendance_rate` |
| Atletas em alerta | Contagem de atletas com badge "Atenção" (<70%) |

---

## Progresso por Atleta

Cada atleta tem uma barra de progresso que representa visualmente sua taxa de presença:

```
Excelente (90%):  [█████████░]  90%
Bom (75%):        [███████░░░]  75%
Atenção (50%):    [█████░░░░░]  50%
```

A cor da barra segue o mesmo critério dos badges:
- Verde: >= 90%
- Amarelo: 70-89%
- Vermelho: < 70%

---

## Lista de Eventos Recentes

A seção de eventos recentes exibe os últimos 10 eventos finalizados com a taxa de comparecimento geral do grupo:

```
Pelada de Terça — 10 fev 2025
Taxa: 71% (10/14 membros)  [███████░░░]

Pelada de Terça — 03 fev 2025
Taxa: 85% (12/14 membros)  [████████░░]

Pelada de Terça — 27 jan 2025
Taxa: 57% (8/14 membros)   [██████░░░░]
```

---

## Notas de Implementação

- O módulo ATTENDANCE não possui tabela própria — consome exclusivamente `event_attendance` e `events`
- A lógica de cálculo está encapsulada no endpoint `/api/groups/[groupId]/stats`, campo `playerFrequency`
- Atletas com status `cancelled` ou `waitlist` NÃO são contados como presentes nem ausentes no cálculo
- Apenas membros ativos do grupo (`group_members.status = 'active'`) aparecem no ranking de frequência
- Se o grupo tiver menos de 10 eventos finalizados, o cálculo usa o total disponível como denominador
- A página não requer acesso de admin — todos os membros podem ver a frequência uns dos outros
- Para evitar carregamentos lentos em grupos com muitos membros, considerar paginação ou virtualização da lista em versões futuras
