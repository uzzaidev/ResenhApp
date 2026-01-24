# 📂 FASE 2: Treinos Avançados

> **Status:** 🟡 Pronto para iniciar
> **Duração estimada:** 2 semanas (ou 1 turno seguindo o ritmo atual)
> **Prioridade:** 🔴 Alta

---

## 📋 Visão Geral

Esta pasta contém toda a documentação da **Fase 2** do projeto ResenhApp, focada em **Treinos Avançados** com treinos recorrentes, RSVP melhorado e métricas detalhadas.

---

## 📁 Estrutura de Arquivos

### Documentos Principais

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| **[FASE-02-PREPARACAO.md](./FASE-02-PREPARACAO.md)** | Documento completo de preparação com todas as tarefas | 📋 Completo |
| **[CHECKLIST-EXECUCAO.md](./CHECKLIST-EXECUCAO.md)** | Checklist de acompanhamento do progresso | ⏳ Pronto para uso |
| **[GUIA-TESTES-COMPLETO.md](./GUIA-TESTES-COMPLETO.md)** | Guia com testes de database, API e frontend | 🧪 Pronto |
| **README.md** | Este arquivo (navegação e resumo) | 📖 Atual |

---

## 🎯 Objetivos da Fase 2

### Funcionalidades a Implementar

1. **Treinos Recorrentes:**
   - Criar treinos que se repetem automaticamente
   - Padrões: semanal, quinzenal, mensal
   - Job agendado para gerar eventos futuros
   - Editar série completa ou evento único

2. **RSVP Avançado:**
   - Estatísticas de confirmação por treino
   - Lista visual de confirmados com avatares
   - Progress bar de confirmação
   - Taxa de presença histórica

3. **Métricas de Treinos:**
   - Treinos hoje / esta semana
   - Pendentes de confirmação
   - Taxa média de confirmação
   - Frequência por atleta

4. **Convocações por Modalidade:**
   - Criar treino específico para uma modalidade
   - Convocar apenas atletas daquela modalidade
   - Posições obrigatórias por convocação

---

## 📊 Progresso

### Resumo Geral

```
Progresso Total: ⏸️ Aguardando início

┌─────────────────────────┬───────┬───────┬──────┐
│ Categoria               │ Done  │ Total │   %  │
├─────────────────────────┼───────┼───────┼──────┤
│ Backend - Recorrência   │  0/6  │    6  │   0% │
│ Backend - RSVP          │  0/4  │    4  │   0% │
│ Backend - Convocações   │  0/5  │    5  │   0% │
│ Frontend - Treinos      │  0/8  │    8  │   0% │
│ Frontend - RSVP         │  0/6  │    6  │   0% │
│ Jobs Agendados          │  0/2  │    2  │   0% │
│ Testes                  │  0/3  │    3  │   0% │
│ Documentação            │  1/1  │    1  │ 100% ✅ │
└─────────────────────────┴───────┴───────┴──────┘
```

**Status:** ⏸️ **Aguardando Fase 1 ser validada**

**Acompanhe o progresso em:** [CHECKLIST-EXECUCAO.md](./CHECKLIST-EXECUCAO.md)

---

## 🗂️ Entregáveis

### Backend (15 tarefas)

#### Treinos Recorrentes (6 tarefas)
- [ ] API POST /api/recurring-trainings (criar)
- [ ] API GET /api/recurring-trainings (listar)
- [ ] API PATCH /api/recurring-trainings/[id] (editar)
- [ ] API DELETE /api/recurring-trainings/[id] (excluir série)
- [ ] Helper: generateRecurringEvents()
- [ ] Job agendado: gerar eventos futuros

#### RSVP Avançado (4 tarefas)
- [ ] API GET /api/events/[id]/rsvp-stats
- [ ] API GET /api/events/[id]/confirmed
- [ ] Helper: calculateAttendanceRate()
- [ ] Helper: getUserAttendanceHistory()

#### Convocações por Modalidade (5 tarefas)
- [ ] Adicionar modality_id em game_convocations
- [ ] API POST /api/events/[id]/convocations (criar)
- [ ] API GET /api/events/[id]/convocations (listar)
- [ ] Helper: getModalityAthletes()
- [ ] Notificações para convocados

### Frontend (14 tarefas)

#### Componentes de Treinos (8 tarefas)
- [ ] TrainingMetricsCards (4 cards de métricas)
- [ ] RecurringBadge (badge "RECORRENTE")
- [ ] CreateTrainingModal (único ou recorrente)
- [ ] RecurrenceSelector (padrão de recorrência)
- [ ] TrainingFilters (por modalidade, data)
- [ ] EditRecurringModal (editar série)
- [ ] DeleteRecurringConfirm (série ou único)
- [ ] ModalitySelector (escolher modalidade)

#### Componentes de RSVP (6 tarefas)
- [ ] RSVPProgressBar (% confirmados)
- [ ] ConfirmedAvatars (lista de avatares)
- [ ] RSVPStats (estatísticas detalhadas)
- [ ] AttendanceHistory (histórico do atleta)
- [ ] RSVPButton (confirmar/cancelar melhorado)
- [ ] WaitingList (lista de espera)

