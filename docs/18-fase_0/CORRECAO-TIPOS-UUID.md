# 🔧 Correção Crítica: Tipos de Dados UUID

> **Data:** 2026-02-27  
> **Problema:** Incompatibilidade de tipos entre migrations e banco de produção

---

## 🐛 PROBLEMA IDENTIFICADO

**Erro encontrado:**
```
ERROR: 42804: foreign key constraint "sport_modalities_group_id_fkey" cannot be implemented 
DETAIL: Key columns "group_id" and "id" are of incompatible types: bigint and uuid.
```

**Causa:**
- Banco de produção usa `UUID` para `groups.id` e `events.id`
- Migrations estavam usando `BIGINT`
- Incompatibilidade de tipos na foreign key

---

## ✅ CORREÇÕES APLICADAS

### Migration 1: Sport Modalities
- ✅ `group_id`: `BIGINT` → `UUID`
- ✅ Função `get_group_modalities`: Parâmetro `BIGINT` → `UUID`

### Migration 3: Recurring Trainings
- ✅ `parent_event_id`: `BIGINT` → `UUID`
- ✅ Funções atualizadas para usar `UUID`

### Migration 4: Game Convocations
- ✅ `event_id`: `BIGINT` → `UUID`

### Migration 5: Check-in QR Codes
- ✅ `event_id`: `BIGINT` → `UUID` (2 ocorrências)
- ✅ Funções atualizadas para usar `UUID`

### Migration 6: Saved Tactics
- ✅ `group_id`: `BIGINT` → `UUID`
- ✅ Função `get_group_tactics`: Parâmetro `BIGINT` → `UUID`

### Migration 7: Financial by Training
- ✅ `event_id`: `BIGINT` → `UUID`
- ✅ Funções atualizadas para usar `UUID`
- ⚠️ `charge_id` permanece `BIGINT` (correto, pois `charges.id` é BIGSERIAL)

### Migration 8: Hierarchy and Credits
- ✅ `parent_group_id`: `BIGINT` → `UUID`
- ✅ `group_id` em `credit_transactions`: `BIGINT` → `UUID`
- ✅ `event_id` em `credit_transactions`: `BIGINT` → `UUID`
- ✅ Todas as funções atualizadas para usar `UUID`

---

## 📋 RESUMO DAS CORREÇÕES

| Tipo | Antes | Depois | Status |
|------|-------|--------|--------|
| `groups.id` | BIGINT (assumido) | **UUID** (real) | ✅ Corrigido |
| `events.id` | BIGINT (assumido) | **UUID** (real) | ✅ Corrigido |
| `profiles.id` | UUID | UUID | ✅ Já estava correto |
| `charges.id` | BIGSERIAL | BIGSERIAL | ✅ Correto (não mudou) |

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Todas as migrations corrigidas
2. ⏳ **Aplicar Migration 1 novamente no Supabase**
3. ⏳ Verificar se funciona
4. ⏳ Continuar com migrations 2-8

---

## ⚠️ IMPORTANTE

**Antes de aplicar, verifique o tipo real no seu banco:**

Execute no Supabase SQL Editor:
```sql
SELECT 
  'groups.id' AS coluna,
  data_type AS tipo
FROM information_schema.columns 
WHERE table_name = 'groups' AND column_name = 'id';

SELECT 
  'events.id' AS coluna,
  data_type AS tipo
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'id';
```

Se ambos retornarem `uuid`, as correções estão corretas!

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Todas as correções aplicadas






