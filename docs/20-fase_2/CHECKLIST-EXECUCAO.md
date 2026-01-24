# ✅ CHECKLIST DE EXECUÇÃO - FASE 2

> **Status:** ⏸️ Aguardando início
> **Progresso:** 0/34 tarefas (0%)
> **Iniciado em:** -
> **Concluído em:** -

---

## 📊 PROGRESSO GERAL

```
┌─────────────────────────┬───────┬───────┬──────┐
│ Categoria               │ Done  │ Total │   %  │
├─────────────────────────┼───────┼───────┼──────┤
│ Backend - Recorrência   │  0/6  │    6  │   0% │
│ Backend - RSVP          │  0/4  │    4  │   0% │
│ Backend - Convocações   │  0/5  │    5  │   0% │
│ Frontend - Treinos      │  0/8  │    8  │   0% │
│ Frontend - RSVP         │  0/6  │    6  │   0% │
│ Jobs e Automação        │  0/2  │    2  │   0% │
│ Páginas                 │  0/2  │    2  │   0% │
│ Testes                  │  0/3  │    3  │   0% │
├─────────────────────────┼───────┼───────┼──────┤
│ TOTAL                   │  0/36 │   36  │   0% │
└─────────────────────────┴───────┴───────┴──────┘
```

---

## 🔧 BACKEND - TREINOS RECORRENTES (0/6)

### 1.1. Helpers de Recorrência
- [ ] Criar arquivo `src/lib/recurring-trainings.ts`
- [ ] Implementar `generateOccurrences()`
- [ ] Implementar `createEventsFromRecurring()`
- [ ] Implementar `matchesPattern()`
- [ ] Implementar `getNextOccurrence()`
- [ ] Implementar `validatePattern()`
- [ ] Implementar `getGroupRecurringTrainings()`
- [ ] Adicionar tipos TypeScript
- [ ] Testes unitários básicos

**Status:** ⏸️ Não iniciado

---

### 1.2. API - Criar Treino Recorrente
- [ ] Criar schema Zod de validação
- [ ] Criar arquivo `src/app/api/recurring-trainings/route.ts`
- [ ] Implementar POST handler
- [ ] Validar permissões (admin only)
- [ ] Criar recurring_training no banco
- [ ] Gerar eventos para próximos 30 dias
- [ ] Retornar treino + contagem
- [ ] Error handling completo
- [ ] Testar com diferentes padrões

**Status:** ⏸️ Não iniciado

---

### 1.3. API - Listar Treinos Recorrentes
- [ ] Implementar GET handler em `route.ts`
- [ ] Filtrar por groupId
- [ ] Filtrar por modalityId (opcional)
- [ ] Calcular próxima ocorrência
- [ ] Contar eventos futuros
- [ ] Ordenar por nextOccurrence
- [ ] Incluir dados da modalidade

**Status:** ⏸️ Não iniciado

---

### 1.4. API - Editar Treino Recorrente
- [ ] Criar arquivo `src/app/api/recurring-trainings/[id]/route.ts`
- [ ] Implementar PATCH handler
- [ ] Validar permissões (admin only)
- [ ] Atualizar recurring_training
- [ ] Lógica: "Este evento" vs "Todos futuros"
- [ ] Atualizar eventos se necessário
- [ ] Retornar confirmação

**Status:** ⏸️ Não iniciado

---

### 1.5. API - Excluir Treino Recorrente
- [ ] Implementar DELETE handler
- [ ] Validar permissões (admin only)
- [ ] Soft delete do recurring_training
- [ ] Lógica: "Este evento" vs "Toda série"
- [ ] Soft delete de eventos se necessário
- [ ] Retornar confirmação

**Status:** ⏸️ Não iniciado

---

### 1.6. Job Agendado - Gerar Eventos
- [ ] Instalar node-cron: `npm install node-cron @types/node-cron`
- [ ] Criar arquivo `src/jobs/generate-recurring-events.ts`
- [ ] Implementar função de geração diária
- [ ] Configurar cron para rodar às 2h
- [ ] Adicionar logging detalhado
- [ ] Iniciar job no app startup
- [ ] Testar geração manual

**Status:** ⏸️ Não iniciado

---

## 🔧 BACKEND - RSVP AVANÇADO (0/4)

