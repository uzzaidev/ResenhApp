# ✅ Validar Migrations Aplicadas

> **Data:** 2026-02-27  
> **Status:** ⏳ Próximo passo após aplicar todas as migrations

---

## 🎯 OBJETIVO

Validar que todas as 8 migrations foram aplicadas corretamente e que:
- ✅ Todas as tabelas foram criadas
- ✅ Todas as funções foram criadas
- ✅ Integridade referencial está correta
- ✅ Índices foram criados

---

## 📋 TAREFAS (1.9.3 a 1.9.6)

### 1.9.3 Validar integridade referencial

**Script:** `scripts/validar-migrations-aplicadas.sql`

Execute no Supabase SQL Editor para verificar:
- Foreign keys criadas corretamente
- Referências entre tabelas funcionando
- Constraints aplicadas

---

### 1.9.4 Verificar se todas as tabelas foram criadas

**Tabelas esperadas:**
- ✅ `sport_modalities`
- ✅ `athlete_modalities`
- ✅ `checkin_qrcodes`
- ✅ `checkins`
- ✅ `game_convocations`
- ✅ `convocation_responses`
- ✅ `saved_tactics`
- ✅ `credit_transactions`
- ✅ `credit_packages`

**Colunas adicionadas:**
- ✅ `events.is_recurring`, `events.recurrence_pattern`, `events.event_type`, `events.parent_event_id`, `events.modality_id`
- ✅ `groups.parent_group_id`, `groups.group_type`, `groups.pix_code`, `groups.credits_balance`, `groups.credits_purchased`, `groups.credits_consumed`
- ✅ `charges.event_id`

---

### 1.9.5 Verificar se todas as funções foram criadas

**Funções esperadas:**
- ✅ `get_group_modalities(p_group_id UUID)`
- ✅ `get_athlete_modalities(p_user_id UUID)`
- ✅ `get_modality_athletes(p_modality_id UUID)`
- ✅ `generate_recurring_events(...)`
- ✅ `get_next_recurrence_date(p_template_event_id UUID)`
- ✅ `get_convocation_stats(p_convocation_id UUID)`
- ✅ `is_convocation_complete(p_convocation_id UUID)`
- ✅ `create_event_qrcode(p_event_id UUID, p_user_id UUID, p_expires_in_minutes INTEGER DEFAULT 60)`
- ✅ `process_qrcode_checkin(p_qr_code_hash TEXT, p_user_id UUID)`
- ✅ `get_event_checkins(p_event_id UUID)`
- ✅ `get_group_tactics(p_group_id UUID, p_modality_id UUID DEFAULT NULL)`
- ✅ `get_training_payment_summary(p_event_id UUID)`
- ✅ `get_training_pending_payments(p_event_id UUID)`
- ✅ `create_training_charge(p_event_id UUID, p_amount_per_person DECIMAL, p_user_id UUID, p_description TEXT DEFAULT NULL)`
- ✅ `consume_credits(p_group_id UUID, p_amount INTEGER, p_feature VARCHAR, p_user_id UUID, p_event_id UUID DEFAULT NULL)`
- ✅ `add_credits(p_group_id UUID, p_amount INTEGER, p_user_id UUID, p_package_id UUID DEFAULT NULL)`
- ✅ `get_pix_code_for_group(p_group_id UUID)`
- ✅ `can_manage_group(p_user_id UUID, p_group_id UUID)`
- ✅ `check_hierarchy_cycle()` (trigger function)

---

### 1.9.6 Testar rollback (se necessário)

**Nota:** Rollback não é necessário se tudo estiver funcionando.  
**Scripts de rollback:** Estão comentados no final de cada migration.

---

## 🚀 COMO EXECUTAR

### Passo 1: Executar script de validação

1. Abrir Supabase SQL Editor
2. Copiar conteúdo de `scripts/validar-migrations-aplicadas.sql`
3. Colar e executar
4. Verificar resultados

### Passo 2: Verificar resultados

O script retornará:
- ✅ Lista de tabelas criadas
- ✅ Lista de funções criadas
- ✅ Status de foreign keys
- ❌ Erros encontrados (se houver)

---

## 📊 RESULTADO ESPERADO

```
✅ TODAS AS TABELAS FORAM CRIADAS!
✅ TODAS AS FUNÇÕES FORAM CRIADAS!
✅ TODAS AS FOREIGN KEYS VALIDADAS!
```

---

## 🐛 SE HOUVER ERROS

1. **Tabela não encontrada:**
   - Verificar se a migration foi aplicada
   - Verificar logs de erro no Supabase

2. **Função não encontrada:**
   - Verificar se houve erro na criação
   - Verificar sintaxe da função

3. **Foreign key não encontrada:**
   - Verificar se as tabelas referenciadas existem
   - Verificar tipos de dados (UUID vs BIGINT)

---

**Última atualização:** 2026-02-27  
**Status:** ⏳ Aguardando validação






