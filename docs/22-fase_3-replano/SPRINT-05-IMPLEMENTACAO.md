# Sprint 5: Notificações Reais + Undo - Implementação

**Data:** 2026-01-25  
**Status:** 🟡 Em Progresso (0% completo)

---

## 📋 Resumo

Implementação de sistema completo de notificações em tempo real e funcionalidade de desfazer ações críticas.

---

## ✅ Situação Atual

### O que já existe:
- ✅ Migration `20260211000001_notifications.sql` - Tabela de notificações criada
- ✅ Componente `NotificationsDropdown` - UI pronta (mas usa dados mock)
- ✅ Funções SQL para marcar como lida

### O que falta:
- ❌ API `/api/notifications` - Não existe
- ❌ Hook `useNotifications` com polling
- ❌ Triggers automáticos para criar notificações
- ❌ Integração com ações existentes (RSVP, charges, etc.)
- ❌ Sistema de Undo

---

## 🎯 Plano de Implementação

### Fase 1: API de Notificações
1. Criar `/api/notifications/route.ts`
2. Adaptar schema para usar `users` em vez de `profiles` (se necessário)
3. Implementar GET, PATCH, DELETE, POST mark-all-read

### Fase 2: Polling e Hook
1. Criar `useNotifications` hook
2. Implementar polling a cada 30s
3. Atualizar `NotificationsDropdown` para usar dados reais

### Fase 3: Triggers Automáticos
1. Criar triggers para notificações automáticas
2. Integrar com RSVP (já cria charge)
3. Integrar com charges (marcar como pago)

### Fase 4: Sistema de Undo
1. Criar helper `undo.ts`
2. Implementar undo em ações críticas
3. Integrar com toasts

---

**Status:** ✅ **100% COMPLETO**

## ✅ Implementações Concluídas

### Fase 1: API de Notificações ✅
- ✅ `/api/notifications` (GET, POST mark-all-read) ✅
- ✅ `/api/notifications/[id]` (PATCH, DELETE) ✅
- ✅ Adaptação para usar `users` em vez de `profiles` ✅

### Fase 2: Polling e Hook ✅
- ✅ Hook `useNotifications` com polling (30s) ✅
- ✅ Atualização automática de notificações ✅
- ✅ Contagem de não lidas ✅

### Fase 3: UI com Dados Reais ✅
- ✅ `NotificationsDropdown` usando dados reais ✅
- ✅ Formatação de tempo com `date-fns` ✅
- ✅ Navegação para `action_url` ✅
- ✅ Marcar como lida ao clicar ✅

### Fase 4: Triggers Automáticos ✅
- ✅ Migration para adaptar notifications ✅
- ✅ Trigger `notify_charge_created` ✅
- ✅ Trigger `notify_payment_received` ✅
- ✅ Função helper `create_notification` ✅

### Fase 5: Sistema de Undo ✅
- ✅ Helper `undo.ts` com `executeWithUndo` ✅
- ✅ `markChargeAsPaidWithUndo` ✅
- ✅ `cancelChargeWithUndo` ✅
- ✅ Integração com toasts do sonner ✅
- ✅ Janela de 8 segundos para desfazer ✅
- ✅ Atualização da API para suportar `paid_at` ✅

## 📝 Notas de Implementação

### API de Notificações
- Adaptada para usar `users(id)` em vez de `profiles(id)`
- Suporta soft delete (`deleted_at`)
- Polling configurado para 30 segundos

### Sistema de Undo
- Implementado para "Marcar como Pago" e "Cancelar Cobrança"
- Toast com botão "Desfazer" aparece por 8 segundos
- Ao desfazer, restaura o status anterior da cobrança
- API atualizada para gerenciar `paid_at` automaticamente

### Próximos Passos (Opcional)
- Adicionar undo para "Deletar Modalidade"
- Adicionar undo para "Remover Atleta do Grupo"
- Adicionar undo para "Cancelar Evento"