### 2.1. API - Estatísticas de RSVP
- [ ] Criar `src/app/api/events/[id]/rsvp-stats/route.ts`
- [ ] Implementar GET handler
- [ ] Contar confirmações por status
- [ ] Calcular taxa de confirmação
- [ ] Listar confirmados com dados
- [ ] Ordenar por data de confirmação
- [ ] Incluir total de vagas

**Status:** ⏸️ Não iniciado

---

### 2.2. API - Lista de Confirmados
- [ ] Criar `src/app/api/events/[id]/confirmed/route.ts`
- [ ] Implementar GET handler
- [ ] JOIN com profiles
- [ ] Incluir posição se convocado
- [ ] Ordenar por confirmedAt
- [ ] Retornar lista completa

**Status:** ⏸️ Não iniciado

---

### 2.3. Helper - Taxa de Presença
- [ ] Criar arquivo `src/lib/attendance.ts`
- [ ] Implementar `calculateAttendanceRate()`
- [ ] Contar eventos confirmados
- [ ] Contar eventos totais
- [ ] Calcular taxa %
- [ ] Filtrar por modalidade (opcional)
- [ ] Retornar objeto com métricas

**Status:** ⏸️ Não iniciado

---

### 2.4. Helper - Histórico de Presença
- [ ] Implementar `getUserAttendanceHistory()` em `attendance.ts`
- [ ] Buscar últimos N eventos
- [ ] Incluir status de RSVP
- [ ] Marcar se compareceu (eventos passados)
- [ ] Ordenar por data decrescente
- [ ] Retornar array formatado

**Status:** ⏸️ Não iniciado

---

## 🔧 BACKEND - CONVOCAÇÕES (0/5)

### 3.1. Migration - Verificar modality_id
- [ ] Verificar migration `20260227000004_game_convocations.sql`
- [ ] Confirmar coluna modality_id existe
- [ ] Confirmar index criado
- [ ] Aplicar se necessário

**Status:** ⏸️ Não iniciado

---

### 3.2. API - Criar Convocação
- [ ] Criar `src/app/api/events/[id]/convocations/route.ts`
- [ ] Implementar POST handler
- [ ] Validar permissões (admin only)
- [ ] Buscar atletas da modalidade
- [ ] Filtrar por posições/rating (opcional)
- [ ] Criar convocações em lote
- [ ] Enviar notificações (placeholder)
- [ ] Retornar lista de convocados

**Status:** ⏸️ Não iniciado

---

### 3.3. API - Listar Convocações
- [ ] Implementar GET handler em `route.ts`
- [ ] JOIN com profiles
- [ ] JOIN com event_attendance para RSVP
- [ ] Incluir dados da modalidade
- [ ] Retornar lista completa
- [ ] Ordenar por nome

**Status:** ⏸️ Não iniciado

---

### 3.4. Helper - Atletas da Modalidade
- [ ] Adicionar função em `src/lib/modalities.ts`
- [ ] Implementar `getModalityAthletesForEvent()`
- [ ] Filtrar por posições (opcional)
- [ ] Filtrar por rating mínimo (opcional)
- [ ] Excluir IDs fornecidos (opcional)
- [ ] Ordenar por rating decrescente
- [ ] Retornar lista formatada

**Status:** ⏸️ Não iniciado

---

### 3.5. Notificações (Placeholder)
- [ ] Criar arquivo `src/lib/notifications.ts`
- [ ] Implementar `notifyConvocation()` placeholder
- [ ] Adicionar logging
- [ ] Adicionar TODO para implementação futura
- [ ] Documentar interface esperada

**Status:** ⏸️ Não iniciado

---

## 🎨 FRONTEND - COMPONENTES DE TREINOS (0/8)

### 4.1. TrainingMetricsCards
- [ ] Criar `src/components/trainings/training-metrics-cards.tsx`
- [ ] Buscar métricas via API
- [ ] 4 cards: Hoje, Esta Semana, Pendentes, Taxa
- [ ] Usar MetricCard do Design System
- [ ] Loading state
- [ ] Grid responsivo

**Status:** ⏸️ Não iniciado

---

### 4.2. RecurringBadge
- [ ] Criar `src/components/trainings/recurring-badge.tsx`
- [ ] Aceitar RecurrencePattern
- [ ] Formatar texto legível
- [ ] Usar Badge do shadcn
- [ ] Variações de tamanho (sm, md)
- [ ] Ícone 🔁

**Status:** ⏸️ Não iniciado

