# 📋 FASE 2: Treinos Avançados - Documento de Preparação

> **Criado em:** 2026-01-24
> **Status:** 🟡 Pronto para execução
> **Duração estimada:** 2 semanas (ou 1 turno seguindo o ritmo)
> **Prioridade:** 🔴 Alta

---

## 🎯 OBJETIVO DA FASE

Implementar sistema avançado de treinos com:
- **Treinos Recorrentes** automáticos
- **RSVP Avançado** com estatísticas
- **Convocações por Modalidade**
- **Métricas detalhadas** de presença

---

## 📊 DEPENDÊNCIAS

### Migrations Já Existentes ✅
```sql
✅ 20260227000003_recurring_trainings.sql
✅ 20260227000004_game_convocations.sql
```

### Tabelas Necessárias
```sql
✅ recurring_trainings     - Configuração de treinos recorrentes
✅ game_convocations       - Convocações de atletas
✅ events                  - Eventos/treinos
✅ event_attendance        - Confirmações (RSVP)
✅ sport_modalities        - Modalidades (Fase 1)
✅ athlete_modalities      - Atletas por modalidade (Fase 1)
```

---

## 🗂️ ESTRUTURA DE IMPLEMENTAÇÃO

### 1. BACKEND - Treinos Recorrentes (6 tarefas)

#### 1.1. Helpers de Recorrência

**Arquivo:** `src/lib/recurring-trainings.ts`

```typescript
// Funções principais:

export interface RecurrencePattern {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number; // 0-6 (Domingo-Sábado)
  dayOfMonth?: number; // 1-31
  endDate?: Date;
  maxOccurrences?: number;
}

export interface RecurringTraining {
  id: string;
  groupId: string;
  modalityId?: string;
  title: string;
  description?: string;
  location?: string;
  duration: number;
  startTime: string; // HH:mm format
  recurrencePattern: RecurrencePattern;
  isActive: boolean;
}

// 1. Gerar próximas ocorrências
export function generateOccurrences(
  training: RecurringTraining,
  fromDate: Date,
  toDate: Date
): Date[]

// 2. Criar eventos a partir do treino recorrente
export async function createEventsFromRecurring(
  training: RecurringTraining,
  daysAhead: number = 30
): Promise<Event[]>

// 3. Verificar se data pertence ao padrão
export function matchesPattern(
  date: Date,
  pattern: RecurrencePattern
): boolean

// 4. Obter próxima ocorrência
export function getNextOccurrence(
  pattern: RecurrencePattern,
  fromDate: Date
): Date | null

// 5. Validar padrão de recorrência
export function validatePattern(
  pattern: RecurrencePattern
): { valid: boolean; error?: string }

// 6. Listar treinos recorrentes do grupo
export async function getGroupRecurringTrainings(
  groupId: string,
  modalityId?: string
): Promise<RecurringTraining[]>
```

**Checklist:**
- [ ] Criar arquivo `src/lib/recurring-trainings.ts`
- [ ] Implementar `generateOccurrences()`
- [ ] Implementar `createEventsFromRecurring()`
- [ ] Implementar `matchesPattern()`
- [ ] Implementar `getNextOccurrence()`
- [ ] Implementar `validatePattern()`
- [ ] Implementar `getGroupRecurringTrainings()`
- [ ] Adicionar testes unitários

---

#### 1.2. API - Criar Treino Recorrente

**Endpoint:** `POST /api/recurring-trainings`

**Arquivo:** `src/app/api/recurring-trainings/route.ts`

**Request Body:**
```json
{
  "groupId": "uuid",
  "modalityId": "uuid",  // Opcional
  "title": "Treino de Futebol",
  "description": "Treino semanal",
  "location": "Campo 1",
  "duration": 90,
  "startTime": "19:00",
  "recurrencePattern": {
    "frequency": "weekly",
    "dayOfWeek": 2,  // Terça-feira
    "endDate": "2026-12-31"
  }
}
```

**Response:**
```json
{
  "recurringTraining": {
    "id": "uuid",
    "groupId": "uuid",
    "title": "Treino de Futebol",
    ...
  },
  "generatedEvents": 12  // Eventos criados nos próximos 30 dias
}
```

