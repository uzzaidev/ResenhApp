# ⚠️ IMPORTANTE: Aplicar Migration de Profiles Primeiro

> **Erro:** `relation "profiles" does not exist`  
> **Solução:** Aplicar migration de profiles ANTES das migrations V2.0

---

## 🐛 PROBLEMA

As migrations V2.0 referenciam `profiles(id)`, mas a tabela `profiles` não existe no banco.

**Causa:** Migration `20260127000002_auth_profiles.sql` não foi aplicada.

---

## ✅ SOLUÇÃO: Aplicar Migration de Profiles

### Passo 1: Verificar se profiles existe

Execute no Supabase SQL Editor:

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'profiles'
) AS profiles_existe;
```

**Se retornar `false`:** Continue com Passo 2  
**Se retornar `true`:** Profiles já existe, pode pular para migrations V2.0

---

### Passo 2: Aplicar Migration de Profiles

1. **Abrir arquivo:** `supabase/migrations/20260127000002_auth_profiles.sql`
2. **Copiar** TODO o conteúdo
3. **Colar** no Supabase SQL Editor
4. **Executar** (Run)

**⚠️ ATENÇÃO:** Esta migration cria a tabela `profiles` que referencia `auth.users(id)`.  
Se você não usa Supabase Auth, pode precisar ajustar.

---

### Passo 3: Verificar se funcionou

```sql
-- Verificar se tabela foi criada
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles') AS colunas
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- Verificar estrutura básica
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position
LIMIT 10;
```

**Resultado esperado:**
- ✅ Tabela `profiles` existe
- ✅ Coluna `id` é UUID
- ✅ Foreign key para `auth.users(id)`

---

### Passo 4: Continuar com Migrations V2.0

Após aplicar a migration de profiles, você pode continuar com:
- Migration 1: Sport Modalities ✅ (já aplicada)
- Migration 2: Athlete Modalities (agora deve funcionar!)

---

## 🔄 ALTERNATIVA: Se não usar Supabase Auth

Se você não usa Supabase Auth e tem apenas a tabela `users`, preciso corrigir as migrations V2.0 para usar `users` em vez de `profiles`.

**Me avise qual é o seu caso!**

---

**Última atualização:** 2026-02-27  
**Status:** ⏳ Aguardando aplicação da migration de profiles


