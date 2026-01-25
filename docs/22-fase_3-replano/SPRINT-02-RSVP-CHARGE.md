# 🎯 Sprint 2: RSVP → Charge Automática

> **Duração:** 3 dias  
> **Camada:** 1 - Fundação Sólida  
> **Prioridade:** 🔴 Crítica (Bloqueia MVP)

---

## 📋 Objetivo

Implementar lógica de auto-geração de cobrança quando um atleta confirma presença em um treino que tem preço definido. Este é o fluxo principal do sistema de pagamentos.

---

## 🎯 Entregas

### 1. Migration: Campos em `events`

**Arquivo:** `supabase/migrations/YYYYMMDDHHMMSS_add_event_price.sql`

**Campos a Adicionar:**
- [ ] `events.price` (DECIMAL(10,2)) - Preço por atleta
- [ ] `events.receiver_profile_id` (UUID) - Quem recebe o pagamento
- [ ] `events.auto_charge_on_rsvp` (BOOLEAN DEFAULT true) - Auto-gerar charge?

**SQL:**
```sql
ALTER TABLE events
  ADD COLUMN price DECIMAL(10,2),
  ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id),
  ADD COLUMN auto_charge_on_rsvp BOOLEAN DEFAULT true;

CREATE INDEX idx_events_price ON events(price) WHERE price > 0;
```

---

### 2. Atualizar Form Criar Treino

**Arquivo:** `src/app/groups/[groupId]/events/new/page.tsx`

**Campos a Adicionar:**
- [ ] Seção "Cobrança" (collapsible)
- [ ] Checkbox "Este treino tem cobrança"
- [ ] Input "Preço por atleta" (R$)
- [ ] Select "Quem recebe" (Admin do Grupo / Instituição)
- [ ] Preview: "X atletas × R$ Y = R$ Z"

**UI:**
```
┌─────────────────────────────────────┐
│ ☐ Este treino tem cobrança          │
│                                     │
│ [mostrado se marcado]               │
│ Preço por atleta: R$ [____]         │
│ Quem recebe: [Admin do Grupo ▼]     │
│                                     │
│ Preview:                            │
│ "10 atletas × R$ 20 = R$ 200"       │
└─────────────────────────────────────┘
```

---

### 3. Lógica de Auto-Cobrança no Backend

**Arquivo:** `src/app/api/events/[eventId]/rsvp/route.ts`

**Funcionalidades:**
- [ ] Verificar se `event.price > 0`
- [ ] Verificar se `event.auto_charge_on_rsvp = true`
- [ ] Verificar se charge já existe (evitar duplicatas)
- [ ] Criar charge automaticamente:
  ```typescript
  {
    user_id: userId,
    event_id: eventId,
    amount: event.price,
    due_date: event.starts_at - 1 day, // 1 dia antes do treino
    receiver_profile_id: event.receiver_profile_id,
    status: 'pending'
  }
  ```
- [ ] Retornar charge criada na response

