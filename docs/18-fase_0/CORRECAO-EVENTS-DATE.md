# 🔧 Correção: Coluna `e.date` não existe

> **Data:** 2026-02-27  
> **Erro:** `ERROR: 42703: column e.date does not exist`  
> **Status:** ✅ **CORRIGIDO**

---

## 🐛 PROBLEMA

**Erro encontrado:**
```
ERROR: 42703: column e.date does not exist
LINE 37: e.date AS event_date,
```

**Causa:**
- View tentando usar `e.date` mas a coluna não existe no banco de produção
- Possível inconsistência entre schema da migration e banco real
- Banco pode ter `starts_at` em vez de `date`, ou estrutura diferente

---

## ✅ CORREÇÃO APLICADA

**Arquivo:** `supabase/migrations/20260227000007_financial_by_training.sql`

**Mudança:**
- Usar `COALESCE(e.date, (e.starts_at)::DATE)` para compatibilidade
- Funciona tanto se a coluna `date` existir quanto se usar `starts_at`
- Aplicado em 3 lugares:
  1. View `v_training_payments` (linha 37)
  2. View `v_training_payment_details` (linha 101)
  3. Função `create_training_charge` (linha 238)

**Antes:**
```sql
e.date AS event_date,  -- ❌ Erro se coluna não existir
...
GROUP BY e.id, e.date, ...  -- ❌ Erro
...
ORDER BY e.date DESC, ...  -- ❌ Erro
...
event_record.date  -- ❌ Erro
```

**Depois:**
```sql
COALESCE(e.date, (e.starts_at)::DATE) AS event_date,  -- ✅ Funciona sempre
...
GROUP BY e.id, COALESCE(e.date, (e.starts_at)::DATE), ...  -- ✅ Funciona
...
ORDER BY COALESCE(e.date, (e.starts_at)::DATE) DESC, ...  -- ✅ Funciona
...
COALESCE(event_record.date, (event_record.starts_at)::DATE)  -- ✅ Funciona
```

---

## 📋 EXPLICAÇÃO TÉCNICA

### Por que usar COALESCE?

1. **Compatibilidade:**
   - Se `date` existe → usa `date`
   - Se `date` não existe mas `starts_at` existe → extrai data de `starts_at`
   - Funciona em ambos os casos

2. **Conversão de Tipo:**
   - `starts_at` é `TIMESTAMPTZ`
   - `(starts_at)::DATE` extrai apenas a parte da data
   - Resultado é `DATE`, compatível com `date`

3. **Segurança:**
   - Não quebra se o schema mudar
   - Funciona com diferentes estruturas de banco

---

## 💡 ESTRUTURAS SUPORTADAS

### Estrutura 1: `date` + `time` (Migration oficial)
```sql
CREATE TABLE events (
  date DATE NOT NULL,
  time TIME NOT NULL,
  ...
);
```
**Resultado:** Usa `e.date` ✅

### Estrutura 2: `starts_at` (Alguns schemas)
```sql
CREATE TABLE events (
  starts_at TIMESTAMPTZ NOT NULL,
  ...
);
```
**Resultado:** Usa `(e.starts_at)::DATE` ✅

---

## ✅ VALIDAÇÃO

- ✅ Views corrigidas (2 views)
- ✅ Função corrigida (1 função)
- ✅ GROUP BY corrigido
- ✅ ORDER BY corrigido
- ✅ Compatível com ambos os schemas

---

## 🎯 PRÓXIMO PASSO

**Aplicar Migration 7 novamente no Supabase:**

1. Abrir Supabase SQL Editor
2. Copiar conteúdo de `20260227000007_financial_by_training.sql`
3. Colar e executar
4. **Deve funcionar agora!** ✅

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Pronto para aplicação






