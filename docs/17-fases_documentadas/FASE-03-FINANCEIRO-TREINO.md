# 📋 FASE 3: Financeiro por Treino

> **Duração:** Semana 7-8 (2 semanas)  
> **Status:** ⏸️ Planejado  
> **Prioridade:** 🔴 Alta  
> **Depende de:** Fase 0, Fase 2

---

## 🎯 OBJETIVO DA FASE

Implementar sistema completo de pagamentos por treino com cobranças e histórico.

---

## 📝 TAREFAS DETALHADAS

### Tarefa 4.1: Backend - Pagamentos por Treino

**APIs:**
- `GET /api/events/[id]/payments` - Pagamentos do treino
- `POST /api/events/[id]/charge` - Criar cobrança
- `POST /api/payments/[id]/mark-paid` - Marcar como pago
- `POST /api/payments/[id]/remind` - Enviar lembrete

**Checklist:**
- [ ] Associar charges a events
- [ ] Implementar todas as APIs
- [ ] Integrar com sistema de notificações

---

### Tarefa 4.2: Frontend - Página Financeiro (Melhorada)

**Componentes:**
- Cards de resumo (Arrecadado, Pendente, Despesas, Saldo)
- Seção "Pagamentos por Treino"
- Progress de pagamento
- Lista de atletas pendentes com botão "Cobrar"
- Badge "100% PAGO"
- Histórico de transações melhorado

**Checklist:**
- [ ] Criar componentes de resumo
- [ ] Implementar lista de pagamentos por treino
- [ ] Criar componente de cobrança
- [ ] Melhorar histórico

---

## ✅ CHECKLIST COMPLETO

- [ ] Pagamentos vinculados a treinos
- [ ] UI de cobrança e pendências
- [ ] Histórico completo
- [ ] Integração com Pix

---

**Última atualização:** 2026-02-27  
**Status:** ⏸️ Planejado