**Validação (Zod):**
```typescript
const recurrencePatternSchema = z.object({
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  endDate: z.string().datetime().optional(),
  maxOccurrences: z.number().min(1).max(365).optional(),
});

const createRecurringTrainingSchema = z.object({
  groupId: z.string().uuid(),
  modalityId: z.string().uuid().optional(),
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  duration: z.number().min(15).max(480), // 15 min a 8 horas
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  recurrencePattern: recurrencePatternSchema,
});
```

**Checklist:**
- [ ] Criar schema Zod
- [ ] Implementar POST handler
- [ ] Validar permissões (admin only)
- [ ] Criar recurring_training no banco
- [ ] Gerar eventos para próximos 30 dias
- [ ] Retornar treino + contagem de eventos
- [ ] Adicionar error handling
- [ ] Testar com diferentes padrões

---

#### 1.3. API - Listar Treinos Recorrentes

**Endpoint:** `GET /api/recurring-trainings?groupId=uuid&modalityId=uuid`

**Arquivo:** `src/app/api/recurring-trainings/route.ts` (GET handler)

**Response:**
```json
{
  "recurringTrainings": [
    {
      "id": "uuid",
      "title": "Treino de Futebol",
      "modality": {
        "id": "uuid",
        "name": "Futebol",
        "icon": "⚽"
      },
      "recurrencePattern": { ... },
      "nextOccurrence": "2026-01-28T19:00:00Z",
      "upcomingEvents": 12
    }
  ]
}
```

**Checklist:**
- [ ] Implementar GET handler
- [ ] Filtrar por groupId e modalityId
- [ ] Incluir próxima ocorrência
- [ ] Contar eventos futuros
- [ ] Ordenar por nextOccurrence

---

#### 1.4. API - Editar Treino Recorrente

**Endpoint:** `PATCH /api/recurring-trainings/[id]`

**Arquivo:** `src/app/api/recurring-trainings/[id]/route.ts`

**Request Body:**
```json
{
  "title": "Novo título",
  "startTime": "20:00",
  "updateFutureEvents": true  // Se true, atualiza eventos futuros
}
```

**Checklist:**
- [ ] Criar arquivo de rota
- [ ] Validar permissões (admin only)
- [ ] Atualizar recurring_training
- [ ] Se updateFutureEvents: atualizar eventos futuros
- [ ] Retornar treino atualizado

---

#### 1.5. API - Excluir Treino Recorrente

**Endpoint:** `DELETE /api/recurring-trainings/[id]?deleteFutureEvents=true`

**Checklist:**
- [ ] Implementar DELETE handler
- [ ] Validar permissões (admin only)
- [ ] Soft delete do recurring_training
- [ ] Se deleteFutureEvents: soft delete de eventos futuros
- [ ] Retornar confirmação

---

#### 1.6. Job Agendado - Gerar Eventos

**Arquivo:** `src/jobs/generate-recurring-events.ts`

```typescript
import cron from 'node-cron';
import { createEventsFromRecurring } from '@/lib/recurring-trainings';

// Roda todo dia às 2h da manhã
export function startRecurringEventsJob() {
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Generating recurring events...');

    // Buscar todos os recurring_trainings ativos
    const trainings = await getAllActiveRecurringTrainings();

    // Para cada um, gerar eventos para os próximos 30 dias
    for (const training of trainings) {
      await createEventsFromRecurring(training, 30);
    }

    console.log('✅ Recurring events generated');
  });
}
```

**Checklist:**
- [ ] Instalar node-cron: `npm install node-cron @types/node-cron`
- [ ] Criar arquivo de job
- [ ] Implementar função de geração
- [ ] Iniciar job no servidor (app startup)
- [ ] Adicionar logging
- [ ] Testar manualmente

---

### 2. BACKEND - RSVP Avançado (4 tarefas)

#### 2.1. API - Estatísticas de RSVP

**Endpoint:** `GET /api/events/[id]/rsvp-stats`

**Arquivo:** `src/app/api/events/[id]/rsvp-stats/route.ts`

