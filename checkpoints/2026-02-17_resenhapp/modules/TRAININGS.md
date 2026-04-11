# Módulo: TRAININGS (Treinos)

## Visão Geral

O módulo TRAININGS gerencia os treinos recorrentes dos grupos. É construído sobre o módulo EVENTS (usando `events` com `is_recurring = true` e `event_type = 'training'`), acrescentando a lógica de recorrência, geração automática de eventos e consumo de créditos. Criar um treino recorrente consome 5 créditos do grupo.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/(dashboard)/treinos` | Lista de treinos recorrentes e próximas sessões do grupo ativo |

---

## API Endpoints

### Treinos Recorrentes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/recurring-trainings` | Lista os treinos recorrentes do grupo ativo |
| `POST` | `/api/recurring-trainings` | Cria um novo treino recorrente (consome 5 créditos) |
| `GET` | `/api/recurring-trainings/[trainingId]` | Obtém detalhes de um treino recorrente |
| `PATCH` | `/api/recurring-trainings/[trainingId]` | Atualiza configurações do treino recorrente |
| `DELETE` | `/api/recurring-trainings/[trainingId]` | Cancela o treino recorrente |

**Request body do POST /api/recurring-trainings:**
```json
{
  "title": "Treino de Futsal - Quartas",
  "modalityId": "uuid",
  "venueId": "uuid",
  "maxParticipants": 14,
  "autoCharge": false,
  "autoChargeAmount": null,
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "dayOfWeek": 3,
    "time": "20:00",
    "endDate": "2025-12-31"
  }
}
```

**Resposta de sucesso (201 Created):**
```json
{
  "trainingId": "uuid",
  "creditsConsumed": 5,
  "remainingCredits": 40,
  "nextOccurrences": [
    "2025-03-05T20:00:00Z",
    "2025-03-12T20:00:00Z",
    "2025-03-19T20:00:00Z"
  ]
}
```

---

## Middleware de Créditos

O endpoint `POST /api/recurring-trainings` é protegido pelo middleware `withCreditsCheck`:

```typescript
export const POST = withCreditsCheck(
  createRecurringTrainingHandler,
  {
    feature: 'recurring_training',
    autoConsume: true,
    requireAdmin: true,
  }
)
```

**Comportamento:**
1. Verifica se o usuário é admin do grupo ativo
2. Verifica se o grupo tem saldo >= 5 créditos
3. Se sim: consome 5 créditos atomicamente (via `consume_credits` SQL)
4. Executa a criação do treino
5. Se a criação falhar: reverte o consumo de créditos

**Resposta quando saldo insuficiente:**
```json
{
  "error": "Insufficient credits",
  "required": 5,
  "current": 3,
  "feature": "recurring_training"
}
```
Status: `402 Payment Required`

---

## Componentes

### `training-card`

**Tipo:** Client Component

**Descrição:** Card que representa um treino recorrente na listagem, exibindo as próximas sessões, taxa de participação e ações rápidas.

**Props principais:**
- `training: RecurringTraining`
- `upcomingSessions: EventSession[]` — próximas 3 sessões
- `avgParticipation: number` — média de participação (%)
- `onEdit: (trainingId: string) => void`
- `onCancel: (trainingId: string) => void`
- `isAdmin: boolean`

**Exibição:**
- Nome do treino e modalidade
- Recorrência descrita (ex: "Toda quarta-feira às 20h")
- Próximas 3 datas
- Barra de participação média
- Badges de status (ativo / pausado / encerrado)
- Botões de editar/cancelar (admin)

---

### `confirmed-avatars`

**Tipo:** Client Component

**Descrição:** Cluster de avatares dos participantes confirmados em uma sessão de treino, com contador de excedentes.

**Props principais:**
- `confirmedUsers: User[]`
- `maxDisplay?: number` — default: 5
- `total: number` — total de confirmados para o contador

**Exibição:**
- Até `maxDisplay` avatares sobrepostos
- Badge "+N" para os excedentes
- Tooltip com lista completa ao hover

---

### `rsvp-progress`

**Tipo:** Client Component

**Descrição:** Barra de progresso visual que indica o preenchimento de vagas de um evento de treino.

**Props principais:**
- `confirmed: number`
- `maxParticipants: number`
- `waitlist: number`

**Exibição:**
- Barra colorida: verde (0-75%), amarela (75-90%), vermelha (90-100%)
- Texto "X / Y confirmados"
- Badge de fila de espera quando waitlist > 0

---

## Tabelas do Banco de Dados

### `events` (base dos treinos recorrentes)

Treinos recorrentes são eventos com campos específicos:

| Coluna | Valor para Treinos |
|--------|-------------------|
| `event_type` | `'training'` |
| `is_recurring` | `true` |
| `recurrence_pattern` | JSONB com padrão de recorrência |
| `parent_event_id` | `null` (evento-template) ou UUID (sessão gerada) |

**Estrutura do `recurrence_pattern` JSONB:**
```json
{
  "frequency": "weekly",
  "interval": 1,
  "dayOfWeek": 3,
  "time": "20:00",
  "endDate": "2025-12-31",
  "maxOccurrences": 52,
  "timezone": "America/Sao_Paulo"
}
```

### `recurring_trainings`

