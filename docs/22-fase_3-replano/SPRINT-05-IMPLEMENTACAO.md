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

**Status:** 🟡 Aguardando início  
**Próxima ação:** Criar API de notificações

