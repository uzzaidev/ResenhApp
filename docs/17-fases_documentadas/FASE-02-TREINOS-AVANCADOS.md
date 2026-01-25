# 📋 FASE 2: Treinos Avançados

> **Duração:** Semana 5-6 (2 semanas)  
> **Status:** ⏸️ Planejado  
> **Prioridade:** 🟡 Média  
> **Depende de:** Fase 0, Fase 1

---

## 🎯 OBJETIVO DA FASE

Melhorar sistema de treinos com RSVP avançado, treinos recorrentes e métricas detalhadas.

---

## 📝 TAREFAS DETALHADAS

### Tarefa 3.1: Backend - Treinos Recorrentes

**APIs:**
- `POST /api/events/recurring` - Criar treino recorrente
- Job agendado: Gerar eventos recorrentes
- Lógica de recorrência (semanal, quinzenal, mensal)

**Arquivos:**
```
src/app/api/events/recurring/route.ts
src/lib/recurrence.ts
src/jobs/generate-recurring-events.ts
```

**Checklist:**
- [ ] Implementar API de treino recorrente
- [ ] Criar função de geração de eventos
- [ ] Implementar job agendado
- [ ] Testar diferentes padrões de recorrência

---

### Tarefa 3.2: Backend - RSVP Avançado

**APIs:**
- `GET /api/events/[id]/rsvp-stats` - Estatísticas de RSVP
- `GET /api/events/[id]/confirmed` - Lista de confirmados

**Arquivos:**
```
src/app/api/events/[id]/rsvp-stats/route.ts
src/app/api/events/[id]/confirmed/route.ts
```

**Checklist:**
- [ ] Implementar API de estatísticas
- [ ] Implementar API de confirmados
- [ ] Melhorar dados de event_attendance

---

### Tarefa 3.3: Frontend - Página Treinos (Melhorada)

**Componentes:**
- Cards de métricas (Hoje, Esta Semana, Pendentes, Taxa)
- Lista de treinos com RSVP expandido
- Progress bar de confirmação
- Lista de confirmados com avatares
- Badge "RECORRENTE"
- Modal criar treino (único ou recorrente)

**Checklist:**
- [ ] Criar componentes de métricas
- [ ] Melhorar lista de treinos
- [ ] Implementar RSVP expandido
- [ ] Criar modal de treino recorrente
- [ ] Adicionar filtros por modalidade

---

## ✅ CHECKLIST COMPLETO

- [ ] Treinos recorrentes funcionando
- [ ] RSVP com UI avançada
- [ ] Métricas de treinos
- [ ] Job agendado configurado

---

**Última atualização:** 2026-02-27  
**Status:** ⏸️ Planejado