**Response:**
```json
{
  "eventId": "uuid",
  "totalSlots": 20,
  "confirmed": 15,
  "pending": 3,
  "declined": 2,
  "confirmationRate": 75,
  "confirmedList": [
    {
      "userId": "uuid",
      "userName": "João Silva",
      "userAvatar": "https://...",
      "confirmedAt": "2026-01-24T10:30:00Z"
    }
  ]
}
```

**Checklist:**
- [ ] Criar rota
- [ ] Contar confirmações por status
- [ ] Calcular taxa de confirmação
- [ ] Listar confirmados com dados do usuário
- [ ] Ordenar por data de confirmação

---

#### 2.2. API - Lista de Confirmados

**Endpoint:** `GET /api/events/[id]/confirmed`

**Arquivo:** `src/app/api/events/[id]/confirmed/route.ts`

**Response:**
```json
{
  "confirmed": [
    {
      "userId": "uuid",
      "name": "João Silva",
      "avatar": "https://...",
      "position": "Atacante",  // Se convocado com posição
      "confirmedAt": "2026-01-24T10:30:00Z"
    }
  ],
  "total": 15
}
```

**Checklist:**
- [ ] Criar rota
- [ ] Buscar event_attendance com status 'confirmed'
- [ ] JOIN com profiles para dados do usuário
- [ ] Incluir posição se existir
- [ ] Ordenar por confirmedAt

---

#### 2.3. Helper - Taxa de Presença

**Função:** `calculateAttendanceRate(userId, modalityId?)`

**Arquivo:** `src/lib/attendance.ts`

```typescript
export async function calculateAttendanceRate(
  userId: string,
  modalityId?: string
): Promise<{
  totalEvents: number;
  attended: number;
  rate: number;
}> {
  // Contar eventos confirmados vs eventos totais
  // Filtrar por modalidade se fornecida
  // Retornar taxa %
}
```

**Checklist:**
- [ ] Criar arquivo
- [ ] Implementar cálculo
- [ ] Filtrar por modalidade
- [ ] Retornar objeto com métricas

---

#### 2.4. Helper - Histórico de Presença

**Função:** `getUserAttendanceHistory(userId, limit?)`

**Arquivo:** `src/lib/attendance.ts`

```typescript
export async function getUserAttendanceHistory(
  userId: string,
  limit: number = 10
): Promise<Array<{
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  status: 'confirmed' | 'declined' | 'pending';
  attended?: boolean;  // Se evento já passou
}>>
```

**Checklist:**
- [ ] Implementar função
- [ ] Buscar últimos N eventos
- [ ] Incluir status de RSVP
- [ ] Marcar se compareceu (eventos passados)
- [ ] Ordenar por data (mais recente primeiro)

---

### 3. BACKEND - Convocações por Modalidade (5 tarefas)

#### 3.1. Migration - Adicionar modality_id

**Arquivo:** `supabase/migrations/20260227000004_game_convocations.sql` (já existe)

**Verificar se contém:**
```sql
ALTER TABLE game_convocations
ADD COLUMN IF NOT EXISTS modality_id UUID REFERENCES sport_modalities(id);

CREATE INDEX IF NOT EXISTS idx_game_convocations_modality
ON game_convocations(modality_id);
```

**Checklist:**
- [ ] Verificar migration
- [ ] Aplicar se necessário
- [ ] Validar index criado

---

#### 3.2. API - Criar Convocação

**Endpoint:** `POST /api/events/[id]/convocations`

**Arquivo:** `src/app/api/events/[id]/convocations/route.ts`

**Request Body:**
```json
{
  "modalityId": "uuid",
  "positions": ["Atacante", "Meia"],  // Opcional
  "minRating": 7,  // Opcional
  "athleteIds": ["uuid1", "uuid2"]  // Opcional: convocar específicos
}
```

**Response:**
```json
{
  "convocations": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "userId": "uuid",
      "userName": "João Silva",
      "position": "Atacante",
      "notified": true
    }
  ],
  "total": 15
}
```