**Código:**
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { status } = await request.json();
  const user = await requireAuth();

  // 1. Atualizar RSVP
  await sql`
    INSERT INTO event_attendance (event_id, user_id, status)
    VALUES (${eventId}, ${user.id}, ${status})
    ON CONFLICT (event_id, user_id) DO UPDATE SET status = ${status}
  `;

  // 2. Se RSVP=yes E event tem preço E auto_charge=true
  if (status === 'yes') {
    const event = await sql`
      SELECT price, receiver_profile_id, auto_charge_on_rsvp, starts_at
      FROM events
      WHERE id = ${eventId}
    `;

    if (event[0]?.price > 0 && event[0]?.auto_charge_on_rsvp) {
      // Verificar se charge já existe
      const existingCharge = await sql`
        SELECT id FROM charges
        WHERE event_id = ${eventId} AND user_id = ${user.id}
      `;

      if (!existingCharge.length) {
        // Criar charge
        const charge = await sql`
          INSERT INTO charges (
            user_id, event_id, amount, due_date,
            receiver_profile_id, status
          )
          VALUES (
            ${user.id},
            ${eventId},
            ${event[0].price},
            ${event[0].starts_at - INTERVAL '1 day'},
            ${event[0].receiver_profile_id},
            'pending'
          )
          RETURNING *
        `;

        // Criar notificação
        await sql`
          INSERT INTO notifications (user_id, type, title, message, action_url)
          VALUES (
            ${user.id},
            'charge_created',
            'Nova cobrança',
            'Você tem uma cobrança de R$ ' || ${event[0].price} || ' referente ao treino',
            '/financeiro/charges/' || ${charge[0].id}
          )
        `;
      }
    }
  }

  return NextResponse.json({
    rsvp_status: status,
    charge: charge?.[0] || null
  });
}
```

---

### 4. Frontend: Mostrar Cobrança Gerada

**Arquivo:** `src/components/dashboard/upcoming-trainings.tsx`

**Funcionalidades:**
- [ ] Toast ao confirmar presença: "Presença confirmada! Cobrança de R$ X gerada."
- [ ] Link para ver cobrança: `/financeiro/charges/{chargeId}`
- [ ] Badge "Cobrança Pendente" no card do treino

**Código:**
```typescript
async function handleRSVP(eventId: string, status: 'yes' | 'no') {
  setIsLoading(true);
  try {
    const response = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (data.charge) {
      toast.success(
        `Presença confirmada! Cobrança de ${formatCurrency(data.charge.amount)} gerada.`,
        {
          action: {
            label: 'Ver cobrança',
            onClick: () => router.push(`/financeiro/charges/${data.charge.id}`)
          }
        }
      );
    } else {
      toast.success('Presença confirmada!');
    }
  } catch (error) {
    toast.error('Erro ao confirmar presença');
  } finally {
    setIsLoading(false);
  }
}
```

---

## ✅ Critérios de Done

### Funcionalidade
- [ ] RSVP=yes → charge criada automaticamente
- [ ] Charge vinculada ao `event_id`
- [ ] Não cria charge duplicada
- [ ] Notificação criada ao gerar charge

### UX
- [ ] Toast mostra cobrança gerada
- [ ] Link direto para ver cobrança
- [ ] Badge visual no card do treino
- [ ] Loading state durante RSVP

### Testes
- [ ] Teste E2E: Confirmar presença → charge criada
- [ ] Teste: Não criar charge duplicada
- [ ] Teste: Não criar se `auto_charge_on_rsvp = false`

### Performance
- [ ] RSVP + charge creation < 1s
- [ ] Query otimizada (evitar N+1)

---

## 📝 Tarefas Detalhadas

### Dia 1: Migration + Form
- [ ] Criar migration de campos em `events`
- [ ] Aplicar migration no Supabase
- [ ] Atualizar form criar treino
- [ ] Adicionar validação (preço > 0)
- [ ] Testar form isoladamente

### Dia 2: Backend Auto-Cobrança
- [ ] Atualizar endpoint `/api/events/[id]/rsvp`
- [ ] Implementar lógica de auto-cobrança
- [ ] Criar notificação automática
- [ ] Testar com diferentes cenários
- [ ] Adicionar logs

### Dia 3: Frontend + Testes
- [ ] Atualizar componente `UpcomingTrainings`
- [ ] Adicionar toast com link
- [ ] Adicionar badge visual
- [ ] Testes E2E completos
- [ ] Documentar fluxo

---

## 🐛 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Charge duplicada | Alto | Verificar existência antes de criar |
| ReceiverProfile não existe | Médio | Fallback para admin do grupo |
| Preço zero mas auto_charge=true | Baixo | Validação no form |

---

## 📚 Referências

- Migration Pattern: `supabase/migrations/`
- API Pattern: `src/app/api/events/[id]/rsvp/route.ts`
- Toast: `sonner` library

---

**Status:** ⏳ Pendente  
**Início:** ___/___/____  
**Conclusão:** ___/___/____

