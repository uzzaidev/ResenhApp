# 🔧 Solução: Tabela "profiles" não existe

> **Erro:** `ERROR: 42P01: relation "profiles" does not exist`

---

## 🐛 PROBLEMA

A migration está tentando referenciar `profiles(id)`, mas a tabela `profiles` não existe no banco de dados.

**Possíveis causas:**
1. Migration `20260127000002_auth_profiles.sql` não foi aplicada
2. Banco usa `users` em vez de `profiles`
3. Schema diferente do esperado

---

## ✅ SOLUÇÃO 1: Verificar qual tabela existe

Execute no Supabase SQL Editor:

```sql
-- Verificar se profiles existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'profiles'
) AS profiles_existe;

-- Verificar se users existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'users'
) AS users_existe;

-- Verificar se auth.users existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'auth' AND table_name = 'users'
) AS auth_users_existe;
```

---

## ✅ SOLUÇÃO 2: Aplicar Migration de Profiles Primeiro

Se `profiles` não existe, você precisa aplicar a migration que cria ela:

1. **Abrir:** `supabase/migrations/20260127000002_auth_profiles.sql`
2. **Copiar** todo o conteúdo
3. **Colar** no Supabase SQL Editor
4. **Executar**
5. **Depois** aplicar as migrations V2.0

---

## ✅ SOLUÇÃO 3: Usar `users` em vez de `profiles`

Se o banco usa `users` e não `profiles`, preciso corrigir as migrations V2.0 para usar `users`.

**Me avise qual tabela existe no seu banco e eu corrijo as migrations!**

---

## 🔍 VERIFICAÇÃO RÁPIDA

Execute este script para ver o que existe:

```sql
SELECT 
  table_name,
  (SELECT data_type FROM information_schema.columns 
   WHERE table_name = t.table_name AND column_name = 'id' LIMIT 1) AS id_tipo
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'users')
ORDER BY table_name;
```

---

**Próximo passo:** Me informe qual tabela existe e eu corrijo as migrations!