**Checklist:**
- [ ] Criar rota
- [ ] Validar permissões (admin only)
- [ ] Se athleteIds não fornecido: buscar atletas da modalidade
- [ ] Filtrar por posições/rating se fornecido
- [ ] Criar convocações
- [ ] Enviar notificações (TODO: implementar depois)
- [ ] Retornar lista de convocados

---

#### 3.3. API - Listar Convocações

**Endpoint:** `GET /api/events/[id]/convocations`

**Response:**
```json
{
  "convocations": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "avatar": "https://..."
      },
      "position": "Atacante",
      "rating": 8,
      "rsvpStatus": "confirmed"
    }
  ]
}
```

**Checklist:**
- [ ] Implementar GET handler
- [ ] JOIN com profiles
- [ ] JOIN com event_attendance para RSVP
- [ ] Retornar lista completa

---

#### 3.4. Helper - Atletas da Modalidade

**Função:** `getModalityAthletesForEvent(modalityId, filters?)`

**Arquivo:** `src/lib/modalities.ts` (adicionar à existing)

```typescript
export async function getModalityAthletesForEvent(
  modalityId: string,
  filters?: {
    positions?: string[];
    minRating?: number;
    excludeUserIds?: string[];
  }
): Promise<Array<{
  userId: string;
  userName: string;
  rating: number;
  positions: string[];
}>>
```

**Checklist:**
- [ ] Implementar função
- [ ] Filtrar por posições
- [ ] Filtrar por rating mínimo
- [ ] Excluir IDs fornecidos
- [ ] Retornar lista ordenada por rating

---

#### 3.5. Notificações (Placeholder)

**Arquivo:** `src/lib/notifications.ts`

```typescript
export async function notifyConvocation(
  userId: string,
  eventId: string
): Promise<void> {
  // TODO: Implementar notificações
  // Por enquanto, apenas log
  console.log(`🔔 Notificar ${userId} sobre evento ${eventId}`);
}
```

**Checklist:**
- [ ] Criar arquivo
- [ ] Implementar função placeholder
- [ ] Adicionar TODO para implementação futura

---

### 4. FRONTEND - Componentes de Treinos (8 tarefas)

#### 4.1. TrainingMetricsCards

**Arquivo:** `src/components/trainings/training-metrics-cards.tsx`

**Props:**
```typescript
interface TrainingMetricsCardsProps {
  groupId: string;
}
```

**Métricas:**
- Treinos Hoje (count)
- Treinos Esta Semana (count)
- Pendentes de Confirmação (count)
- Taxa Média de Confirmação (%)

**Checklist:**
- [ ] Criar componente
- [ ] Buscar métricas da API
- [ ] Usar MetricCard do Design System
- [ ] Adicionar loading state
- [ ] Responsivo (grid 2x2 em desktop, stack em mobile)

---

#### 4.2. RecurringBadge

**Arquivo:** `src/components/trainings/recurring-badge.tsx`

**Props:**
```typescript
interface RecurringBadgeProps {
  pattern: RecurrencePattern;
  size?: 'sm' | 'md';
}
```

**Visual:**
```
🔁 Semanal - Terças
🔁 Quinzenal
🔁 Mensal
```

**Checklist:**
- [ ] Criar componente
- [ ] Formatar texto do padrão
- [ ] Usar Badge do shadcn
- [ ] Variações de tamanho

---

#### 4.3. CreateTrainingModal

**Arquivo:** `src/components/trainings/create-training-modal.tsx`

**Features:**
- Tabs: "Evento Único" | "Recorrente"
- Campos comuns: título, descrição, local, duração
- Campos de recorrente: padrão, data fim
- ModalitySelector integrado

**Checklist:**
- [ ] Criar modal com Tabs
- [ ] Formulário de evento único
- [ ] Formulário de recorrente
- [ ] Integrar ModalitySelector
- [ ] Integrar RecurrenceSelector
- [ ] Validar e submeter
- [ ] Toast de sucesso/erro

---

#### 4.4. RecurrenceSelector

**Arquivo:** `src/components/trainings/recurrence-selector.tsx`

**Props:**
```typescript
interface RecurrenceSelectorProps {
  value: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}
```

