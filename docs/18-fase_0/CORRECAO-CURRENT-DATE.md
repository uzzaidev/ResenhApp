# 🔧 Correção: Erro de Sintaxe - current_date

> **Data:** 2026-02-27  
> **Erro:** `ERROR: 42601: syntax error at or near "current_date"`  
> **Status:** ✅ **CORRIGIDO**

---

## 🐛 PROBLEMA

**Erro encontrado:**
```
ERROR: 42601: syntax error at or near "current_date"
LINE 98: current_date := GREATEST (template_event.date, p_start_date);
```

**Causa:**
- `current_date` é uma **palavra reservada** no PostgreSQL
- É uma função built-in que retorna a data atual
- Não pode ser usada como nome de variável em PL/pgSQL

---

## ✅ CORREÇÃO APLICADA

**Arquivo:** `supabase/migrations/20260227000003_recurring_trainings.sql`

**Mudança:**
- ❌ `current_date DATE;` → ✅ `current_occurrence_date DATE;`
- ❌ `current_date := ...` → ✅ `current_occurrence_date := ...`
- ❌ `current_date <= pattern_end_date` → ✅ `current_occurrence_date <= pattern_end_date`
- ❌ `current_date + ...` → ✅ `current_occurrence_date + ...`

**Total de ocorrências corrigidas:** 5

---

## 📋 DETALHES DA CORREÇÃO

### Função: `generate_recurring_events`

**Antes:**
```sql
DECLARE
  current_date DATE;  -- ❌ Palavra reservada
  ...
BEGIN
  current_date := GREATEST(...);  -- ❌ Erro de sintaxe
  ...
END;
```

**Depois:**
```sql
DECLARE
  current_occurrence_date DATE;  -- ✅ Nome válido
  ...
BEGIN
  current_occurrence_date := GREATEST(...);  -- ✅ Funciona
  ...
END;
```

---

## ✅ VALIDAÇÃO

- ✅ Variável renomeada para `current_occurrence_date`
- ✅ Todas as 5 ocorrências corrigidas
- ✅ Nome mais descritivo e semântico
- ✅ Não conflita com palavras reservadas

---

## 🎯 PRÓXIMO PASSO

**Aplicar Migration 3 novamente no Supabase:**

1. Abrir Supabase SQL Editor
2. Copiar conteúdo de `20260227000003_recurring_trainings.sql`
3. Colar e executar
4. **Deve funcionar agora!** ✅

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Pronto para aplicação


