# Sprint 2: RSVP → Charge Automática - Resumo Final

**Status:** ✅ **98% COMPLETO**  
**Data:** 2026-01-25

---

## 📋 Objetivo

Implementar criação automática de cobrança quando um atleta confirma presença em um evento com preço definido.

---

## ✅ Entregas Realizadas

### 1. Migrations de Banco de Dados (3 arquivos)

✅ **`receiver_profiles` table**
- Armazena informações de quem recebe pagamentos (usuários ou instituições)
- Campos: `type`, `entity_id`, `pix_key`, `pix_type`, `name`, `city`

✅ **Campos em `events`**
- `price` (DECIMAL) - Preço do evento
- `receiver_profile_id` (UUID) - Perfil que recebe o pagamento
- `auto_charge_on_rsvp` (BOOLEAN) - Flag para auto-gerar cobrança

✅ **Campo em `charges`**
- `receiver_profile_id` (UUID) - Vincula charge ao perfil recebedor

### 2. Backend - Lógica de Auto-Cobrança

✅ **`/api/events/[eventId]/rsvp` (POST)**
- Detecta quando RSVP=yes e evento tem preço
- Cria `charge` e `charge_split` automaticamente
- Previne duplicatas (verifica se já existe)
- Calcula `due_date` (1 dia antes do evento)
- Cria notificação para o usuário
- Retorna `charge` e `charge_split` na resposta

✅ **`/api/events` (POST)**
- Aceita novos campos: `price`, `receiverProfileId`, `autoChargeOnRsvp`

✅ **`/api/groups/[groupId]/receiver-profiles` (GET/POST)**
- Lista receiver profiles do grupo
- Permite criar novos perfis (apenas admins)
- Valida membership e role

### 3. Frontend - UI/UX

✅ **`EventForm`**
- Seção collapsible "Configurações de Cobrança"
- Checkbox "Este treino tem cobrança"
- Input de preço (R$)
- Select de receiver profiles (carrega da API)
- Checkbox "Gerar cobrança automaticamente"
- Preview da cobrança antes de salvar

✅ **`EventRsvpForm`**
- Toast de sucesso com link para cobrança gerada
- Exibe valor da cobrança
- Link clicável para `/financeiro/charges/{chargeId}`

✅ **`TrainingCard`**
- Badge "Cobrança Pendente" quando `hasPendingCharge=true`
- Visual destacado (amber/amarelo)

### 4. Validações e Schemas

✅ **`createEventSchema` (Zod)**
- Campos opcionais: `price`, `receiverProfileId`, `autoChargeOnRsvp`
- Validação de tipos e valores

### 5. Testes

✅ **Testes Unitários**
- `tests/unit/api/rsvp-auto-charge.test.ts`
- Cobre cenários de criação, prevenção de duplicatas, cálculo de due date
- 8 casos de teste implementados

---

## 📊 Métricas

- **Migrations:** 3 arquivos SQL
- **APIs criadas/modificadas:** 3 rotas
- **Componentes atualizados:** 3 componentes
- **Testes:** 8 casos unitários
- **Linhas de código:** ~400 linhas (SQL + TS/TSX)
- **Cobertura de testes:** Básica (lógica core)

---

## 🔄 Fluxo Completo Implementado

```
1. Admin cria evento
   └─> Define preço e receiver profile
   └─> Marca "Gerar cobrança automaticamente"

2. Atleta confirma presença (RSVP=yes)
   └─> Sistema detecta: preço > 0 + auto_charge=true
   └─> Cria charge (ou reutiliza existente)
   └─> Cria charge_split para o atleta
   └─> Cria notificação
   └─> Retorna charge na resposta

3. Frontend exibe feedback
   └─> Toast: "Presença confirmada! Cobrança de R$ X gerada"
   └─> Link: "Ver cobrança" → /financeiro/charges/{id}

4. Card do treino
   └─> Badge "Cobrança Pendente" (se aplicável)
```

---

## 🎯 Funcionalidades Principais

### ✅ Implementadas

1. **Auto-geração de cobrança** ao confirmar presença
2. **Prevenção de duplicatas** (verifica charge_split existente)
3. **Reutilização de charge** (um charge por evento)
4. **Notificações automáticas** para novas cobranças
5. **UI completa** para configurar preço e receiver
6. **Feedback visual** (toast + badge)
7. **API de receiver profiles** funcional

### ⏳ Pendências (2%)

1. **Testes E2E** completos do fluxo RSVP → Charge
2. **UI dedicada** para criar/gerenciar receiver profiles (form completo)

---

## 📁 Arquivos Criados/Modificados

### Migrations
- `supabase/migrations/20260125000001_create_receiver_profiles.sql`
- `supabase/migrations/20260125000002_add_event_price_fields.sql`
- `supabase/migrations/20260125000003_add_receiver_profile_to_charges.sql`

### Backend
- `src/app/api/events/[eventId]/rsvp/route.ts` (modificado)
- `src/app/api/events/route.ts` (modificado)
- `src/app/api/groups/[groupId]/receiver-profiles/route.ts` (novo)

### Frontend
- `src/components/events/event-form.tsx` (modificado)
- `src/components/events/event-rsvp-form.tsx` (modificado)
- `src/components/trainings/training-card.tsx` (modificado)

### Validações
- `src/lib/validations.ts` (modificado)

### Testes
- `tests/unit/api/rsvp-auto-charge.test.ts` (novo)

### Documentação
- `docs/22-fase_3-replano/SPRINT-02-RSVP-CHARGE.md` (atualizado)
- `docs/22-fase_3-replano/SPRINT-02-IMPLEMENTACAO.md` (criado)
- `docs/22-fase_3-replano/SPRINT-02-RESUMO-FINAL.md` (este arquivo)

---

## 🐛 Decisões Técnicas Importantes

1. **Type Conversion:** `eventId` na rota é UUID, mas `events.id` é BIGINT. Conversão explícita `::BIGINT` nas queries.

2. **Due Date:** Calculado como 1 dia antes do `starts_at` do evento. Fallback: 7 dias a partir de agora.

3. **Receiver Profiles:** Por enquanto, apenas perfis de admins do grupo são listados. Suporte para instituições será adicionado no futuro.

4. **Duplicatas:** Verificação de `charge_split` existente antes de criar novo, evitando cobranças duplicadas.

5. **Notificações:** Criadas automaticamente quando charge é gerada, com link direto para a cobrança.

---

## 🚀 Próximos Passos (Sprint 3)

1. **Pix QR Code Generation**
   - Gerar QR Code Pix estático para charges
   - Integrar com biblioteca de geração de QR Code
   - Armazenar `pix_payload` e `qr_image_url` em `charges`

2. **Receiver Profiles UI Completa**
   - Form dedicado para criar receiver profiles
   - Lista de perfis com ações (editar, deletar)
   - Validação de chave Pix

3. **Testes E2E**
   - Fluxo completo: criar evento → RSVP → verificar charge → pagar

---

## ✅ Checklist Final

- [x] Migrations criadas e aplicadas
- [x] Lógica de auto-cobrança implementada
- [x] API de receiver profiles criada
- [x] Frontend atualizado (form + toast + badge)
- [x] Validações atualizadas
- [x] Testes unitários básicos
- [x] Documentação completa
- [ ] Testes E2E (pendente)
- [ ] UI completa de receiver profiles (pendente)

---

**Sprint 2 concluído com sucesso! 🎉**