**UI:**
- Select: Frequência (Semanal, Quinzenal, Mensal)
- Se Semanal/Quinzenal: Select dia da semana
- Se Mensal: Input dia do mês (1-31)
- DatePicker: Data fim (opcional)

**Checklist:**
- [ ] Criar componente controlado
- [ ] Select de frequência
- [ ] Campos condicionais
- [ ] Validação de inputs
- [ ] Preview do padrão

---

#### 4.5. TrainingFilters

**Arquivo:** `src/components/trainings/training-filters.tsx`

**Filtros:**
- Modalidade (select)
- Data (range picker)
- Status (Confirmado, Pendente, Recusado)
- Recorrente (toggle)

**Checklist:**
- [ ] Criar componente
- [ ] Select de modalidade
- [ ] Date range picker
- [ ] Checkboxes de status
- [ ] Toggle recorrente
- [ ] Botão "Limpar Filtros"

---

#### 4.6. EditRecurringModal

**Arquivo:** `src/components/trainings/edit-recurring-modal.tsx`

**Features:**
- Radio: "Editar este evento" | "Editar todos os futuros"
- Formulário de edição
- Confirmação ao salvar

**Checklist:**
- [ ] Criar modal
- [ ] Radio de escopo de edição
- [ ] Formulário reutilizável
- [ ] Submit com escopo
- [ ] Toast de confirmação

---

#### 4.7. DeleteRecurringConfirm

**Arquivo:** `src/components/trainings/delete-recurring-confirm.tsx`

**AlertDialog:**
- "Excluir apenas este evento"
- "Excluir toda a série"
- Aviso de impacto

**Checklist:**
- [ ] Criar AlertDialog
- [ ] Opções de exclusão
- [ ] Texto explicativo
- [ ] Botão destrutivo
- [ ] Callback com escopo

---

#### 4.8. ModalitySelector

**Arquivo:** `src/components/modalities/modality-selector.tsx`

**Props:**
```typescript
interface ModalitySelectorProps {
  groupId: string;
  value?: string;
  onChange: (modalityId: string) => void;
  allowNone?: boolean;
}
```

**Checklist:**
- [ ] Criar Select
- [ ] Buscar modalidades do grupo
- [ ] Opção "Todas as modalidades" se allowNone
- [ ] Loading state
- [ ] Empty state

---

### 5. FRONTEND - Componentes de RSVP (6 tarefas)

#### 5.1. RSVPProgressBar

**Arquivo:** `src/components/rsvp/rsvp-progress-bar.tsx`

**Visual:**
```
[████████░░] 80% confirmados (16/20)
```

**Checklist:**
- [ ] Criar componente
- [ ] Progress bar do shadcn
- [ ] Calcular %
- [ ] Mostrar texto "X/Y confirmados"
- [ ] Cores: verde se >75%, amarelo se 50-75%, vermelho <50%

---

#### 5.2. ConfirmedAvatars

**Arquivo:** `src/components/rsvp/confirmed-avatars.tsx`

**Visual:**
```
[👤][👤][👤][👤] +12
```

**Checklist:**
- [ ] Criar componente
- [ ] Mostrar até 4 avatares
- [ ] Avatar do shadcn
- [ ] "+N" se mais que 4
- [ ] Tooltip com nome ao hover

---

#### 5.3. RSVPStats

**Arquivo:** `src/components/rsvp/rsvp-stats.tsx`

**Card com:**
- Progress bar
- Lista de confirmados
- Estatísticas (confirmados, pendentes, recusados)

**Checklist:**
- [ ] Criar Card
- [ ] Integrar RSVPProgressBar
- [ ] Listar confirmados com avatares
- [ ] Badges de estatísticas
- [ ] Responsivo

---

#### 5.4. AttendanceHistory

**Arquivo:** `src/components/athletes/attendance-history.tsx`

**Tabela:**
- Data
- Evento
- Status (ícone)
- Compareceu? (se passado)

**Checklist:**
- [ ] Criar componente
- [ ] Tabela do shadcn
- [ ] Ícones de status
- [ ] Cores condicionais
- [ ] Paginação se >10

---

#### 5.5. RSVPButton (Melhorado)

**Arquivo:** `src/components/rsvp/rsvp-button.tsx`