---

### 4.3. CreateTrainingModal
- [ ] Criar `src/components/trainings/create-training-modal.tsx`
- [ ] Tabs: "Único" e "Recorrente"
- [ ] Formulário de evento único
- [ ] Formulário de recorrente
- [ ] Integrar ModalitySelector
- [ ] Integrar RecurrenceSelector
- [ ] Validação com Zod
- [ ] Submit para API correta
- [ ] Toast de sucesso/erro

**Status:** ⏸️ Não iniciado

---

### 4.4. RecurrenceSelector
- [ ] Criar `src/components/trainings/recurrence-selector.tsx`
- [ ] Select de frequência (Semanal, Quinzenal, Mensal)
- [ ] Campos condicionais por frequência
- [ ] Select dia da semana
- [ ] Input dia do mês
- [ ] DatePicker data fim
- [ ] Validação de inputs
- [ ] Preview do padrão

**Status:** ⏸️ Não iniciado

---

### 4.5. TrainingFilters
- [ ] Criar `src/components/trainings/training-filters.tsx`
- [ ] Select de modalidade
- [ ] Date range picker
- [ ] Checkboxes de status RSVP
- [ ] Toggle "Apenas recorrentes"
- [ ] Botão "Limpar Filtros"
- [ ] Callback onChange

**Status:** ⏸️ Não iniciado

---

### 4.6. EditRecurringModal
- [ ] Criar `src/components/trainings/edit-recurring-modal.tsx`
- [ ] Radio: "Este evento" vs "Todos futuros"
- [ ] Formulário reutilizável
- [ ] Submit com escopo de edição
- [ ] Confirmação de sucesso
- [ ] Error handling

**Status:** ⏸️ Não iniciado

---

### 4.7. DeleteRecurringConfirm
- [ ] Criar `src/components/trainings/delete-recurring-confirm.tsx`
- [ ] AlertDialog do shadcn
- [ ] Opções: "Este evento" vs "Toda série"
- [ ] Texto explicativo de impacto
- [ ] Botão destrutivo
- [ ] Callback com escopo

**Status:** ⏸️ Não iniciado

---

### 4.8. ModalitySelector
- [ ] Criar `src/components/modalities/modality-selector.tsx`
- [ ] Select de modalidades
- [ ] Buscar modalidades do grupo
- [ ] Opção "Todas" se allowNone
- [ ] Loading state
- [ ] Empty state
- [ ] Controlled component

**Status:** ⏸️ Não iniciado

---

## 🎨 FRONTEND - COMPONENTES DE RSVP (0/6)

### 5.1. RSVPProgressBar
- [ ] Criar `src/components/rsvp/rsvp-progress-bar.tsx`
- [ ] Progress bar do shadcn
- [ ] Calcular % confirmados
- [ ] Texto "X/Y confirmados"
- [ ] Cores condicionais (verde/amarelo/vermelho)
- [ ] Tooltip com detalhes

**Status:** ⏸️ Não iniciado

---

### 5.2. ConfirmedAvatars
- [ ] Criar `src/components/rsvp/confirmed-avatars.tsx`
- [ ] Mostrar até 4 avatares
- [ ] Avatar do shadcn
- [ ] Badge "+N" se mais que 4
- [ ] Tooltip com nome ao hover
- [ ] Stack horizontal

**Status:** ⏸️ Não iniciado

---

### 5.3. RSVPStats
- [ ] Criar `src/components/rsvp/rsvp-stats.tsx`
- [ ] Card completo de estatísticas
- [ ] Integrar RSVPProgressBar
- [ ] Integrar ConfirmedAvatars
- [ ] Lista de confirmados expandível
- [ ] Badges de contadores
- [ ] Responsivo

**Status:** ⏸️ Não iniciado

---

### 5.4. AttendanceHistory
- [ ] Criar `src/components/athletes/attendance-history.tsx`
- [ ] Tabela do shadcn
- [ ] Colunas: Data, Evento, Status, Compareceu
- [ ] Ícones de status
- [ ] Cores condicionais
- [ ] Paginação se >10 registros
- [ ] Loading state

**Status:** ⏸️ Não iniciado

---

### 5.5. RSVPButton (Melhorado)
- [ ] Criar `src/components/rsvp/rsvp-button.tsx`
- [ ] Estados visuais por status
- [ ] Loading ao clicar
- [ ] Toast de feedback
- [ ] Dropdown para mudar status
- [ ] Ícones condicionais
- [ ] Disabled se evento passado