Tabela auxiliar que armazena metadados específicos dos treinos recorrentes, complementando a tabela `events`.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `event_id` | UUID FK UNIQUE | Evento-template base |
| `group_id` | UUID FK | Grupo organizador |
| `modality_id` | UUID FK | Modalidade do treino |
| `status` | VARCHAR | `active`, `paused`, `cancelled` |
| `credits_consumed` | INTEGER | Créditos gastos na criação (sempre 5) |
| `total_sessions_generated` | INTEGER | Contador de sessões geradas |
| `last_generated_at` | TIMESTAMP | Última vez que sessões foram geradas |
| `created_by` | UUID FK | Admin que criou |
| `created_at` | TIMESTAMP | Data de criação |

---

## Padrões de Recorrência

| Frequência | Campos obrigatórios | Exemplo |
|------------|---------------------|---------|
| `daily` | `interval` | A cada 2 dias |
| `weekly` | `interval`, `dayOfWeek` (0=Dom, 6=Sáb) | Toda quarta-feira |
| `monthly` | `interval`, `dayOfMonth` ou `dayOfWeek+weekOfMonth` | Todo 1º sábado do mês |

**Exemplos de `recurrence_pattern`:**

Treino semanal toda quarta:
```json
{
  "frequency": "weekly",
  "interval": 1,
  "dayOfWeek": 3,
  "time": "20:00"
}
```

Treino quinzenal (a cada 2 semanas):
```json
{
  "frequency": "weekly",
  "interval": 2,
  "dayOfWeek": 6,
  "time": "08:00"
}
```

Treino mensal no 1º domingo:
```json
{
  "frequency": "monthly",
  "interval": 1,
  "dayOfWeek": 0,
  "weekOfMonth": 1,
  "time": "09:00"
}
```

---

## Função SQL: `generate_recurring_events()`

Função SQL responsável por gerar as sessões individuais de um treino recorrente.

**Assinatura:**
```sql
CREATE OR REPLACE FUNCTION generate_recurring_events(
  p_template_event_id UUID,
  p_generate_until TIMESTAMP
) RETURNS INTEGER
```

**Lógica:**
1. Busca o evento-template com `is_recurring = true`
2. Lê o `recurrence_pattern` JSONB
3. Calcula as datas das próximas sessões até `p_generate_until`
4. Para cada data: INSERT em `events` com `parent_event_id = p_template_event_id`
5. As sessões geradas têm `is_recurring = false` (são eventos individuais)
6. Retorna o número de sessões geradas

**Quando é chamada:**
- Ao criar um treino recorrente (gera próximas 4 semanas)
- Via cron periódico para gerar sessões futuras antecipadamente
- Manualmente pelo admin via endpoint (não exposto na UI)

---

## Métricas da Página de Treinos

A página `/(dashboard)/treinos` exibe as seguintes métricas no topo:

| Métrica | Cálculo | Período |
|---------|---------|---------|
| Total de treinos | Contagem de eventos training | Últimos 30 dias |
| Próximos treinos | Contagem de sessões futuras | Próximos 30 dias |
| Média de participação | Média de `confirmed/max_participants` por sessão | Últimas 8 sessões |
| Treinos esta semana | Contagem de sessões na semana corrente | Semana atual |

---

## Custo de Créditos

| Operação | Custo | Observação |
|----------|-------|-----------|
| Criar treino recorrente | 5 créditos | Por treino criado (não por sessão) |
| Editar treino recorrente | 0 créditos | Gratuito |
| Cancelar treino recorrente | 0 créditos | Gratuito |
| Sessões individuais geradas | 0 créditos | A geração automática não tem custo adicional |

---

## Fluxo de Criação de Treino Recorrente

```
1. Admin acessa /(dashboard)/treinos
        |
2. Clica em "Novo Treino Recorrente"
        |
3. Preenche o formulário:
   - Título, modalidade, local
   - Limite de participantes
   - Padrão de recorrência
   - Cobrança automática (opcional)
        |
4. POST /api/recurring-trainings
        |
5. Middleware verifica:
   a. Usuário é admin? [403 se não]
   b. Saldo >= 5 créditos? [402 se não]
        |
6. consume_credits(groupId, 'recurring_training', 5)
        |
7. INSERT em events (evento-template)
   is_recurring = true
   event_type = 'training'
        |
8. INSERT em recurring_trainings
        |
9. Chama generate_recurring_events()
   → Gera próximas 4 semanas de sessões
        |
10. Retorna trainingId + próximas datas
        |
11. Frontend atualiza a lista de treinos
    Exibe "5 créditos consumidos. Saldo: X"
```

---

## Notas de Implementação

- Treinos recorrentes e eventos regulares coexistem na tabela `events`; o campo `is_recurring = true` e `event_type = 'training'` identificam os templates
- Sessões individuais geradas são eventos normais com `parent_event_id` preenchido e `is_recurring = false`
- Ao cancelar um treino recorrente, todas as sessões futuras com `parent_event_id` correspondente são canceladas em cascata
- Sessões passadas (já realizadas) são preservadas mesmo após cancelamento do treino
- O módulo CREDITS garante que o consumo de créditos é atômico; se a criação do evento falhar após o consumo, os créditos são revertidos
- A página de treinos exibe tanto os eventos-template quanto as sessões próximas geradas, mesclados em uma visualização unificada