### Jobs e Automação (2 tarefas)
- [ ] Cron job: gerar eventos recorrentes (diário)
- [ ] Cron job: notificar treinos próximos (6h antes)

### Testes (3 tarefas)
- [ ] Testes unitários (helpers de recorrência)
- [ ] Testes de integração (APIs)
- [ ] Testes E2E (fluxos críticos)

---

## 🚀 Como Usar Esta Documentação

### Para Desenvolvedores

1. **Início:**
   - Leia [FASE-02-PREPARACAO.md](./FASE-02-PREPARACAO.md) para entender o escopo

2. **Durante o desenvolvimento:**
   - Use [CHECKLIST-EXECUCAO.md](./CHECKLIST-EXECUCAO.md) para acompanhar tarefas
   - Marque como concluídas conforme avança

3. **Ao finalizar:**
   - Execute testes do [GUIA-TESTES-COMPLETO.md](./GUIA-TESTES-COMPLETO.md)

---

## 🔗 Dependências

### Pré-requisitos
- ✅ **Fase 0** concluída (Fundação)
- ✅ **Fase 1** concluída (Modalidades e Atletas)
- ✅ **Migration** `20260227000003_recurring_trainings.sql` já existe
- ✅ **Migration** `20260227000004_game_convocations.sql` já existe

### Habilitações para Fases Futuras
- ✅ **Fase 3:** Rankings e Estatísticas (usa dados de treinos)
- ✅ **Fase 4:** Análises Avançadas (usa métricas de presença)

---

## 📦 Tecnologias

### Backend
- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL)
- **Zod** (validação)
- **node-cron** (jobs agendados)

### Frontend
- **React 18**
- **TailwindCSS**
- **shadcn/ui**
- **Design System UzzAI**
- **date-fns** (manipulação de datas)

---

## 🎯 Critérios de Aprovação

Para que a Fase 2 seja considerada concluída:

### Funcionalidades
- [ ] Treinos recorrentes criando eventos automaticamente
- [ ] Padrões de recorrência funcionando (semanal, quinzenal, mensal)
- [ ] RSVP com estatísticas e lista de confirmados
- [ ] Métricas de treinos funcionando
- [ ] Convocações por modalidade
- [ ] Job agendado rodando

### Qualidade de Código
- [ ] TypeScript sem erros
- [ ] Validações Zod implementadas
- [ ] Error handling completo
- [ ] Testes passando (>80% cobertura)

### UX/UI
- [ ] Design System UzzAI aplicado
- [ ] Responsivo (mobile e desktop)
- [ ] Loading states
- [ ] Empty states
- [ ] Feedback visual (toasts)

---

## 📝 Notas Importantes

### Treinos Recorrentes
- ✅ Job gera eventos com 30 dias de antecedência
- ✅ Ao editar série, pode escolher: "Este evento" ou "Todos os futuros"
- ✅ Ao excluir, pode escolher: "Este evento" ou "Toda a série"
- ⚠️ Eventos já criados não são alterados retroativamente

### Convocações
- ✅ Apenas admins podem criar convocações
- ✅ Atletas recebem notificação
- ✅ Posições obrigatórias podem ser definidas
- ⚠️ Convocação não garante vaga (ainda pode ter RSVP)

### RSVP
- ✅ Estatísticas calculadas em tempo real
- ✅ Taxa de presença baseada em histórico
- ✅ Progress bar atualiza ao confirmar/cancelar

---

## 🔮 Próximas Fases

Após concluir a Fase 2:

### Fase 3: Rankings e Estatísticas
- Rankings por modalidade
- Estatísticas individuais e de grupo
- Comparativos e análises
- Exportação de dados

### Fase 4: Análises Avançadas (Premium)
- Analytics detalhado
- Relatórios personalizados
- Previsões e insights
- IA para sugestões

---

## 📊 Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | 2026-01-24 | Criação da documentação da Fase 2 |

---

## ⏱️ Timeline

### Planejamento
**Documentação criada:** 2026-01-24
**Preparação:** ~1 hora

### Execução (A Iniciar)
**Início sugerido:** Após validação da Fase 1
**Prazo estimado:** 2 semanas (ou 1 turno seguindo o ritmo)
**Duração:** 10 dias úteis (ou 6-8 horas focadas)

### Breakdown Sugerido

**Opção A: 2 Semanas (Tradicional)**

*Semana 1:*
- Dias 1-2: Backend - Treinos Recorrentes (6 tarefas)
- Dias 3-4: Backend - RSVP e Convocações (9 tarefas)
- Dia 5: Jobs agendados e testes backend

*Semana 2:*
- Dias 1-3: Frontend - Componentes (14 tarefas)
- Dia 4: Testes de integração
- Dia 5: Validação e documentação

**Opção B: 1 Turno (Ritmo Acelerado)**

Baseado na performance das Fases 0 e 1:
- Backend: 3-4 horas
- Frontend: 3-4 horas
- Jobs: 1 hora
- Total: ~8 horas (1 turno completo)

---

**Última atualização:** 2026-01-24
**Status:** 🟡 Pronto para iniciar
**Responsável:** Equipe ResenhApp
**Dependências:** ✅ Fase 1 validada e concluída

**🚀 Aguardando validação da Fase 1!**