**Estados:**
- Não confirmado: "Confirmar Presença" (verde)
- Confirmado: "✓ Confirmado" (outline verde)
- Recusado: "Recusou" (outline vermelho)

**Checklist:**
- [ ] Criar componente
- [ ] Estados visuais
- [ ] Loading ao clicar
- [ ] Toast de feedback
- [ ] Dropdown para mudar status

---

#### 5.6. WaitingList (Placeholder)

**Arquivo:** `src/components/rsvp/waiting-list.tsx`

**Features:**
- Lista de espera se evento lotado
- Notificação automática se vaga abrir

**Checklist:**
- [ ] Criar componente básico
- [ ] UI de lista de espera
- [ ] Botão "Entrar na Lista"
- [ ] TODO: implementar lógica de notificação

---

### 6. PÁGINAS E INTEGRAÇÕES

#### 6.1. Atualizar Página de Treinos

**Arquivo:** `src/app/(dashboard)/treinos/page.tsx`

**Adicionar:**
- TrainingMetricsCards no topo
- TrainingFilters
- Badge "RECORRENTE" nos cards
- Botão "Novo Treino" abre CreateTrainingModal

**Checklist:**
- [ ] Adicionar métricas
- [ ] Adicionar filtros
- [ ] Mostrar badge recorrente
- [ ] Integrar modal de criação
- [ ] Aplicar filtros na listagem

---

#### 6.2. Atualizar Página de Detalhes do Treino

**Arquivo:** `src/app/(dashboard)/treinos/[id]/page.tsx`

**Adicionar:**
- RSVPStats expandida
- Lista de convocados (se houver)
- Botão "Convocar Atletas" (admin)

**Checklist:**
- [ ] Integrar RSVPStats
- [ ] Mostrar convocados
- [ ] Botão de convocação (admin only)
- [ ] Modal de convocação

---

## 🧪 TESTES

### Testes Unitários
```typescript
// src/lib/__tests__/recurring-trainings.test.ts

describe('generateOccurrences', () => {
  test('weekly pattern generates correct dates', () => {
    // Test implementation
  });

  test('biweekly pattern skips weeks correctly', () => {
    // Test implementation
  });

  test('monthly pattern handles month boundaries', () => {
    // Test implementation
  });
});
```

### Testes de Integração
```typescript
// tests/api/recurring-trainings.test.ts

describe('POST /api/recurring-trainings', () => {
  test('creates recurring training and generates events', async () => {
    // Test implementation
  });
});
```

### Testes E2E
```typescript
// tests/e2e/recurring-trainings.spec.ts

test('admin can create recurring training', async ({ page }) => {
  // Navigate, fill form, submit, verify
});
```

---

## ✅ CHECKLIST GERAL DA FASE 2

### Backend
- [ ] 6 tarefas de Treinos Recorrentes
- [ ] 4 tarefas de RSVP Avançado
- [ ] 5 tarefas de Convocações
- [ ] Job agendado configurado
- [ ] Testes unitários passando

### Frontend
- [ ] 8 componentes de Treinos
- [ ] 6 componentes de RSVP
- [ ] 2 páginas atualizadas
- [ ] Testes E2E passando

### Qualidade
- [ ] TypeScript sem erros
- [ ] Validações Zod completas
- [ ] Error handling robusto
- [ ] Design System aplicado
- [ ] Responsivo

---

## 📊 ESTIMATIVA DE TEMPO

### Opção A: 2 Semanas (Tradicional)
- **Backend:** 5 dias (15 tarefas)
- **Frontend:** 5 dias (14 tarefas + páginas)
- **Testes:** 1-2 dias
- **Total:** 10-12 dias úteis

### Opção B: 1 Turno (Acelerado - baseado no ritmo atual)
- **Backend:** 3-4 horas
- **Frontend:** 3-4 horas
- **Jobs:** 1 hora
- **Testes:** 1 hora
- **Total:** 8-10 horas (1 turno completo)

---

**Última atualização:** 2026-01-24
**Status:** 🟡 Pronto para execução
**Próximo passo:** Validar Fase 1 e iniciar Fase 2
