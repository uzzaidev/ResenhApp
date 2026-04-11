# 🎯 Sprint 5: Notificações Reais + Undo

> **Duração:** 4 dias  
> **Camada:** 2 - UX Profissional  
> **Prioridade:** 🟡 Importante (Afeta UX)

---

## 📋 Objetivo

Implementar sistema completo de notificações em tempo real e funcionalidade de desfazer ações críticas, melhorando significativamente a experiência do usuário.

---

## 🎯 Entregas

### 1. Migration: `notifications` Table

**Arquivo:** `supabase/migrations/YYYYMMDDHHMMSS_create_notifications.sql`

**Schema:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'charge_created',
    'charge_due_soon',
    'rsvp_reminder',
    'event_cancelled',
    'payment_received',
    'group_invite',
    'event_updated'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Link para abrir (ex: /financeiro/charges/123)
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_user_unread (user_id, read_at) WHERE read_at IS NULL,
  INDEX idx_user_created (user_id, created_at DESC)
);
```

---

### 2. Triggers para Notificações Automáticas

**Arquivo:** `supabase/migrations/YYYYMMDDHHMMSS_notification_triggers.sql`

**Triggers:**
- [ ] `notify_charge_created` - Ao criar charge
- [ ] `notify_charge_due_soon` - 1 dia antes do vencimento
- [ ] `notify_event_cancelled` - Ao cancelar evento
- [ ] `notify_payment_received` - Ao marcar como pago

**Exemplo:**
```sql
CREATE OR REPLACE FUNCTION notify_charge_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url)
  VALUES (
    NEW.user_id,
    'charge_created',
    'Nova cobrança',
    'Você tem uma cobrança de R$ ' || NEW.amount || ' referente ao treino',
    '/financeiro/charges/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER charge_created_notification
AFTER INSERT ON charges
FOR EACH ROW EXECUTE FUNCTION notify_charge_created();
```

---

### 3. API de Notificações

**Arquivo:** `src/app/api/notifications/route.ts`

**Endpoints:**
- [ ] `GET /api/notifications` - Listar notificações (unread first)
- [ ] `PATCH /api/notifications/[id]/read` - Marcar como lida
- [ ] `DELETE /api/notifications/[id]` - Deletar notificação
- [ ] `POST /api/notifications/mark-all-read` - Marcar todas como lidas

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "charge_created",
      "title": "Nova cobrança",
      "message": "Você tem uma cobrança de R$ 20,00",
      "action_url": "/financeiro/charges/123",
      "read_at": null,
      "created_at": "2026-01-25T10:00:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

### 4. Polling no Frontend

**Arquivo:** `src/hooks/use-notifications.ts`

**Funcionalidades:**
- [ ] Polling a cada 30 segundos
- [ ] Contagem de não lidas
- [ ] Atualização automática
- [ ] Cleanup ao desmontar

**Código:**
```typescript
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s

    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount };
}
```

---

### 5. Atualizar NotificationsDropdown

**Arquivo:** `src/components/notifications/notifications-dropdown.tsx`

**Funcionalidades:**
- [ ] Usar dados reais (não mock)
- [ ] Badge com contagem real
- [ ] Marcar como lida ao clicar
- [ ] Navegação para `action_url`
- [ ] Agrupamento por tipo/data

---

### 6. Sistema de Undo

**Arquivo:** `src/lib/undo.ts`

**Funcionalidades:**
- [ ] Janela de 8 segundos para desfazer
- [ ] Suporte a múltiplas ações
- [ ] Toast com botão "Desfazer"

**Ações com Undo:**
- [ ] Marcar como Pago
- [ ] Cancelar Evento
- [ ] Remover Atleta do Grupo
- [ ] Deletar Modalidade

**Código:**
```typescript
export async function markAsPaidWithUndo(chargeId: string) {
  // 1. Marca como pago
  await sql`UPDATE charges SET paid_at = NOW() WHERE id = ${chargeId}`;

  // 2. Toast com undo
  toast.success('Pagamento marcado como recebido', {
    action: {
      label: 'Desfazer',
      onClick: async () => {
        await sql`UPDATE charges SET paid_at = NULL WHERE id = ${chargeId}`;
        toast.success('Desfeito!');
      }
    },
    duration: 8000 // 8s para desfazer
  });
}
```

---

## ✅ Critérios de Done

### Funcionalidade
- [ ] Notificações criadas automaticamente
- [ ] Badge mostra contagem real
- [ ] Polling funciona (30s)
- [ ] Undo funciona em ações críticas

### UX
- [ ] Notificações aparecem em tempo real
- [ ] Badge atualiza automaticamente
- [ ] Undo tem janela de 8s
- [ ] Design consistente

### Testes
- [ ] Teste: Trigger cria notificação
- [ ] Teste: Polling atualiza contagem
- [ ] Teste: Undo reverte ação

---

## 📝 Tarefas Detalhadas

### Dia 1: Migration + Triggers
- [ ] Criar migration `notifications`
- [ ] Criar triggers automáticos
- [ ] Testar triggers isoladamente
- [ ] Aplicar migrations

### Dia 2: API + Polling
- [ ] Criar API `/api/notifications`
- [ ] Implementar hook `useNotifications`
- [ ] Implementar polling (30s)
- [ ] Testar atualização automática

### Dia 3: UI + Undo
- [ ] Atualizar NotificationsDropdown
- [ ] Implementar sistema de Undo
- [ ] Adicionar undo em 4 ações críticas
- [ ] Testar fluxo completo

### Dia 4: Testes + Documentação
- [ ] Testes E2E de notificações
- [ ] Testes de undo
- [ ] Documentação
- [ ] Code review

---

## 🐛 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Polling muito frequente | Médio | Ajustar intervalo (30s) |
| Undo após 8s | Baixo | Desabilitar botão após timeout |
| Notificações duplicadas | Médio | Verificar existência antes de criar |

---

## 📚 Referências

- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
- [React Hooks](https://react.dev/reference/react)
- [Sonner Toast Actions](https://sonner.emilkowal.ski/)

---

**Status:** ⏳ Pendente  
**Início:** ___/___/____  
**Conclusão:** ___/___/____






