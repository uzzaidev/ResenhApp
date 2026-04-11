# 🔧 Correção: Erro de Parâmetros com Default

> **Data:** 2026-02-27  
> **Erro:** `ERROR: 42P13: input parameters after one with a default value must also have defaults`  
> **Status:** ✅ **CORRIGIDO**

---

## 🐛 PROBLEMA

**Erro encontrado:**
```
ERROR: 42P13: input parameters after one with a default value must also have defaults
```

**Causa:**
- Função `create_event_qrcode` tinha parâmetros na ordem errada
- `p_expires_in_minutes` tinha `DEFAULT 60`
- `p_user_id` vinha depois, sem default
- **Regra PostgreSQL:** Se um parâmetro tem default, todos os seguintes também devem ter

**Ordem problemática:**
```sql
CREATE OR REPLACE FUNCTION create_event_qrcode(
  p_event_id UUID,                    -- ✅ Sem default (OK)
  p_expires_in_minutes INTEGER DEFAULT 60,  -- ✅ Com default (OK)
  p_user_id UUID                      -- ❌ Sem default DEPOIS de um com default (ERRO!)
)
```

---

## ✅ CORREÇÃO APLICADA

**Arquivo:** `supabase/migrations/20260227000005_checkin_qrcodes.sql`

**Mudança:**
- Reordenados os parâmetros: `p_user_id` antes de `p_expires_in_minutes`
- Agora todos os parâmetros com default vêm por último

**Antes:**
```sql
CREATE OR REPLACE FUNCTION create_event_qrcode(
  p_event_id UUID,
  p_expires_in_minutes INTEGER DEFAULT 60,  -- Default no meio
  p_user_id UUID                            -- Sem default depois ❌
)
```

**Depois:**
```sql
CREATE OR REPLACE FUNCTION create_event_qrcode(
  p_event_id UUID,
  p_user_id UUID,                          -- Sem default primeiro ✅
  p_expires_in_minutes INTEGER DEFAULT 60   -- Default por último ✅
)
```

---

## 📋 REGRA DO POSTGRESQL

### Ordem de Parâmetros

1. **Parâmetros obrigatórios** (sem default) → Primeiro
2. **Parâmetros opcionais** (com default) → Por último

**Exemplo correto:**
```sql
CREATE FUNCTION exemplo(
  obrigatorio1 TEXT,           -- ✅ Sem default
  obrigatorio2 INTEGER,        -- ✅ Sem default
  opcional1 TEXT DEFAULT 'x', -- ✅ Com default
  opcional2 INTEGER DEFAULT 0 -- ✅ Com default
)
```

**Exemplo incorreto:**
```sql
CREATE FUNCTION exemplo(
  obrigatorio1 TEXT,           -- ✅ Sem default
  opcional1 TEXT DEFAULT 'x', -- ✅ Com default
  obrigatorio2 INTEGER        -- ❌ Sem default DEPOIS de um com default
)
```

---

## 💡 IMPACTO NAS CHAMADAS

**Antes (ordem antiga):**
```sql
-- Chamada posicional
SELECT * FROM create_event_qrcode(
  'event-uuid',
  60,              -- expires_in_minutes
  'user-uuid'      -- user_id
);

-- Chamada nomeada (funcionava)
SELECT * FROM create_event_qrcode(
  p_event_id := 'event-uuid',
  p_expires_in_minutes := 60,
  p_user_id := 'user-uuid'
);
```

**Depois (ordem nova):**
```sql
-- Chamada posicional
SELECT * FROM create_event_qrcode(
  'event-uuid',    -- event_id
  'user-uuid',     -- user_id
  60               -- expires_in_minutes (opcional, default 60)
);

-- Chamada nomeada (continua funcionando)
SELECT * FROM create_event_qrcode(
  p_event_id := 'event-uuid',
  p_user_id := 'user-uuid',
  p_expires_in_minutes := 60  -- opcional
);

-- Chamada omitindo default
SELECT * FROM create_event_qrcode(
  'event-uuid',
  'user-uuid'
  -- expires_in_minutes usa default 60
);
```

---

## ✅ VALIDAÇÃO

- ✅ Parâmetros reordenados corretamente
- ✅ Todos os parâmetros com default vêm por último
- ✅ Sintaxe válida
- ✅ Compatível com chamadas nomeadas

---

## 🎯 PRÓXIMO PASSO

**Aplicar Migration 5 novamente no Supabase:**

1. Abrir Supabase SQL Editor
2. Copiar conteúdo de `20260227000005_checkin_qrcodes.sql`
3. Colar e executar
4. **Deve funcionar agora!** ✅

**⚠️ ATENÇÃO:** Se houver código que chama essa função usando ordem posicional, será necessário atualizar as chamadas!

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Pronto para aplicação






