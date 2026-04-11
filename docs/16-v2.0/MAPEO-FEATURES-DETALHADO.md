# 🗺️ Mapeamento Detalhado de Features - HTML → ResenhApp

> **Análise linha por linha do sistema de referência**  
> **Baseado em:** `ATLETICAS-SISTEMA-COMPLETO-V1.html` (3122 linhas)

---

## 📋 ÍNDICE

1. [Análise por View](#1-análise-por-view)
2. [Componentes Identificados](#2-componentes-identificados)
3. [APIs Necessárias](#3-apis-necessárias)
4. [Tabelas de Database](#4-tabelas-de-database)
5. [Integrações Necessárias](#5-integrações-necessárias)

---

## 1. ANÁLISE POR VIEW

### 1.1 Dashboard (Linhas 908-1186)

#### Componentes Visuais:
- **Métricas Cards (4):**
  - Atletas Ativos (127) + tendência (+12%)
  - Treinos Esta Semana (8)
  - Frequência Média (72%) + tendência (+5%)
  - Caixa do Mês (R$ 3.450) + pendências (R$ 850)

- **Modalidades Ativas:**
  - Grid de 3 colunas
  - Card por modalidade com:
    - Ícone
    - Nome
    - Estatísticas: Atletas, Treinos/Semana, Frequência

- **Próximos Treinos:**
  - Lista vertical
  - Card por treino com:
    - Data (dia/mês)
    - Badge modalidade
    - Título
    - Detalhes: Horário, Local, Confirmados, Valor
    - Status badge (Confirmado/Pendente)

#### APIs Necessárias:
```typescript
GET /api/dashboard/metrics
  → {
      activeAthletes: { value: 127, trend: +12 },
      trainingsThisWeek: 8,
      averageFrequency: { value: 72, trend: +5 },
      monthlyCash: { value: 3450, pending: 850 }
    }

GET /api/modalities?group_id=xxx
  → Array<{ id, name, icon, athleteCount, trainingsPerWeek, frequency }>

GET /api/events/upcoming?group_id=xxx&limit=3
  → Array<Event com RSVP stats>
```

#### Componentes React:
- `MetricCard` - Card com valor, título, ícone, tendência
- `ModalityCard` - Card de modalidade com estatísticas
- `TrainingCard` - Card de treino com RSVP

---

### 1.2 Modalidades (Linhas 2470-2667)

#### Componentes Visuais:
- **Grid de Modalidades (2 colunas):**
  - Card expandido por modalidade
  - Header: Ícone + Nome + Botão Config
  - Posições Cadastradas: Badges com contadores
  - Estatísticas: Treinos/Semana, Frequência

#### Funcionalidades:
- Criar nova modalidade
- Editar modalidade (config)
- Configurar posições por modalidade
- Ver estatísticas

#### APIs Necessárias:
```typescript
GET /api/modalities?group_id=xxx
POST /api/modalities
PATCH /api/modalities/[id]
DELETE /api/modalities/[id]

GET /api/modalities/[id]/positions
POST /api/modalities/[id]/positions
DELETE /api/modalities/[id]/positions/[positionId]
```

#### Componentes React:
- `ModalityDetailCard` - Card expandido com todas as informações
- `PositionsConfig` - Configurar posições
- `ModalityForm` - Form criar/editar

---

### 1.3 Atletas (Linhas 1191-1341)

#### Componentes Visuais:
- **Filtros (4 colunas):**
  - Busca (nome/email)
  - Filtro modalidade (dropdown)
  - Filtro status (dropdown)
  - Ordenação (dropdown)

- **Tabela de Atletas:**
  - Colunas: Atleta, Modalidades, Status, Frequência, Ações
  - Avatar + Nome + Email
  - Badges de modalidades
  - Status badge (Ouro, Ativo, Treinador)
  - Frequência com cor (verde/amarelo)
  - Botão editar

#### Funcionalidades:
- Buscar atletas
- Filtrar por modalidade/status
- Ordenar
- Editar atleta
- Ver modalidades do atleta

#### APIs Necessárias:
```typescript
GET /api/athletes?group_id=xxx&modality=xxx&status=xxx&sort=xxx&search=xxx
  → Array<Athlete com modalidades e frequência>

GET /api/athletes/[id]
PATCH /api/athletes/[id]

GET /api/athletes/[id]/modalities
POST /api/athletes/[id]/modalities
DELETE /api/athletes/[id]/modalities/[modalityId]
```

#### Componentes React:
- `AthletesTable` - Tabela com filtros
- `AthleteRow` - Linha da tabela
- `AthleteFilters` - Componente de filtros
- `AthleteForm` - Form editar atleta

---

### 1.4 Treinos (Linhas 1346-1541)

#### Componentes Visuais:
- **Métricas (4 cards):**
  - Treinos Hoje (3)
  - Esta Semana (8)
  - Pendentes RSVP (2)
  - Taxa Confirmação (78%)

- **Lista de Treinos:**
  - Card expandido por treino
  - Header: Badge modalidade + Título + Botão ação
  - Detalhes: Data, Horário, Local, Valor
  - RSVP Progress:
    - Barra de progresso (77%)
    - Contador (23/30)
    - Lista de confirmados (avatares)
  - Badge "RECORRENTE" (se aplicável)

#### Funcionalidades:
- Criar treino (único ou recorrente)
- Ver RSVP detalhado
- Confirmar presença
- Filtrar por modalidade

#### APIs Necessárias:
```typescript
GET /api/events/trainings?group_id=xxx&modality=xxx
POST /api/events (com is_recurring e recurrence_pattern)

GET /api/events/[id]/rsvp-stats
  → { confirmed: 23, total: 30, percentage: 77, confirmedUsers: [...] }

POST /api/events/[id]/rsvp
  → { status: 'confirmed' | 'declined' | 'waitlist' }
```

#### Componentes React:
- `TrainingMetrics` - Cards de métricas
- `TrainingCard` - Card expandido com RSVP
- `RSVPProgress` - Barra de progresso + lista
- `TrainingForm` - Form criar treino (único/recorrente)

---

### 1.5 Financeiro (Linhas 1546-1736)

#### Componentes Visuais:
- **Resumo Financeiro (4 cards):**
  - Total Arrecadado (R$ 3.450) + tendência
  - Pendente (R$ 850) + contador atletas
  - Despesas do Mês (R$ 2.100)
  - Saldo Disponível (R$ 1.350)

- **Pagamentos por Treino:**
  - Card por treino com:
    - Badge modalidade + Nome + Data
    - Valor esperado vs. recebido
    - Progress (21/23 pagos - 91%)
    - Lista de atletas pendentes com botão "Cobrar"
    - Badge "100% PAGO" (se completo)

- **Histórico de Transações:**
  - Tabela: Data, Tipo, Descrição, Atleta/Fornecedor, Valor
  - Badges: RECEITA (verde), DESPESA (vermelho)

#### Funcionalidades:
- Ver resumo financeiro
- Ver pagamentos por treino
- Cobrar atletas pendentes
- Ver histórico
- Filtrar por período

#### APIs Necessárias:
```typescript
GET /api/financial/summary?group_id=xxx&period=xxx
  → { totalCollected, pending, expenses, available }

GET /api/financial/training-payments?group_id=xxx&period=xxx
  → Array<{ event, expected, received, percentage, pendingAthletes }>

POST /api/financial/remind-payment
  → Enviar notificação de cobrança

GET /api/financial/transactions?group_id=xxx&period=xxx
  → Array<Transaction>
```

#### Componentes React:
- `FinancialSummary` - Cards de resumo
- `TrainingPayments` - Lista de pagamentos por treino
- `PendingAthletes` - Lista de pendentes com ação
- `TransactionsTable` - Tabela de transações

---

### 1.6 Frequência (Linhas 1741-1982)

#### Componentes Visuais:
- **Métricas (4 cards):**
  - Taxa Geral (72%) + tendência
  - Check-ins Hoje (45)
  - Atletas Assíduos (23) - >90% frequência
  - Faltas Este Mês (87) + tendência

- **Ranking Top 10:**
  - Tabela: Posição, Atleta, Modalidade, Treinos, Frequência
  - Progress bar por atleta
  - Ícones de posição (🥇🥈🥉)

- **Check-in Treino Atual:**
  - QR Code visual (200x200px)
  - Botão "Gerar Novo QR"
  - Check-in Manual:
    - Busca de atleta
    - Lista de check-ins realizados com horário

#### Funcionalidades:
- Ver métricas de frequência
- Ver ranking
- Gerar QR Code para check-in
- Fazer check-in (QR ou manual)
- Filtrar por período

#### APIs Necessárias:
```typescript
GET /api/frequency/stats?group_id=xxx
  → { generalRate, checkinsToday, assiduousAthletes, absencesThisMonth }

GET /api/frequency/ranking?group_id=xxx&period=xxx&limit=10
  → Array<{ athlete, modality, trainings, frequency }>

POST /api/events/[id]/qrcode
  → { qrCodeData, expiresAt }

POST /api/checkin/qrcode
  → { qrCodeData, eventId } → Valida e faz check-in

POST /api/checkin/manual
  → { eventId, userId } → Check-in manual

GET /api/events/[id]/checkins
  → Array<{ user, checkedInAt, method }>
```

#### Componentes React:
- `FrequencyMetrics` - Cards de métricas
- `FrequencyRanking` - Tabela de ranking
- `QRCodeDisplay` - Exibir QR Code
- `ManualCheckin` - Check-in manual
- `CheckinList` - Lista de check-ins

---

### 1.7 Jogos Oficiais (Linhas 1987-2251)

#### Componentes Visuais:
- **Métricas (4 cards):**
  - Jogos Marcados (7)
  - Vitórias (12)
  - Taxa de Vitórias (65%) - 12V/3E/3D
  - Convocações Ativas (3)

- **Lista de Jogos:**
  - Card expandido por jogo:
    - Badge modalidade + Nome + Badge "OFICIAL"
    - Placar/Adversário (vs)
    - Detalhes: Data, Horário, Local, Fase
    - Convocação Oficial:
      - Status de respostas (Confirmados, Pendentes, Recusaram)
      - Posições convocadas com contadores
      - Botão "Editar Lista"

- **Competições Inscritas:**
  - Cards com histórico V/E/D

#### Funcionalidades:
- Criar jogo oficial
- Criar convocação
- Responder convocação
- Ver status de convocações
- Ver histórico de competições

#### APIs Necessárias:
```typescript
GET /api/events/official-games?group_id=xxx
POST /api/events (com type: 'official_game')

POST /api/events/[id]/convocation
  → { requiredPositions: { goalkeeper: 2, ... } }

GET /api/events/[id]/convocation
  → { stats: { confirmed, pending, declined }, positions: {...} }

POST /api/convocations/[id]/respond
  → { response: 'confirmed' | 'declined', position: '...' }

GET /api/competitions?group_id=xxx
  → Array<{ name, modality, wins, draws, losses }>
```

#### Componentes React:
- `OfficialGamesMetrics` - Cards de métricas
- `GameCard` - Card de jogo com convocação
- `ConvocationStats` - Estatísticas de convocação
- `ConvocationForm` - Criar convocação
- `CompetitionsList` - Lista de competições

---

### 1.8 Rankings (Linhas 2256-2465)

#### Componentes Visuais:
- **Top Rankings (3 cards):**
  - Top 5 Artilheiros
  - Top 5 Assistências
  - Top 5 MVP

- **Estatísticas Completas:**
  - Tabela: Atleta, Jogos, Gols, Assistências, MVP

#### Funcionalidades:
- Ver rankings por modalidade
- Filtrar por modalidade
- Ver estatísticas completas

#### APIs Necessárias:
```typescript
GET /api/rankings/artillery?group_id=xxx&modality=xxx&limit=5
GET /api/rankings/assists?group_id=xxx&modality=xxx&limit=5
GET /api/rankings/mvp?group_id=xxx&modality=xxx&limit=5

GET /api/rankings/complete?group_id=xxx&modality=xxx
  → Array<{ athlete, games, goals, assists, mvp }>
```

#### Componentes React:
- `RankingCard` - Card Top 5
- `CompleteStatsTable` - Tabela completa
- `ModalityFilter` - Filtro por modalidade

---

### 1.9 Tabelinha Tática (Linhas 2672-3017)

#### Componentes Visuais:
- **Seletores (4):**
  - Modalidade (Futsal, Vôlei, Basquete, Campo)
  - Formação (2-2, 1-2-1, 3-1)
  - Jogo/Treino (dropdown)
  - Botão "Resetar Campo"

- **Campo Tático:**
  - SVG do campo (Futsal: 800x450)
  - Linhas do campo (laterais, meio, áreas, círculo central)
  - Jogadores arrastáveis (Time A - verde, Time B - vermelho)
  - Ferramentas de desenho (4 botões)

- **Lista de Jogadores:**
  - Time A (verde)
  - Time B (vermelho)
  - Drag & drop para campo

- **Táticas Salvas:**
  - Grid de 3 colunas
  - Card por tática com botões (Ver, Carregar)

#### Funcionalidades:
- Selecionar modalidade (muda campo)
- Selecionar formação (posiciona jogadores)
- Arrastar jogadores no campo
- Desenhar jogadas
- Salvar tática
- Carregar tática salva

#### APIs Necessárias:
```typescript
GET /api/tactics?group_id=xxx
POST /api/tactics
  → { name, modalityId, formation, fieldData: {...} }

GET /api/tactics/[id]
DELETE /api/tactics/[id]
```

#### Componentes React:
- `TacticalField` - Campo SVG
- `PlayerMarker` - Marcador arrastável
- `PlayerList` - Lista de jogadores
- `FormationSelector` - Seletor de formação
- `DrawingTools` - Ferramentas de desenho
- `SavedTacticsList` - Lista de táticas salvas

---

## 2. COMPONENTES IDENTIFICADOS

### Componentes Base (Reutilizáveis):
1. `MetricCard` - Card com métrica, ícone, tendência
2. `StatusBadge` - Badge de status (Confirmado, Pendente, etc.)
3. `ProgressBar` - Barra de progresso
4. `Avatar` - Avatar circular com iniciais
5. `Modal` - Modal genérico
6. `Table` - Tabela com ordenação
7. `FilterBar` - Barra de filtros
8. `SearchBar` - Busca

### Componentes Específicos:
1. `ModalityCard` - Card de modalidade
2. `TrainingCard` - Card de treino com RSVP
3. `AthleteRow` - Linha de atleta na tabela
4. `FinancialSummary` - Resumo financeiro
5. `QRCodeDisplay` - Exibir QR Code
6. `TacticalField` - Campo tático SVG
7. `PlayerMarker` - Marcador de jogador arrastável

---

## 3. APIS NECESSÁRIAS

### Resumo por Módulo:

| Módulo | APIs | Prioridade |
|--------|------|------------|
| **Modalidades** | 6 APIs | 🔴 Alta |
| **Atletas** | 5 APIs | 🔴 Alta |
| **Treinos** | 4 APIs | 🟡 Média |
| **Financeiro** | 4 APIs | 🔴 Alta |
| **Frequência** | 6 APIs | 🟡 Média |
| **Jogos Oficiais** | 5 APIs | 🟡 Média |
| **Rankings** | 4 APIs | 🟢 Baixa |
| **Táticas** | 4 APIs | 🟢 Baixa |
| **Dashboard** | 3 APIs | 🔴 Alta |

**Total: 41 APIs**

---

## 4. TABELAS DE DATABASE

### Novas Tabelas:

1. `sport_modalities` - Modalidades esportivas
2. `athlete_modalities` - Atletas por modalidade (Many-to-Many)
3. `game_convocations` - Convocações para jogos
4. `convocation_responses` - Respostas de convocações
5. `checkin_qrcodes` - QR Codes de check-in
6. `checkins` - Registros de check-in
7. `saved_tactics` - Táticas salvas

### Alterações em Tabelas Existentes:

1. `events` - Adicionar:
   - `is_recurring` BOOLEAN
   - `recurrence_pattern` JSONB
   - `event_type` VARCHAR (training, official_game, friendly)

2. `charges` - Adicionar:
   - `event_id` UUID (FK para events)

---

## 5. INTEGRAÇÕES NECESSÁRIAS

### Bibliotecas Frontend:
- `qrcode.react` - Gerar QR Codes
- `html5-qrcode` - Ler QR Codes (mobile)
- `@dnd-kit/core` - Drag and drop
- `recharts` - Gráficos (opcional)
- `date-fns` - Manipulação de datas

### Serviços Externos:
- **QR Code:** Gerar QR Codes no backend (biblioteca `qrcode`)
- **Notificações:** Sistema de notificações (já planejado)
- **Pix:** Integração Pix (já planejado)

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Mapeamento Completo






