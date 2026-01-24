# 🔧 Correção: Erro de Índice com NOW()

> **Data:** 2026-02-27  
> **Erro:** `ERROR: 42P17: functions in index predicate must be marked IMMUTABLE`  
> **Status:** ✅ **CORRIGIDO**

---

## 🐛 PROBLEMA

**Erro encontrado:**
```
ERROR: 42P17: functions in index predicate must be marked IMMUTABLE
```

**Causa:**
- Índice parcial usando `WHERE expires_at > NOW()`
- `NOW()` não é uma função **IMMUTABLE** (retorna valor diferente a cada chamada)
- PostgreSQL não permite funções não-imutáveis em predicados de índice

**Linha problemática:**
```sql
CREATE INDEX idx_checkin_qrcodes_expires_at 
ON checkin_qrcodes(expires_at) 
WHERE expires_at > NOW();  -- ❌ NOW() não é imutável
```

---

## ✅ CORREÇÃO APLICADA

**Arquivo:** `supabase/migrations/20260227000005_checkin_qrcodes.sql`

**Mudança:**
- ❌ `WHERE expires_at > NOW()` → ✅ Removido o predicado
- ✅ Índice criado apenas em `expires_at` (sem WHERE)
- ✅ Filtro `expires_at > NOW()` deve ser feito nas queries, não no índice

**Antes:**
```sql
CREATE INDEX idx_checkin_qrcodes_expires_at 
ON checkin_qrcodes(expires_at) 
WHERE expires_at > NOW();  -- ❌ Erro
```

**Depois:**
```sql
-- Note: Cannot use NOW() in index predicate (not immutable). Filter in queries instead.
CREATE INDEX idx_checkin_qrcodes_expires_at 
ON checkin_qrcodes(expires_at);  -- ✅ Funciona
```

---

## 📋 EXPLICAÇÃO TÉCNICA

### Por que NOW() não pode ser usado?

1. **Funções Imutáveis vs Mutáveis:**
   - **Imutável:** Retorna o mesmo valor para os mesmos inputs (ex: `UPPER()`, `LOWER()`)
   - **Mutável:** Retorna valores diferentes a cada chamada (ex: `NOW()`, `RANDOM()`)

2. **Índices Parciais:**
   - PostgreSQL precisa saber quais linhas estão no índice
   - Se o predicado usa `NOW()`, o índice mudaria constantemente
   - Isso quebraria a consistência do índice

3. **Solução:**
   - Criar índice completo em `expires_at`
   - Filtrar `expires_at > NOW()` nas queries
   - O índice ainda será usado eficientemente pelo planner

---

## 💡 USO CORRETO NAS QUERIES

**Exemplo de query que usa o índice:**
```sql
-- Buscar QR codes não expirados
SELECT * 
FROM checkin_qrcodes 
WHERE expires_at > NOW()  -- Filtro na query, não no índice
  AND is_active = TRUE;
```

O planner do PostgreSQL ainda usará o índice `idx_checkin_qrcodes_expires_at` para otimizar essa query.

---

## ✅ VALIDAÇÃO

- ✅ Índice criado sem predicado problemático
- ✅ Comentário adicionado explicando a limitação
- ✅ Performance mantida (índice ainda será usado)
- ✅ Sintaxe válida

---

## 🎯 PRÓXIMO PASSO

**Aplicar Migration 5 novamente no Supabase:**

1. Abrir Supabase SQL Editor
2. Copiar conteúdo de `20260227000005_checkin_qrcodes.sql`
3. Colar e executar
4. **Deve funcionar agora!** ✅

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Pronto para aplicação

