# ⚡ QUICK FIX: Tabela Profiles Não Existe

> **Erro:** `ERROR: 42P01: relation "profiles" does not exist`  
> **Solução Rápida:** Aplicar migration de profiles ANTES das V2.0

---

## 🚀 SOLUÇÃO EM 3 PASSOS

### 1️⃣ Verificar se profiles existe

Execute no Supabase SQL Editor:

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'profiles'
) AS profiles_existe;
```

---

### 2️⃣ Se retornar `false`, aplicar migration de profiles

**Arquivo:** `supabase/migrations/20260127000002_auth_profiles.sql`

1. Abrir o arquivo
2. Copiar TODO o conteúdo
3. Colar no Supabase SQL Editor
4. Executar (Run)

**⚠️ IMPORTANTE:** Esta migration cria `profiles` que referencia `auth.users(id)`.  
Se você não usa Supabase Auth, me avise e eu ajusto as migrations V2.0 para usar `users`.

---

### 3️⃣ Verificar se funcionou

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'profiles';
```

**Deve retornar:** `profiles`

---

## ✅ Depois disso, continuar com Migration 2

Após aplicar a migration de profiles, a Migration 2 (`athlete_modalities`) deve funcionar!

---

**Status:** ⏳ Aguardando aplicação da migration de profiles