**Status:** ⏸️ Não iniciado

---

### 5.6. WaitingList (Placeholder)
- [ ] Criar `src/components/rsvp/waiting-list.tsx`
- [ ] UI de lista de espera
- [ ] Botão "Entrar na Lista"
- [ ] Mostrar posição na fila
- [ ] TODO: lógica de notificação
- [ ] Empty state

**Status:** ⏸️ Não iniciado

---

## 📄 PÁGINAS (0/2)

### 6.1. Atualizar Página de Treinos
- [ ] Abrir `src/app/(dashboard)/treinos/page.tsx`
- [ ] Adicionar TrainingMetricsCards no topo
- [ ] Adicionar TrainingFilters
- [ ] Mostrar RecurringBadge nos cards
- [ ] Botão "Novo Treino" abre CreateTrainingModal
- [ ] Aplicar filtros na listagem
- [ ] Loading states
- [ ] Empty states

**Status:** ⏸️ Não iniciado

---

### 6.2. Atualizar Página de Detalhes
- [ ] Abrir `src/app/(dashboard)/treinos/[id]/page.tsx`
- [ ] Adicionar RSVPStats expandida
- [ ] Seção de convocados (se houver)
- [ ] Botão "Convocar Atletas" (admin only)
- [ ] Modal de convocação
- [ ] Editar/Excluir recorrente (admin only)
- [ ] Badges de informação
- [ ] Responsivo

**Status:** ⏸️ Não iniciado

---

## 🧪 TESTES (0/3)

### Testes Unitários
- [ ] Criar `src/lib/__tests__/recurring-trainings.test.ts`
- [ ] Testes de generateOccurrences()
- [ ] Testes de matchesPattern()
- [ ] Testes de validatePattern()
- [ ] Testes de getNextOccurrence()
- [ ] Cobertura >80%

**Status:** ⏸️ Não iniciado

---

### Testes de Integração
- [ ] Criar `tests/api/recurring-trainings.test.ts`
- [ ] POST /api/recurring-trainings
- [ ] GET /api/recurring-trainings
- [ ] PATCH /api/recurring-trainings/[id]
- [ ] DELETE /api/recurring-trainings/[id]
- [ ] Verificar eventos gerados

**Status:** ⏸️ Não iniciado

---

### Testes E2E
- [ ] Criar `tests/e2e/recurring-trainings.spec.ts`
- [ ] Admin cria treino recorrente
- [ ] Verifica badge "RECORRENTE"
- [ ] Edita série completa
- [ ] Exclui um evento
- [ ] Verifica estatísticas RSVP

**Status:** ⏸️ Não iniciado

---

## 📋 VALIDAÇÃO FINAL

### Backend
- [ ] TypeScript compila sem erros
- [ ] Todas as APIs funcionando
- [ ] Job agendado rodando
- [ ] Validações Zod completas
- [ ] Error handling robusto
- [ ] Testes unitários passando

### Frontend
- [ ] Todos os componentes criados
- [ ] Páginas atualizadas
- [ ] Design System aplicado
- [ ] Responsivo
- [ ] Loading/Empty states
- [ ] Toast notifications

### Funcionalidades
- [ ] Treinos recorrentes criando eventos
- [ ] RSVP com estatísticas funcionando
- [ ] Convocações por modalidade
- [ ] Filtros aplicando corretamente
- [ ] Métricas calculando

---

## 📝 NOTAS E OBSERVAÇÕES

### Bloqueadores
*Nenhum bloqueador identificado no momento*

### Issues Encontradas
*Registrar aqui quaisquer bugs ou problemas durante desenvolvimento*

### Melhorias Futuras
- Notificações push reais (atualmente placeholder)
- Lista de espera automática
- Integração com calendário externo
- Analytics de presença avançado

---

## ⏱️ REGISTRO DE TEMPO

| Data | Início | Fim | Duração | Atividade | Tarefas Concluídas |
|------|--------|-----|---------|-----------|-------------------|
| - | - | - | - | - | - |

**Total:** 0 horas

---

**Última atualização:** 2026-01-24
**Status:** ⏸️ Aguardando início
**Progresso:** 0/36 tarefas (0%)
**Próximo:** Validar Fase 1 e iniciar desenvolvimento
